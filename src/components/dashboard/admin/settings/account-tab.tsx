"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { SectionCard, Field, Toggle, SaveButton } from "../../settings-shared/ui";

export function AccountTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  const [pw, setPw] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const setPwField = (k: keyof typeof pw, v: string) =>
    setPw((p) => ({ ...p, [k]: v }));

  const sessions = [
    { device: "Chrome on Windows", location: "Dhaka, BD", time: "Now", current: true },
    { device: "Safari on iPhone", location: "Dhaka, BD", time: "2h ago", current: false },
    { device: "Firefox on macOS", location: "Chittagong, BD", time: "3d ago", current: false },
  ];

  return (
    <div className="space-y-4">
      {/* Change password */}
      <SectionCard
        title="Change Password"
        description="Use a strong password you don't use elsewhere."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Current password">
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
          <Field label="New password">
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
            <Field label="Confirm password">
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
          <SaveButton onClick={() => {}} />
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard
        title="Two-Factor Authentication"
        description="Required for admin accounts with elevated access."
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-(--text-title)">Authenticator app</p>
            <p className="text-[12px] text-(--gray-400) mt-0.5">
              {twoFactor ? "Enabled — using Google Authenticator" : "Not enabled"}
            </p>
          </div>
          <Toggle checked={twoFactor} onChange={() => setTwoFactor((v) => !v)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-(--text-title)">Login alerts</p>
            <p className="text-[12px] text-(--gray-400) mt-0.5">
              Get an email when a new session is started
            </p>
          </div>
          <Toggle checked={sessionAlerts} onChange={() => setSessionAlerts((v) => !v)} />
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
                  <p className="text-[14px] font-semibold text-(--text-title)">{s.device}</p>
                  {s.current && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-(--gray-400) mt-0.5">
                  {s.location} · {s.time}
                </p>
              </div>
              {!s.current && (
                <button
                  type="button"
                  className="text-[12px] md:text-[14px] font-medium text-red-500 hover:underline cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
