"use client";

import { useState } from "react";
import { SectionCard, Toggle, SaveButton } from "./ui";

export function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newContent: true,
    replies: true,
    announcements: false,
    marketing: false,
    liveSession: true,
    reminders: true,
    emailDigest: true,
    pushNotifs: false,
  });

  const toggle = (k: keyof typeof prefs) => () =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const groups = [
    {
      title: "Course Activity",
      items: [
        {
          key: "newContent" as const,
          label: "New course content",
          desc: "When new modules or lessons are added to your courses",
        },
        {
          key: "replies" as const,
          label: "Discussion replies",
          desc: "When someone replies to your threads or comments",
        },
        {
          key: "liveSession" as const,
          label: "Live session alerts",
          desc: "When a live session you're registered for is starting",
        },
      ],
    },
    {
      title: "Platform",
      items: [
        {
          key: "announcements" as const,
          label: "Announcements",
          desc: "Important platform and course announcements",
        },
        {
          key: "reminders" as const,
          label: "Study reminders",
          desc: "Daily reminders to keep your learning streak going",
        },
        {
          key: "emailDigest" as const,
          label: "Email digest",
          desc: "Weekly summary of your learning activity",
        },
      ],
    },
    {
      title: "Marketing",
      items: [
        {
          key: "marketing" as const,
          label: "Promotions & offers",
          desc: "Discounts, new courses, and special recommendations",
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
                  <p className="text-[14px] font-semibold text-(--text-title)">
                    {label}
                  </p>
                  <p className="text-[12px] font-normal text-(--gray-500)">
                    {desc}
                  </p>
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
