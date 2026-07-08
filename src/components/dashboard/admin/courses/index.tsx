"use client";

import CoursesStatsCards from "./stats-cards";
import CoursesTable from "./courses-table";

export default function AdminCoursesContent() {
  return (
    <div className="space-y-5">
      <CoursesStatsCards />
      <CoursesTable />
    </div>
  );
}
