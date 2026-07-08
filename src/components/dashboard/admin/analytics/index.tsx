"use client";

import AnalyticsStatsCards from "./stats-cards";
import UserGrowthChart from "./user-growth-chart";
import EnrollmentFunnel from "./enrollment-funnel";
import TopInstructors from "./top-instructors";
import TopCourses from "./top-courses";
import PeriodComparison from "./period-comparison";

export default function AdminAnalyticsContent() {
  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <AnalyticsStatsCards />

      {/* User growth chart (left) + Enrollment funnel (right) */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
        <div className="flex-3 min-w-0">
          <UserGrowthChart />
        </div>
        <div className="flex-2 min-w-0">
          <EnrollmentFunnel />
        </div>
      </div>

      {/* Top instructors (left) + Top courses (right) */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-2 min-w-0">
          <TopInstructors />
        </div>
        <div className="flex-3 min-w-0">
          <TopCourses />
        </div>
      </div>

      {/* Period comparison — full width */}
      <PeriodComparison />
    </div>
  );
}
