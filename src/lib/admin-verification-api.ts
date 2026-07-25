import { apiGet, apiPost, type ApiEnvelope } from "./api";
import type { PaginatedResult } from "./admin-console-api";

export type VerificationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "action_required"
  | "expired";

export interface IdentityVerificationRow {
  id: number;
  instructor_name: string;
  instructor_email: string;
  document_type: string;
  issuing_country: string;
  status: VerificationStatus;
  submitted_at: string | null;
}

export interface InstitutionVerificationRow {
  id: number;
  institution_name: string;
  institution_slug: string;
  registration_number: string;
  issuing_authority: string;
  status: VerificationStatus;
  submitted_at: string | null;
}

export type VerificationAction =
  | "pick_up"
  | "approve"
  | "reject"
  | "request_action"
  | "expire";

export interface ReviewArgs {
  action: VerificationAction;
  rejectionReason?: string;
  actionRequiredReason?: string;
  adminNotes?: string;
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

export async function listIdentityVerifications(
  status?: VerificationStatus,
): Promise<PaginatedResult<IdentityVerificationRow>> {
  const res = (await apiGet(
    `/verification/admin/list/${buildQuery({ status })}`,
  )) as ApiEnvelope<PaginatedResult<IdentityVerificationRow>>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function reviewIdentityVerification(
  id: number,
  args: ReviewArgs,
): Promise<unknown> {
  const res = await apiPost(`/verification/admin/${id}/review/`, {
    action: args.action,
    rejection_reason: args.rejectionReason,
    action_required_reason: args.actionRequiredReason,
    admin_notes: args.adminNotes,
  });
  return res.data;
}

export async function listInstitutionVerifications(
  status?: VerificationStatus,
): Promise<PaginatedResult<InstitutionVerificationRow>> {
  const res = (await apiGet(
    `/verification/admin/institution/list/${buildQuery({ status })}`,
  )) as ApiEnvelope<PaginatedResult<InstitutionVerificationRow>>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function reviewInstitutionVerification(
  id: number,
  args: ReviewArgs,
): Promise<unknown> {
  const res = await apiPost(`/verification/admin/institution/${id}/review/`, {
    action: args.action,
    rejection_reason: args.rejectionReason,
    action_required_reason: args.actionRequiredReason,
    admin_notes: args.adminNotes,
  });
  return res.data;
}
