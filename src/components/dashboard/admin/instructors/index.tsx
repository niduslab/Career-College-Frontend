"use client";

import InstructorsStatsCards from "./stats-cards";
import InstructorsTable from "./instructors-table";

export default function AdminInstructorsContent() {
  return (
    <div className="space-y-5">
      <InstructorsStatsCards />
      <InstructorsTable />
    </div>
  );
}
