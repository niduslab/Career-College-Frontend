"use client";

import { NotificationPreferencesPanel } from "../../settings-shared/notification-preferences-panel";
import type { NotificationCategory } from "@/lib/notifications-api";

const INSTRUCTOR_CATEGORIES: NotificationCategory[] = [
  "course_management",
  "collaboration",
  "verification",
  "messaging",
];

export function NotificationsTab() {
  return <NotificationPreferencesPanel categories={INSTRUCTOR_CATEGORIES} />;
}
