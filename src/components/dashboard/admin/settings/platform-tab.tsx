"use client";

import { useState } from "react";
import { Mail, Globe } from "lucide-react";
import { SectionCard, Field, Input, Toggle, SaveButton } from "../../settings-shared/ui";

export function PlatformTab() {
  const [general, setGeneral] = useState({
    platformName: "CareerCollege",
    supportEmail: "support@careercollege.com",
    defaultCurrency: "USD",
    defaultTimezone: "Asia/Dhaka",
  });

  const [toggles, setToggles] = useState({
    maintenanceMode: false,
    autoApproval: true,
    allowSignups: true,
    requireInstructorVerification: true,
  });

  const [approvalThreshold, setApprovalThreshold] = useState("75");

  const setGeneralField =
    (k: keyof typeof general) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setGeneral((g) => ({ ...g, [k]: e.target.value }));

  const toggle = (k: keyof typeof toggles) => () =>
    setToggles((t) => ({ ...t, [k]: !t[k] }));

  return (
    <div className="space-y-4">
      {/* General */}
      <SectionCard title="General" description="Basic platform-wide configuration.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Platform name">
            <Input icon={Globe} value={general.platformName} onChange={setGeneralField("platformName")} />
          </Field>
          <Field label="Support email">
            <Input icon={Mail} type="email" value={general.supportEmail} onChange={setGeneralField("supportEmail")} />
          </Field>
          <Field label="Default currency">
            <Input value={general.defaultCurrency} onChange={setGeneralField("defaultCurrency")} placeholder="e.g. USD" />
          </Field>
          <Field label="Default timezone">
            <Input value={general.defaultTimezone} onChange={setGeneralField("defaultTimezone")} placeholder="e.g. Asia/Dhaka" />
          </Field>
        </div>
        <div className="flex justify-start pt-2">
          <SaveButton onClick={() => {}} />
        </div>
      </SectionCard>

      {/* Course approvals */}
      <SectionCard
        title="Course Approvals"
        description="Controls the AI-assisted course review workflow."
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-(--text-title)">Auto-approval</p>
            <p className="text-[12px] text-(--gray-400) mt-0.5">
              Automatically approve courses that score above the threshold
            </p>
          </div>
          <Toggle checked={toggles.autoApproval} onChange={toggle("autoApproval")} />
        </div>
        <div className="max-w-xs">
          <Field label="Auto-approval threshold (AI score)">
            <Input
              type="number"
              min={0}
              max={100}
              value={approvalThreshold}
              onChange={(e) => setApprovalThreshold(e.target.value)}
              disabled={!toggles.autoApproval}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-(--text-title)">Require instructor verification</p>
            <p className="text-[12px] text-(--gray-400) mt-0.5">
              Instructors must be verified before publishing courses
            </p>
          </div>
          <Toggle
            checked={toggles.requireInstructorVerification}
            onChange={toggle("requireInstructorVerification")}
          />
        </div>
        <div className="flex justify-start pt-2">
          <SaveButton onClick={() => {}} />
        </div>
      </SectionCard>

      {/* Access */}
      <SectionCard title="Access" description="Control who can join and use the platform.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-(--text-title)">Allow new signups</p>
            <p className="text-[12px] text-(--gray-400) mt-0.5">
              Let new students and instructors register accounts
            </p>
          </div>
          <Toggle checked={toggles.allowSignups} onChange={toggle("allowSignups")} />
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title="Maintenance Mode">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-(--text-title)">Enable maintenance mode</p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              Takes the platform offline for all non-admin users.
            </p>
          </div>
          <Toggle checked={toggles.maintenanceMode} onChange={toggle("maintenanceMode")} />
        </div>
      </SectionCard>
    </div>
  );
}
