"use client";

import { useEffect, useState } from "react";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationCategory,
  type NotificationPreference,
} from "@/lib/notifications-api";
import { notify } from "@/lib/toast";
import { SectionCard, AsyncSaveButton, Toggle } from "./ui";

const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; desc: string }
> = {
  course_activity: {
    label: "Course activity",
    desc: "Enrollment, lecture completion, course completion, reviews",
  },
  assessments: {
    label: "Assessments",
    desc: "Quiz, assignment, and coding exercise grading",
  },
  course_management: {
    label: "Course management",
    desc: "Submission, approval, rejection, archiving, video processing",
  },
  collaboration: {
    label: "Collaboration",
    desc: "Co-instructor invites — sent, accepted, declined",
  },
  verification: {
    label: "Verification",
    desc: "Identity and institution verification decisions",
  },
  messaging: {
    label: "Messaging",
    desc: "New messages from learners, instructors, or institutions",
  },
};

const CATEGORY_ORDER: NotificationCategory[] = [
  "course_activity",
  "assessments",
  "course_management",
  "collaboration",
  "verification",
  "messaging",
];

export function NotificationPreferencesPanel({
  categories = CATEGORY_ORDER,
}: {
  /** Restrict which categories this role can see/toggle. Defaults to every
   *  category — instructor/partnership/admin panels are unaffected. */
  categories?: NotificationCategory[];
}) {
  const [prefs, setPrefs] = useState<NotificationPreference[]>([]);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    fetchNotificationPreferences()
      .then((data) => {
        if (active) setPrefs(data);
      })
      .catch(() => {
        if (active) notify.error("Failed to load notification preferences.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = (category: NotificationCategory) => {
    setPrefs((prev) =>
      prev.map((p) =>
        p.category === category ? { ...p, email_enabled: !p.email_enabled } : p,
      ),
    );
    setPending((prev) => ({ ...prev, [category]: true }));
  };

  const handleSave = async () => {
    const changed = prefs.filter((p) => pending[p.category]);
    if (changed.length === 0) return;

    setSaving(true);
    try {
      const updates: Parameters<typeof updateNotificationPreferences>[0] = {};
      for (const p of changed) {
        updates[p.category] = { email_enabled: p.email_enabled };
      }
      const data = await updateNotificationPreferences(updates);
      setPrefs(data);
      setPending({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      notify.error("Failed to save notification preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SectionCard title="Email notifications">
        <p className="text-[13px] text-(--gray-400)">Loading…</p>
      </SectionCard>
    );
  }

  const byCategory = new Map(prefs.map((p) => [p.category, p]));

  return (
    <div className="space-y-4">
      <SectionCard
        title="Email notifications"
        description="Choose which categories of events email you. In-app notifications (the bell icon) are always on."
      >
        <div className="space-y-4">
          {categories.filter((c) => byCategory.has(c)).map((category) => {
            const pref = byCategory.get(category)!;
            const meta = CATEGORY_META[category];
            return (
              <div key={category} className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-(--text-title)">
                    {meta.label}
                  </p>
                  <p className="text-[12px] font-normal text-(--gray-500)">
                    {meta.desc}
                  </p>
                </div>
                <Toggle
                  checked={pref.email_enabled}
                  onChange={() => toggle(category)}
                />
              </div>
            );
          })}
        </div>
      </SectionCard>
      <div className="flex justify-start">
        <AsyncSaveButton onClick={handleSave} saving={saving} saved={saved} />
      </div>
    </div>
  );
}
