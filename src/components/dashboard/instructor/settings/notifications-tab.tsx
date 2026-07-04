"use client";

import { useState } from "react";
import { SectionCard, Toggle, SaveButton } from "../../settings-shared/ui";

export function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newEnrollment: true,
    courseReview: true,
    studentMessage: true,
    revenueUpdate: false,
    weeklyReport: true,
    platformUpdates: false,
    emailDigest: true,
    pushNotifs: false,
  });

  const toggle = (k: keyof typeof prefs) => () =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const groups = [
    {
      title: "Student Activity",
      items: [
        {
          key: "newEnrollment" as const,
          label: "New enrollment",
          desc: "When a student enrolls in your course",
        },
        {
          key: "courseReview" as const,
          label: "Course review",
          desc: "When a student leaves a review",
        },
        {
          key: "studentMessage" as const,
          label: "Student message",
          desc: "When a student sends you a message",
        },
      ],
    },
    {
      title: "Revenue & Reports",
      items: [
        {
          key: "revenueUpdate" as const,
          label: "Revenue update",
          desc: "Daily revenue summary",
        },
        {
          key: "weeklyReport" as const,
          label: "Weekly report",
          desc: "Performance summary every Monday",
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
          desc: "Weekly digest of activity",
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
                  <p className="text-[13px] font-medium text-(--text-title)">
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

