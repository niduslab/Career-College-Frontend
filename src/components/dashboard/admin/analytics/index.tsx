"use client";

import AnalyticsStatsCards from "./stats-cards";
import UserGrowthChart from "./user-growth-chart";
import EnrollmentFunnel from "./enrollment-funnel";
import TopCourses from "./top-courses";

export default function AdminAnalyticsContent() {
  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <AnalyticsStatsCards />

      {/* User growth chart (left) + Conversion funnel (right) */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
        <div className="flex-3 min-w-0">
          <UserGrowthChart />
        </div>
        <div className="flex-2 min-w-0">
          <EnrollmentFunnel />
        </div>
      </div>

      {/* Top courses */}
      <TopCourses />
    </div>
  );
}
