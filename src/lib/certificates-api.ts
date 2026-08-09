import { apiGet } from "./api";
import { config } from "./config";
import type { PaginatedResponse } from "./course-api";

/**
 * A learner's issued certificate.
 *
 * `course_title` is the snapshot frozen at issue time (the record of what was
 * awarded); `course.title` is live and can differ after a rename. The two URLs
 * are server-relative paths — pass them through `certificateUrl` before use.
 */
export interface LearnerCertificate {
  certificate_uid: string;
  learner_name: string;
  course_title: string;
  issued_at: string;
  course: {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
  };
  download_url: string;
  verify_url: string;
}

/** Absolutise a relative certificate URL against the API origin.
 *  The backend returns `/api/v1/courses/...`, and `config.apiBaseUrl` already
 *  ends in `/api/v1`, so the base's path segment is stripped first. */
export function certificateUrl(relativePath: string): string {
  if (/^https?:\/\//.test(relativePath)) return relativePath;
  const origin = config.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return `${origin}${relativePath}`;
}

export interface CertificateListParams {
  page?: number;
  page_size?: number;
}

/** List the caller's own certificates, newest first. */
export async function getMyCertificates(
  params: CertificateListParams = {},
): Promise<PaginatedResponse<LearnerCertificate>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  const res = await apiGet<PaginatedResponse<LearnerCertificate>>(
    `/courses/my-certificates/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}
