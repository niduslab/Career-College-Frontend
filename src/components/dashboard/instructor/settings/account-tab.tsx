"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { validatePassword } from "@/lib/validation";
import { changePassword } from "@/lib/auth-api";
import { SectionCard, Field, Toggle, AsyncSaveButton } from "../../settings-shared/ui";

export function AccountTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  // Change Password (guide §15A)
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

  const sessions = [
    {
      device: "Chrome on macOS",
      location: "Dhaka, BD",
      time: "Now",
      current: true,
    },
    {
      device: "Safari on iPhone",
      location: "Dhaka, BD",
      time: "2h ago",
      current: false,
    },
    {
      device: "Firefox on Windows",
      location: "London, UK",
      time: "3d ago",
      current: false,
    },
  ];

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
                className="w-full h-10 pl-9 pr-10 text-[13px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400) cursor-pointer"
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
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
                className="w-full h-10 pl-9 pr-10 text-[13px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400) cursor-pointer"
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>
          <div className="sm:col-span-2 sm:max-w-sm">
            <Field label="Confirm password" error={pwErrors.confirm_password}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={pw.confirm_password}
                  onChange={(e) =>
                    setPwField("confirm_password", e.target.value)
                  }
                  placeholder="Repeat new password"
                  className="w-full h-10 pl-9 pr-10 text-[13px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400) cursor-pointer"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
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

      {/* 2FA */}
      <SectionCard
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account."
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-(--text-title)">
              Authenticator app
            </p>
            <p className="text-[12px] text-(--gray-400) mt-0.5">
              {twoFactor
                ? "Enabled — using Google Authenticator"
                : "Not enabled"}
            </p>
          </div>
          <Toggle
            checked={twoFactor}
            onChange={() => setTwoFactor((v) => !v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-(--text-title)">
              Login alerts
            </p>
            <p className="text-[12px] text-(--gray-400) mt-0.5">
              Get an email when a new session is started
            </p>
          </div>
          <Toggle
            checked={sessionAlerts}
            onChange={() => setSessionAlerts((v) => !v)}
          />
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard
        title="Active Sessions"
        description="Devices currently signed in to your account."
      >
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.device}
              className="flex items-center justify-between py-2 border-b border-(--gray-100) last:border-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-(--text-title)">
                    {s.device}
                  </p>
                  {s.current && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-(--gray-400) mt-0.5">
                  {s.location} · {s.time}
                </p>
              </div>
              {!s.current && (
                <button
                  type="button"
                  className="text-[12px] font-medium text-red-500 hover:underline cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title="Danger Zone">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-(--text-title)">
              Delete account
            </p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              Permanently delete your account and all data.
            </p>
          </div>
          <button
            type="button"
            className="h-11 px-4 rounded-md border border-red-200 text-red-500 text-[14px] font-medium hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Delete Account
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

