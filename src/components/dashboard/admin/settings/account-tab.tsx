"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, Monitor } from "lucide-react";
import { SectionCard, Field, AsyncSaveButton } from "../../settings-shared/ui";
import {
  useAdminSessions,
  useRevokeAdminSession,
  useRevokeOtherAdminSessions,
} from "@/hooks/use-admin-sessions";
import { changePassword } from "@/lib/auth-api";
import { validatePassword } from "@/lib/validation";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AccountTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [pw, setPw] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwErrors, setPwErrors] = useState<
    Partial<Record<keyof typeof pw, string>>
  >({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const setPwField = (k: keyof typeof pw, v: string) => {
    setPw((p) => ({ ...p, [k]: v }));
    setPwErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleChangePassword = async () => {
    const next: Partial<Record<keyof typeof pw, string>> = {};
    if (!pw.current_password)
      next.current_password = "Current password is required";
    const strength = validatePassword(pw.new_password);
    if (strength) next.new_password = strength;
    if (pw.new_password && pw.new_password === pw.current_password)
      next.new_password = "New password must be different from current";
    if (pw.new_password !== pw.confirm_password)
      next.confirm_password = "Passwords do not match";
    if (Object.keys(next).length > 0) {
      setPwErrors(next);
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(pw);
      notify.success("Password updated successfully.");
      setPw({ current_password: "", new_password: "", confirm_password: "" });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        const fe: Partial<Record<keyof typeof pw, string>> = {};
        if (err.fieldErrors.current_password)
          fe.current_password = err.fieldErrors.current_password;
        if (err.fieldErrors.new_password)
          fe.new_password = err.fieldErrors.new_password;
        if (err.fieldErrors.confirm_password)
          fe.confirm_password = err.fieldErrors.confirm_password;
        if (Object.keys(fe).length > 0) setPwErrors(fe);
        notify.error(err.message);
      } else {
        notify.error("Failed to change password.");
      }
    } finally {
      setPwSaving(false);
    }
  };

  const { data: sessions, isLoading: sessionsLoading, isError: sessionsError } = useAdminSessions();
  const revokeSession = useRevokeAdminSession();
  const revokeOthers = useRevokeOtherAdminSessions();

  const handleRevoke = (id: number, label: string) => {
    revokeSession.mutate(id, {
      onSuccess: () => notify.success(`Signed out of "${label}".`),
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to revoke session."),
    });
  };

  const handleRevokeOthers = () => {
    revokeOthers.mutate(undefined, {
      onSuccess: (revoked) =>
        notify.success(
          revoked === 0 ? "No other sessions to sign out of." : `Signed out of ${revoked} other session(s).`,
        ),
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to sign out other sessions."),
    });
  };

  return (
    <div className="space-y-4">
      {/* Change password */}
      <SectionCard
        title="Change Password"
        description="Use a strong password you don't use elsewhere."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Current password" error={pwErrors.current_password}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
              <input
                type={showCurrent ? "text" : "password"}
                value={pw.current_password}
                onChange={(e) => setPwField("current_password", e.target.value)}
                placeholder="Enter current password"
                className="w-full h-11 pl-9 pr-10 text-[14px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400) cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <Field label="New password" error={pwErrors.new_password}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
              <input
                type={showNew ? "text" : "password"}
                value={pw.new_password}
                onChange={(e) => setPwField("new_password", e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-11 pl-9 pr-10 text-[14px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400) cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <div>
            <Field label="Confirm password" error={pwErrors.confirm_password}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={pw.confirm_password}
                  onChange={(e) => setPwField("confirm_password", e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-11 pl-9 pr-10 text-[14px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400) cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </div>
        </div>
        <div className="flex justify-start pt-2">
          <AsyncSaveButton
            onClick={handleChangePassword}
            saving={pwSaving}
            saved={pwSaved}
          />
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard
        title="Active Sessions"
        description="Devices currently signed in to your admin account."
      >
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-8 text-(--gray-400)">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : sessionsError ? (
          <p className="text-[13px] text-red-500 text-center py-6">
            Failed to load your sessions.
          </p>
        ) : !sessions || sessions.length === 0 ? (
          <p className="text-[13px] text-(--gray-400) text-center py-6">
            No active sessions found.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((s) => {
                const label = `${s.browser || "Unknown browser"} on ${s.os || "Unknown OS"}`;
                const busy = revokeSession.isPending && revokeSession.variables === s.id;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-2 border-b border-(--gray-100) last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-(--gray-100) text-(--gray-500) flex items-center justify-center shrink-0">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-semibold text-(--text-title) truncate">
                            {label}
                            {s.device ? ` · ${s.device}` : ""}
                          </p>
                          {s.is_current && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 shrink-0">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-(--gray-400) mt-0.5">
                          {s.ip_address} · {timeAgo(s.last_seen_at)}
                        </p>
                      </div>
                    </div>
                    {!s.is_current && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(s.id, label)}
                        disabled={busy}
                        className="text-[12px] md:text-[14px] font-medium text-red-500 hover:underline cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1"
                      >
                        {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {sessions.length > 1 && (
              <div className="flex justify-start pt-3">
                <button
                  type="button"
                  onClick={handleRevokeOthers}
                  disabled={revokeOthers.isPending}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[13px] font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {revokeOthers.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Log out of all other sessions
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
