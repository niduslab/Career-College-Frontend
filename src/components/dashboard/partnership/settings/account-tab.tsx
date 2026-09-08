"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { SectionCard, Field, AsyncSaveButton } from "../../settings-shared/ui";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { validatePassword } from "@/lib/validation";
import { changePassword } from "@/lib/auth-api";

export function AccountTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Change Password
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
        notify.error(err.detail);
      } else {
        notify.error("Failed to change password.");
      }
    } finally {
      setPwSaving(false);
    }
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
                className="w-full h-11 pl-9 pr-10 text-[14px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
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
            <Field
              label="Confirm new password"
              error={pwErrors.confirm_password}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={pw.confirm_password}
                  onChange={(e) =>
                    setPwField("confirm_password", e.target.value)
                  }
                  placeholder="Repeat new password"
                  className="w-full h-11 pl-9 pr-10 text-[14px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
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
    </div>
  );
}
