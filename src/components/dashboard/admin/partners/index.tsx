"use client";

import PartnersStatsCards from "./stats-cards";
import PartnersTable from "./partners-table";

export default function AdminPartnersContent() {
  return (
    <div className="space-y-5">
      <PartnersStatsCards />
      <PartnersTable />
    </div>
  );
}
