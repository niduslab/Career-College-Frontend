import { apiPost, apiGet } from "./api";
import { setLoggedIn } from "./session";
import type { SignUpFormData } from "@/types/auth";

export interface RegisterResponse {
  user_id: number;
  email: string;
  full_name: string;
  user_type: string;
  is_email_verified: boolean;
  is_verified: boolean;
}

export async function register(
  form: SignUpFormData,
): Promise<RegisterResponse> {
  const payload: Record<string, unknown> = {
    email: form.email,
    full_name: form.full_name,
    password: form.password,
    confirm_password: form.confirm_password,
    user_type: form.user_type,
  };

  if (form.user_type === "partner_institution") {
    payload.institution_name = form.institution_name;
    payload.institution_type = form.institution_type;
  }

  const res = await apiPost<RegisterResponse>("/auth/register/", payload);
  return res.data as RegisterResponse;
}

export interface AuthUser {
  user_id: number;
  email: string;
  full_name: string;
  user_type: string;
  is_email_verified?: boolean;
  /** staff/superuser flag — admins land on the admin dashboard. */
  is_staff?: boolean;
}

/** True for any account the backend treats as a platform admin (`is_staff` or `user_type === "admin"`). */
export function isAdminUser(
  user: Pick<AuthUser, "user_type" | "is_staff">,
): boolean {
  return Boolean(user.is_staff) || user.user_type === "admin";
}

/** Map a user to their role-specific dashboard landing route. */
export function dashboardPathFor(
  user: Pick<AuthUser, "user_type" | "is_staff">,
): string {
  if (isAdminUser(user)) return "/dashboard/admin";
  switch (user.user_type) {
    case "instructor":
      return "/dashboard/instructor";
    case "partner_institution":
      return "/dashboard/partnership";
    case "learner":
    default:
      return "/dashboard/learner";
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await apiPost<AuthUser>("/auth/login/", { email, password });
  setLoggedIn(true);
  return res.data as AuthUser;
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await apiGet<{
      user: Omit<AuthUser, "user_id"> & { id: number };
    }>("/auth/profile/me/");
    const user = res.data?.user;
    setLoggedIn(true);
    return user ? { ...user, user_id: user.id } : null;
  } catch {
    setLoggedIn(false);
    return null;
  }
}

export async function fetchAdminSession(): Promise<AuthUser | null> {
  try {
    const res = await apiGet<AuthUser>("/admin-console/auth/session/");
    setLoggedIn(true);
    return (res.data ?? null) as AuthUser | null;
  } catch {
    setLoggedIn(false);
    return null;
  }
}

export type OtpPurpose = "registration" | "password_reset";

/** Data returned when verifying a `password_reset` OTP  . */
export interface VerifyOtpResponse {
  user_id?: number;
  email?: string;
  purpose?: string;
  /** Present only for `password_reset` — feed into `resetPassword` . */
  reset_token?: string;
  token_expires_in?: string;
}

export async function verifyOtp(
  email: string,
  otp: string,
  purpose: OtpPurpose = "registration",
): Promise<VerifyOtpResponse> {
  const res = await apiPost<VerifyOtpResponse>("/auth/otp/verify/", {
    email,
    otp,
    purpose,
  });
  return (res.data ?? {}) as VerifyOtpResponse;
}

/** Resend an OTP. */
export async function resendOtp(
  email: string,
  purpose: OtpPurpose = "registration",
): Promise<void> {
  await apiPost("/auth/otp/resend/", { email, purpose });
}

/** Request a password-reset OTP . */
export async function forgotPassword(email: string): Promise<void> {
  await apiPost("/auth/password/forgot/", { email });
}

/**
 * Reset a password using the `reset_token` from `verifyOtp`  .
 */
export async function resetPassword(args: {
  email: string;
  reset_token: string;
  new_password: string;
  confirm_password: string;
}): Promise<void> {
  await apiPost("/auth/password/reset/", args);
}

export async function changePassword(args: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<void> {
  await apiPost("/auth/password/change/", args);
}

export async function logout(): Promise<void> {
  try {
    await apiPost("/auth/logout/", {});
  } catch {
  } finally {
    setLoggedIn(false);
  }
}
