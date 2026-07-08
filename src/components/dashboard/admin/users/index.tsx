"use client";

import UsersStatsCards from "./stats-cards";
import UsersTable from "./users-table";

export default function AdminUsersContent() {
  return (
    <div className="space-y-5">
      <UsersStatsCards />
      <UsersTable />
    </div>
  );
}
