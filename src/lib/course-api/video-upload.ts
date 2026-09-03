import { apiPost, ApiError } from "../api";

/**
 * Direct-to-S3 multipart upload for lecture videos.
 *
 * The file never passes through Django. The backend only brokers signatures:
 * it opens the multipart upload, signs one PUT URL per part, and finalises.
 * The bytes go browser → S3.
 *
 *   initiate → (part-url → PUT part) × N → complete → transcoding starts
 *
 * S3 bucket CORS must expose the `ETag` response header, or the browser hides
 * it from JS and `complete` has nothing to send. See the architecture doc.
 */

/** S3's hard cap on parts in one multipart upload. */
const S3_MAX_PARTS = 10_000;
/** S3 rejects any part but the last below 5 MiB. */
const S3_MIN_PART_SIZE = 5 * 1024 * 1024;
/** Parts uploaded at once. Enough to saturate a typical uplink without
 *  opening so many sockets that each one crawls. */
const PART_CONCURRENCY = 4;
/** Retries per part before the whole upload is abandoned. */
const PART_RETRIES = 2;

interface InitiateResponse {
  videoAssetId: number;
  uploadId: string;
  objectKey: string;
  partSize: number;
  maxParts: number;
}

interface CompletedPart {
  partNumber: number;
  etag: string;
}

export interface VideoUploadHandle {
  videoAssetId: number;
}

export interface VideoUploadOptions {
  /** 0–1, fired as bytes land in S3. */
  onProgress?: (fraction: number) => void;
  /** Abort the upload; the in-flight S3 multipart upload is cleaned up. */
  signal?: AbortSignal;
}

/**
 * PUT one part to its presigned URL.
 *
 * XHR rather than fetch: fetch cannot report upload progress, and a large
 * lecture uploading with no feedback reads as a hung page.
 *
 * `withCredentials` stays false — a presigned URL carries its own
 * authorization, and S3 cannot answer a credentialed CORS request (it never
 * sends `Access-Control-Allow-Credentials`), so attaching cookies would fail
 * the preflight outright. Content-Type is likewise left unset: the URL was
 * signed without it, and a sliced Blob has no type, so the browser sends none.
 */
function putPart(
  url: string,
  body: Blob,
  onBytes: (loaded: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.withCredentials = false;

    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort);
    const cleanup = () => signal?.removeEventListener("abort", onAbort);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onBytes(e.loaded);
    };
    xhr.onload = () => {
      cleanup();
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`S3 rejected part upload (HTTP ${xhr.status}).`));
        return;
      }
      // Requires `ExposeHeaders: ["ETag"]` in the bucket's CORS rule —
      // ETag is not a CORS-safelisted response header, so without it this
      // reads as null even though the part uploaded fine.
      const etag = xhr.getResponseHeader("ETag");
      if (!etag) {
        reject(
          new Error(
            "S3 did not return a readable ETag. The bucket's CORS rule must expose the ETag header.",
          ),
        );
        return;
      }
      resolve(etag);
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("Network error while uploading to S3."));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Upload cancelled.", "AbortError"));
    };

    xhr.send(body);
  });
}

/** Part size that keeps the count under S3's 10 000 limit for this file. */
function resolvePartSize(fileSize: number, serverPartSize: number): number {
  const floor = Math.max(serverPartSize, S3_MIN_PART_SIZE);
  const needed = Math.ceil(fileSize / S3_MAX_PARTS);
  return Math.max(floor, needed);
}

/**
 * Upload a lecture video straight to S3 and hand it to the transcoder.
 *
 * Resolves once the backend has finalised the object and queued transcoding —
 * the lecture is `processing` at that point, not `ready`. Poll the lecture for
 * `active_video_asset.status`.
 *
 * Any failure aborts the S3 upload so no dangling parts or half-live
 * VideoAsset row is left behind.
 */
export async function uploadLectureVideoToS3(
  lectureId: number,
  file: File,
  options: VideoUploadOptions = {},
): Promise<VideoUploadHandle> {
  const { onProgress, signal } = options;

  const initiated = await apiPost<InitiateResponse>(
    `/courses/lectures/${lectureId}/video/initiate-upload/`,
    {
      filename: file.name,
      content_type: file.type || "video/mp4",
      file_size: file.size,
    },
  );
  // `objectKey` comes back for debugging only. The backend stamps the key on
  // the VideoAsset row at initiate and reads it from there on every later
  // step, so sending one back would be ignored.
  const { videoAssetId, uploadId, partSize } =
    initiated.data as InitiateResponse;

  const effectivePartSize = resolvePartSize(file.size, partSize);
  const partCount = Math.max(1, Math.ceil(file.size / effectivePartSize));

  // Bytes confirmed per part, so a retried part doesn't double-count and the
  // total can never run backwards.
  const bytesPerPart = new Array<number>(partCount).fill(0);
  const reportProgress = () => {
    if (!onProgress) return;
    const done = bytesPerPart.reduce((sum, n) => sum + n, 0);
    onProgress(Math.min(1, done / file.size));
  };

  const abortUpload = async () => {
    try {
      await apiPost(`/courses/video-assets/${videoAssetId}/abort-upload/`, {
        uploadId,
      });
    } catch {
      // Best-effort. The backend marks the asset failed regardless, and S3's
      // lifecycle rule reaps the orphaned parts.
    }
  };

  try {
    const parts: CompletedPart[] = new Array(partCount);
    let nextIndex = 0;

    const worker = async () => {
      for (;;) {
        const index = nextIndex++;
        if (index >= partCount) return;
        if (signal?.aborted) {
          throw new DOMException("Upload cancelled.", "AbortError");
        }

        const partNumber = index + 1;
        const start = index * effectivePartSize;
        const blob = file.slice(start, Math.min(start + effectivePartSize, file.size));

        let lastError: unknown;
        for (let attempt = 0; attempt <= PART_RETRIES; attempt++) {
          try {
            // Signed per attempt — a retry after a long stall could otherwise
            // present a URL that has already expired.
            const signed = await apiPost<{ presignedUrl: string }>(
              `/courses/video-assets/${videoAssetId}/part-url/`,
              { uploadId, partNumber },
            );
            const { presignedUrl } = signed.data as { presignedUrl: string };

            const etag = await putPart(
              presignedUrl,
              blob,
              (loaded) => {
                bytesPerPart[index] = loaded;
                reportProgress();
              },
              signal,
            );
            bytesPerPart[index] = blob.size;
            reportProgress();
            parts[index] = { partNumber, etag };
            lastError = undefined;
            break;
          } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") throw err;
            lastError = err;
            bytesPerPart[index] = 0;
            reportProgress();
          }
        }
        if (lastError) throw lastError;
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(PART_CONCURRENCY, partCount) }, worker),
    );

    await apiPost(`/courses/video-assets/${videoAssetId}/complete-upload/`, {
      uploadId,
      parts,
    });

    onProgress?.(1);
    return { videoAssetId };
  } catch (err) {
    await abortUpload();
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err instanceof Error ? err.message : "Video upload failed.",
      0,
    );
  }
}
