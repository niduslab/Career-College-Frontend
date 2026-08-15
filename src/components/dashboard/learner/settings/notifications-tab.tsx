"use client";

import { NotificationPreferencesPanel } from "../../settings-shared/notification-preferences-panel";
import type { NotificationCategory } from "@/lib/notifications-api";

// Learners have no course-management, collaboration, or verification events
// — those are instructor/institution/admin concepts.
const LEARNER_CATEGORIES: NotificationCategory[] = [
  "course_activity",
  "assessments",
  "messaging",
];

export function NotificationsTab() {
  return <NotificationPreferencesPanel categories={LEARNER_CATEGORIES} />;
}
