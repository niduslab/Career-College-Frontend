"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Calendar, ShieldCheck, ShieldAlert } from "lucide-react";
import { SectionCard } from "../../settings-shared/ui";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";
import {
  useAdminUser,
  useSuspendUser,
  useReactivateUser,
  useChangeUserRole,
} from "@/hooks/use-admin-users";
import { ROLE_TO_USER_TYPE, ROLES, toPlatformUser, UserRole } from "./data";

const ROLE_BADGE: Record<UserRole, string> = {
  Student: "bg-blue-50 text-blue-600",
  Instructor: "bg-purple-50 text-purple-600",
  Partner: "bg-orange-50 text-orange-500",
  Admin: "bg-(--primary-50) text-(--primary-600)",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-(--gray-100) last:border-0">
      <p className="text-[13px] text-(--gray-500)">{label}</p>
      <div className="text-[13px] font-medium text-(--text-title)">{value}</div>
    </div>
  );
}

export default function UserDetail({ userId }: { userId: number }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useAdminUser(userId);

  const suspend = useSuspendUser();
  const reactivate = useReactivateUser();
  const changeRole = useChangeUserRole();

  const busy = suspend.isPending || reactivate.isPending || changeRole.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading user…
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <p className="text-[14px] text-(--gray-500)">User not found.</p>
        <button
          onClick={() => router.push("/dashboard/admin/users")}
          className="text-[13px] font-medium text-(--primary-600) hover:underline cursor-pointer"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const display = toPlatformUser(user);
  const suspended = user.is_restricted_by_admin;

  const handleToggleSuspend = () => {
    if (suspended) {
      reactivate.mutate(user.id, {
        onSuccess: () => notify.success(`${user.full_name} reactivated.`),
        onError: (err) =>
          notify.error(err instanceof ApiError ? err.detail : "Failed to reactivate user."),
      });
    } else {
      suspend.mutate(
        { id: user.id },
        {
          onSuccess: () => notify.success(`${user.full_name} suspended.`),
          onError: (err) =>
            notify.error(err instanceof ApiError ? err.detail : "Failed to suspend user."),
        },
      );
    }
  };

  const handleChangeRole = (role: UserRole) => {
    changeRole.mutate(
      { id: user.id, user_type: ROLE_TO_USER_TYPE[role] },
      {
        onSuccess: () => notify.success(`Role changed to ${role}.`),
        onError: (err) =>
          notify.error(err instanceof ApiError ? err.detail : "Failed to change role."),
      },
    );
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push("/dashboard/admin/users")}
        className="flex items-center gap-1.5 text-[13px] font-medium text-(--gray-500) hover:text-(--text-title) transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      <SectionCard title="Account Overview">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-(--primary-100) text-(--primary-700) text-[18px] font-bold flex items-center justify-center shrink-0">
              {display.initials}
            </div>
            <div>
              <p className="text-[16px] font-semibold text-(--text-title)">{user.full_name}</p>
              <p className="text-[13px] text-(--gray-500) flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[display.role]}`}
                >
                  {display.role}
                </span>
                <span
                  className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    suspended ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {suspended ? "Suspended" : "Active"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSuspend}
              disabled={busy || user.is_staff || user.user_type === "admin"}
              title={
                user.is_staff || user.user_type === "admin"
                  ? "Administrator accounts cannot be suspended here."
                  : undefined
              }
              className={`flex items-center gap-1.5 h-9 px-4 rounded-md text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                suspended
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : suspended ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              {suspended ? "Reactivate" : "Suspend"}
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Account Details">
        <Row label="User ID" value={`#${user.id}`} />
        <Row label="Slug" value={user.name_slug} />
        <Row
          label="Registered"
          value={
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-(--gray-400)" />
              {display.joined}
            </span>
          }
        />
        <Row label="Email verified" value={user.is_email_verified ? "Yes" : "No"} />
        <Row label="Profile verified" value={user.is_verified ? "Yes" : "No"} />
        <Row label="Account active" value={user.is_active ? "Yes" : "No"} />
        {user.is_deleted && (
          <>
            <Row label="Deleted at" value={user.deleted_at ?? "—"} />
            <Row label="Deletion reason" value={user.deletion_reason || "—"} />
          </>
        )}
      </SectionCard>

      <SectionCard
        title="Change Role"
        description="Switching roles provisions the matching profile. Cannot change your own role."
      >
        <div className="flex items-center gap-2 flex-wrap">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => handleChangeRole(role)}
              disabled={busy || role === display.role}
              className={`h-9 px-4 rounded-md text-[13px] font-medium border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                role === display.role
                  ? "bg-(--primary-600) border-(--primary-600) text-white"
                  : "border-(--gray-200) text-(--gray-600) hover:bg-(--gray-50)"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
