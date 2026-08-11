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

export interface IdentityVerificationDetail extends IdentityVerificationRow {
  document_number: string;
  expiry_date: string | null;
  document_front: string | null;
  document_back: string | null;
  selfie: string | null;
  resume: string | null;
  rejection_reason: string;
  action_required_reason: string;
  admin_notes: string;
  reviewed_by_email: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstitutionVerificationDetail extends InstitutionVerificationRow {
  official_email: string;
  accreditation_document: string | null;
  authorization_letter: string | null;
  rejection_reason: string;
  action_required_reason: string;
  admin_notes: string;
  reviewed_by_email: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
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

export async function getIdentityVerificationDetail(
  id: number,
): Promise<IdentityVerificationDetail> {
  const res = (await apiGet(
    `/verification/admin/${id}/`,
  )) as ApiEnvelope<IdentityVerificationDetail>;
  if (!res.data) throw new Error("Verification not found.");
  return res.data;
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

export async function getInstitutionVerificationDetail(
  id: number,
): Promise<InstitutionVerificationDetail> {
  const res = (await apiGet(
    `/verification/admin/institution/${id}/`,
  )) as ApiEnvelope<InstitutionVerificationDetail>;
  if (!res.data) throw new Error("Verification not found.");
  return res.data;
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
