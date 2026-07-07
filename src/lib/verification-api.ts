import { apiGet, apiPatch, apiPost } from "./api";

export type VerificationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "action_required"
  | "expired";

export interface Verification {
  id: number;
  document_type: string;
  document_number: string;
  issuing_country: string;
  expiry_date: string | null;
  document_front: string | null;
  document_back: string | null;
  selfie: string | null;
  resume: string | null;
  status: VerificationStatus;
  rejection_reason: string;
  action_required_reason: string;
  reviewed_by_email: string | null;
  reviewed_at: string | null;
  created_at: string;
  submitted_at: string | null;
  updated_at: string;
}

export interface VerificationTextUpdate {
  document_type?: string;
  document_number?: string;
  issuing_country?: string;
  expiry_date?: string | null;
}

/** `document_type` options. */
export const DOCUMENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "national_id", label: "National ID Card" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "residence_permit", label: "Residence Permit" },
];

/** List all of the current instructor's verification requests, most recent first. */
export async function getMyVerifications(): Promise<Verification[]> {
  const res = await apiGet<Verification[]>("/verification/my/");
  return (res.data ?? []) as Verification[];
}

/** Create a new draft verification request. `data` fields are all optional. */
export async function createDraftVerification(
  data: VerificationTextUpdate = {},
): Promise<Verification> {
  const res = await apiPost<Verification>("/verification/create/", data);
  return res.data as Verification;
}

/** Update text fields on a draft / action_required verification. */
export async function updateVerification(
  id: number,
  patch: VerificationTextUpdate,
): Promise<Verification> {
  const res = await apiPatch<Verification>(
    `/verification/${id}/update/`,
    patch,
  );
  return res.data as Verification;
}

/** Upload one or more verification documents. Pass only the files being changed. */
export async function uploadVerificationDocs(
  id: number,
  files: {
    document_front?: File;
    document_back?: File;
    selfie?: File;
    resume?: File;
  },
): Promise<Verification> {
  const form = new FormData();
  if (files.document_front) form.append("document_front", files.document_front);
  if (files.document_back) form.append("document_back", files.document_back);
  if (files.selfie) form.append("selfie", files.selfie);
  if (files.resume) form.append("resume", files.resume);
  const res = await apiPatch<Verification>(`/verification/${id}/update/`, form);
  return res.data as Verification;
}

/** Submit a draft / action_required verification for admin review. */
export async function submitVerification(id: number): Promise<Verification> {
  const res = await apiPost<Verification>(`/verification/${id}/submit/`, {});
  return res.data as Verification;
}
