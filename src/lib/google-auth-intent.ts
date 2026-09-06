import type { GoogleUserType } from "./auth-api";

/**
 * Which role the user picked before being sent to Google. We leave the app
 * entirely during the redirect, so React state can't carry it — sessionStorage
 * bridges the gap and the callback clears it.
 */
export const GOOGLE_USER_TYPE_KEY = "cc_google_user_type";

/** Best-effort — a blocked sessionStorage just means the backend's default. */
export function rememberGoogleUserType(userType: GoogleUserType): void {
  try {
    sessionStorage.setItem(GOOGLE_USER_TYPE_KEY, userType);
  } catch {
    // Private mode / blocked storage — the callback falls back to learner.
  }
}
