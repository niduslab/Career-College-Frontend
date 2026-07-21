import type { AdminUser, AdminUserType } from "@/lib/admin-console-api";

export type UserRole = "Student" | "Instructor" | "Partner" | "Admin";
export type UserStatus = "Active" | "Suspended";

export interface PlatformUser {
  id: number;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joined: string;
  isEmailVerified: boolean;
}

export const ROLES: UserRole[] = ["Student", "Instructor", "Partner", "Admin"];
export const STATUSES: UserStatus[] = ["Active", "Suspended"];

const ROLE_LABEL: Record<AdminUserType, UserRole> = {
  learner: "Student",
  instructor: "Instructor",
  partner_institution: "Partner",
  admin: "Admin",
};

export const ROLE_TO_USER_TYPE: Record<UserRole, AdminUserType> = {
  Student: "learner",
  Instructor: "instructor",
  Partner: "partner_institution",
  Admin: "admin",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Map the backend's account row to the table's display shape. */
export function toPlatformUser(u: AdminUser): PlatformUser {
  return {
    id: u.id,
    name: u.full_name,
    initials: initialsOf(u.full_name),
    email: u.email,
    role: ROLE_LABEL[u.user_type] ?? "Student",
    status: u.is_restricted_by_admin ? "Suspended" : "Active",
    joined: u.registration_date?.slice(0, 10) ?? "",
    isEmailVerified: u.is_email_verified,
  };
}
