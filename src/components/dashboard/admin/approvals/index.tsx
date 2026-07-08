"use client";

import ApprovalsStatsCards from "./stats-cards";
import ApprovalsTable from "./approvals-table";

export default function AdminApprovalsContent() {
  return (
    <div className="space-y-5">
      <ApprovalsStatsCards />
      <ApprovalsTable />
    </div>
  );
}
