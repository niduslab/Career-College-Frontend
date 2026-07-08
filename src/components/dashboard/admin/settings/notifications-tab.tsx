"use client";

import { useState } from "react";
import { SectionCard, Toggle, SaveButton } from "../../settings-shared/ui";

export function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newApproval: true,
    flaggedContent: true,
    partnerApplication: true,
    payoutFailed: true,
    weeklyRevenue: true,
    platformUpdates: false,
    emailDigest: true,
    pushNotifs: false,
  });

  const toggle = (k: keyof typeof prefs) => () =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const groups = [
    {
      title: "Approvals & Moderation",
      items: [
        {
          key: "newApproval" as const,
          label: "New course submission",
          desc: "When a course is flagged for manual review",
        },
        {
          key: "flaggedContent" as const,
          label: "Flagged content report",
          desc: "When a review, comment, or post is reported",
        },
        {
          key: "partnerApplication" as const,
          label: "Partner application",
          desc: "When a new partner applies to join the platform",
        },
      ],
    },
    {
      title: "Finance",
      items: [
        {
          key: "payoutFailed" as const,
          label: "Payout failed",
          desc: "When a scheduled payout to an instructor or partner fails",
        },
        {
          key: "weeklyRevenue" as const,
          label: "Weekly revenue summary",
          desc: "Platform-wide revenue report every Monday",
        },
      ],
    },
    {
      title: "Platform",
      items: [
        {
          key: "platformUpdates" as const,
          label: "Platform updates",
          desc: "New features and system announcements",
        },
        {
          key: "emailDigest" as const,
          label: "Email digest",
          desc: "Weekly digest of admin activity",
        },
        {
          key: "pushNotifs" as const,
          label: "Push notifications",
          desc: "Browser push notifications for real-time alerts",
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
                  <p className="text-[14px] font-semibold text-(--text-title)">{label}</p>
                  <p className="text-[12px] font-normal text-(--gray-500)">{desc}</p>
                </div>
                <Toggle checked={prefs[key]} onChange={toggle(key)} />
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
      <div className="flex justify-start">
        <SaveButton onClick={() => {}} />
      </div>
    </div>
  );
}
