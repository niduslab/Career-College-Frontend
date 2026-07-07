import { apiGet, apiPatch, apiPost } from "./api";

export type InstitutionVerificationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "action_required";

export interface InstitutionVerification {
  id: number;
  registration_number: string;
  issuing_authority: string;
  official_email: string;
  accreditation_document: string | null;
  authorization_letter: string | null;
  status: InstitutionVerificationStatus;
  rejection_reason: string;
  action_required_reason: string;
  reviewed_by_email: string | null;
  reviewed_at: string | null;
  created_at: string;
  submitted_at: string | null;
  updated_at: string;
}

export interface InstitutionVerificationTextUpdate {
  registration_number?: string;
  issuing_authority?: string;
  official_email?: string;
}

/** List all of the current institution's verification requests, most recent first. */
export async function getMyInstitutionVerifications(): Promise<
  InstitutionVerification[]
> {
  const res = await apiGet<InstitutionVerification[]>(
    "/verification/institution/my/",
  );
  return (res.data ?? []) as InstitutionVerification[];
}

/** Create a new draft institution verification request. `data` fields are all optional. */
export async function createDraftInstitutionVerification(
  data: InstitutionVerificationTextUpdate = {},
): Promise<InstitutionVerification> {
  const res = await apiPost<InstitutionVerification>(
    "/verification/institution/create/",
    data,
  );
  return res.data as InstitutionVerification;
}

/** Update text fields on a draft / action_required institution verification. */
export async function updateInstitutionVerification(
  id: number,
  patch: InstitutionVerificationTextUpdate,
): Promise<InstitutionVerification> {
  const res = await apiPatch<InstitutionVerification>(
    `/verification/institution/${id}/update/`,
    patch,
  );
  return res.data as InstitutionVerification;
}

/** Upload one or both institution verification documents. Pass only the files being changed. */
export async function uploadInstitutionVerificationDocs(
  id: number,
  files: {
    accreditation_document?: File;
    authorization_letter?: File;
  },
): Promise<InstitutionVerification> {
  const form = new FormData();
  if (files.accreditation_document)
    form.append("accreditation_document", files.accreditation_document);
  if (files.authorization_letter)
    form.append("authorization_letter", files.authorization_letter);
  const res = await apiPatch<InstitutionVerification>(
    `/verification/institution/${id}/update/`,
    form,
  );
  return res.data as InstitutionVerification;
}

/** Submit a draft / action_required institution verification for admin review. */
export async function submitInstitutionVerification(
  id: number,
): Promise<InstitutionVerification> {
  const res = await apiPost<InstitutionVerification>(
    `/verification/institution/${id}/submit/`,
    {},
  );
  return res.data as InstitutionVerification;
}
