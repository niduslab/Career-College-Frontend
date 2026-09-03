import { apiGet, type ApiEnvelope } from "../api";
import { config } from "../config";

export interface WithMessage<T> {
  data: T;
  message?: string;
}

export function withMessage<T>(res: ApiEnvelope<T>): WithMessage<T> {
  return {
    data: res.data as T,
    message: typeof res.message === "string" ? res.message : undefined,
  };
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseStatus =
  | "draft"
  | "under_review"
  | "institution_review"
  | "published"
  | "rejected"
  | "archived";
export type DeliveryMode = "self_paced" | "scheduled";

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  children: CourseCategory[];
}

export interface CourseBrief {
  id: number;
  full_name: string;
  email: string;
}

/** Fetch active course categories (public, no auth required). Follows
 *  pagination so every category is returned, not just the first page. */
export async function getCourseCategories(): Promise<CourseCategory[]> {
  const all: CourseCategory[] = [];
  let path: string | null = "/courses/categories/";
  while (path) {
    const res = await apiGet<{
      results: CourseCategory[];
      next: string | null;
    }>(path);
    const data = res.data as unknown as {
      results?: CourseCategory[];
      next?: string | null;
    };
    all.push(...(data?.results ?? []));
    // `next` is an absolute URL from DRF; reduce it to a path relative to the
    // API base so apiGet can re-prepend the base. Null = no more pages.
    const next = data?.next ?? null;
    if (next) {
      const nextUrl = new URL(next);
      const basePath = new URL(config.apiBaseUrl).pathname;
      path = nextUrl.pathname.replace(basePath, "") + nextUrl.search;
    } else {
      path = null;
    }
  }
  return all;
}

// Public catalog

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function apiOrigin(): string {
  return config.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
}

/**
 * Playback URL for a video lecture's HLS master playlist.
 *
 * In production this hits CloudFront, and the same response carries the three
 * `CloudFront-*` signed cookies that authorize every `.m3u8` and `.ts` fetch
 * (`apiGet` sends `credentials: "include"`, so the browser stores them). The
 * player must then send those cookies back — see `VideoPlayer`'s `xhrSetup`.
 *
 * Never build this URL from `stream_master_playlist` by hand: that value is a
 * storage-relative key, and an unsigned CloudFront request is rejected with a
 * 403 that surfaces in the browser as a CORS error.
 *
 * Throws when the video isn't transcoded yet (422) or the caller has no access
 * (404); callers treat that as "no video".
 */
export async function getLectureStreamUrl(lectureId: number): Promise<string> {
  const res = await apiGet<{ streamUrl: string }>(
    `/courses/lectures/${lectureId}/stream/`,
  );
  const url = (res.data as { streamUrl: string }).streamUrl;
  // Local dev has no CloudFront, so the backend falls back to a root-relative
  // storage path ("/media/..."). Resolve it against the API host — relative to
  // the page it would point at the frontend origin. Absolute CloudFront URLs
  // pass through untouched.
  return /^https?:\/\//i.test(url) ? url : `${apiOrigin()}${url}`;
}

export type CodingLanguage = "python" | "javascript" | "cpp" | "java";
export type LectureType = "video" | "article";
export type SectionItemType = "lecture" | "quiz" | "coding" | "assignment";
export type CurriculumItemType = "lecture" | "quiz" | "coding" | "assignment";
