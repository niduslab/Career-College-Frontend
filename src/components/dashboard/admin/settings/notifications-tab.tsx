"use client";

import { NotificationPreferencesPanel } from "../../settings-shared/notification-preferences-panel";

export function NotificationsTab() {
  return (
    <NotificationPreferencesPanel
      categories={["course_management", "verification"]}
    />
  );
}
