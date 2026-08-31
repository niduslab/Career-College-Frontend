import { apiGet, apiPost } from "./api";
import { config } from "./config";
import type { PaginatedResponse } from "./course-api";

/**
 * A learner's issued certificate.
 *
 * `course_title` is the snapshot frozen at issue time (the record of what was
 * awarded); `course.title` is live and can differ after a rename. The two URLs
 * are server-relative paths — pass them through `certificateUrl` before use.
 */
export type CertificateStatus = "valid" | "revoked";

export interface LearnerCertificate {
  certificate_uid: string;
  /** Human-readable credential, e.g. "CC-2026-NEXTJS-000123". Printed on the PDF. */
  certificate_id: string | null;
  status: CertificateStatus;
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
  /** Absolute, frontend-facing URL. This is what the QR code encodes. */
  verification_url: string;
}

/**
 * Public verification payload.
 *
 * Every field is read from the certificate's frozen snapshot, not the live
 * course/profile rows — which is why a verified certificate never changes after
 * an instructor updates their signature or title.
 */
export interface PublicCertificate {
  certificate_id: string;
  certificate_uid: string;
  status: CertificateStatus;
  student: { name: string };
  course: {
    name: string;
    duration: string;
    learning_hours: number;
  };
  completion_date: string | null;
  issue_date: string;
  instructor: CertificateSignatory;
  authorized_signatory: CertificateSignatory;
  issuer: { name: string };
  verification_url: string;
  revoked_at: string | null;
}

export interface CertificateSignatory {
  name: string;
  designation: string;
  /** Server-relative media path — pass through `certificateUrl` before rendering. */
  signature_url: string | null;
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

/**
 * Public certificate lookup. Accepts either the human-readable credential
 * ("CC-2026-NEXTJS-000123") or the UUID, so a verifier can paste whichever they
 * hold. No auth required.
 *
 * A revoked certificate resolves normally with `status: "revoked"` — "exists but
 * revoked" is the answer a verifier needs. Only an unknown identifier 404s,
 * which surfaces as an ApiError with `.status === 404`.
 */
export async function verifyCertificate(
  identifier: string,
): Promise<PublicCertificate> {
  const res = await apiGet<PublicCertificate>(
    `/courses/certificates/verify/${encodeURIComponent(identifier)}/`,
  );
  if (!res.data) throw new Error("Certificate not found.");
  return res.data;
}

/** Absolute PDF download URL for a certificate UUID. */
export function certificateDownloadUrl(certificateUid: string): string {
  return certificateUrl(
    `/api/v1/courses/certificates/${certificateUid}/download/`,
  );
}

/** The public verify page on THIS app (not the backend API route). */
export function certificateVerifyPath(
  certificate: Pick<LearnerCertificate, "certificate_id" | "certificate_uid">,
): string {
  return `/verify/${certificate.certificate_id ?? certificate.certificate_uid}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Admin console
 * ──────────────────────────────────────────────────────────────────────────── */

/** Row in the admin certificate browser. Carries the revocation fields the
 *  learner-facing shapes omit, so an admin can see why and when. */
export interface AdminCertificate {
  certificate_uid: string;
  certificate_id: string | null;
  status: CertificateStatus;
  learner_name: string;
  course_title: string;
  issued_at: string;
  completion_date: string | null;
  revoked_at: string | null;
  revoked_reason: string;
  issuer_name: string;
  course: { id: number; title: string; slug: string };
}

export interface ListAdminCertificatesParams {
  search?: string;
  status?: CertificateStatus | "";
  sort?:
    | "issued_at"
    | "-issued_at"
    | "learner_name"
    | "-learner_name"
    | "course_title"
    | "-course_title";
  page?: number;
  page_size?: number;
}

function buildQuery(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

/** Platform-wide certificate list. Admin only. */
export async function listAdminCertificates(
  params: ListAdminCertificatesParams = {},
): Promise<PaginatedResponse<AdminCertificate>> {
  const res = await apiGet<PaginatedResponse<AdminCertificate>>(
    `/courses/admin/certificates/${buildQuery({ ...params })}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/**
 * Revoke a certificate. Changes only the verification verdict — the issued
 * snapshot is untouched, so the record of what was awarded survives.
 */
export async function revokeCertificate(
  certificateUid: string,
  reason: string,
): Promise<LearnerCertificate> {
  const res = await apiPost<LearnerCertificate>(
    `/courses/certificates/${certificateUid}/revoke/`,
    { reason },
  );
  return res.data as LearnerCertificate;
}

/** Lift a revocation, returning the certificate to valid. */
export async function restoreCertificate(
  certificateUid: string,
): Promise<LearnerCertificate> {
  const res = await apiPost<LearnerCertificate>(
    `/courses/certificates/${certificateUid}/restore/`,
    {},
  );
  return res.data as LearnerCertificate;
}
