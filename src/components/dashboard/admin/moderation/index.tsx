"use client";

import ModerationStatsCards from "./stats-cards";
import ModerationTable from "./moderation-table";

export default function AdminModerationContent() {
  return (
    <div className="space-y-5">
      <ModerationStatsCards />
      <ModerationTable />
    </div>
  );
}
