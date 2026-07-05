"use client";

import { useState } from "react";
import { SectionCard, Toggle, SaveButton } from "../../settings-shared/ui";

export function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newPartner: true,
    proposalUpdate: true,
    partnerMessage: true,
    revenueUpdate: false,
    weeklyReport: true,
    cohortActivity: true,
    platformUpdates: false,
    emailDigest: true,
    pushNotifs: false,
  });

  const toggle = (k: keyof typeof prefs) => () =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const groups = [
    {
      title: "Partner Activity",
      items: [
        {
          key: "newPartner" as const,
          label: "New partner onboarded",
          desc: "When a new partner completes onboarding",
        },
        {
          key: "proposalUpdate" as const,
          label: "Proposal status change",
          desc: "When a proposal is approved, rejected, or reviewed",
        },
        {
          key: "partnerMessage" as const,
          label: "Partner message",
          desc: "When a partner sends you a message",
        },
      ],
    },
    {
      title: "Revenue & Reports",
      items: [
        {
          key: "revenueUpdate" as const,
          label: "Revenue update",
          desc: "Daily revenue and commission summary",
        },
        {
          key: "weeklyReport" as const,
          label: "Weekly report",
          desc: "Partnership performance summary every Monday",
        },
        {
          key: "cohortActivity" as const,
          label: "Cohort activity",
          desc: "Enrollment milestones and completion updates",
        },
      ],
    },
    {
      title: "Platform",
      items: [
        {
          key: "platformUpdates" as const,
          label: "Platform updates",
          desc: "New features and announcements",
        },
        {
          key: "emailDigest" as const,
          label: "Email digest",
          desc: "Weekly digest of all partnership activity",
        },
        {
          key: "pushNotifs" as const,
          label: "Push notifications",
          desc: "Browser push notifications",
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <SectionCard key={g.title} title={g.title}>
          <div className="space-y-4">
            {g.items.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-(--text-title)">
                    {label}
                  </p>
                  <p className="text-[12px] text-(--gray-400)">{desc}</p>
                </div>
                <Toggle checked={prefs[key]} onChange={toggle(key)} />
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
      <div className="flex justify-end">
        <SaveButton onClick={() => {}} />
      </div>
    </div>
  );
}
