import { apiGet, apiPatch } from "./api";

/**
 * Platform-wide branding and the default certificate authorized signatory.
 *
 * A singleton on the backend. Used for certificates on every course that is not
 * institution-owned (an institution with its own signatory configured takes
 * precedence).
 *
 * Path is under `/admin-console`, so `apiPatch` attaches the CSRF header
 * automatically.
 */
export interface PlatformSettings {
  organization_name: string;
  authorized_signatory_name: string;
  authorized_signatory_designation: string;
  authorized_signature: string | null;
  updated_at: string;
}

export interface PlatformSettingsUpdate {
  organization_name?: string;
  authorized_signatory_name?: string;
  authorized_signatory_designation?: string;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const res = await apiGet<PlatformSettings>(
    "/admin-console/platform-settings/",
  );
  return res.data as PlatformSettings;
}

export async function updatePlatformSettings(
  patch: PlatformSettingsUpdate,
): Promise<PlatformSettings> {
  const res = await apiPatch("/admin-console/platform-settings/", patch);
  return res.data as PlatformSettings;
}

/**
 * Upload/replace the platform authorized signature. Pass `null` to clear.
 * Only affects certificates issued from now on.
 */
export async function updatePlatformSignature(
  file: File | null,
): Promise<PlatformSettings> {
  const form = new FormData();
  form.append("authorized_signature", file ?? "");
  const res = await apiPatch("/admin-console/platform-settings/", form);
  return res.data as PlatformSettings;
}
