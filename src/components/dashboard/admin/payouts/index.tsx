"use client";

import PayoutsStatsCards from "./stats-cards";
import PayoutsTable from "./payouts-table";

export default function AdminPayoutsContent() {
  return (
    <div className="space-y-5">
      <PayoutsStatsCards />
      <PayoutsTable />
    </div>
  );
}
