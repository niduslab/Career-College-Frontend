"use client";

import AnalyticsStatsCards from "../analytics/stats-cards";
import UserGrowthChart from "../analytics/user-growth-chart";
import EnrollmentFunnel from "../analytics/enrollment-funnel";
import TopCourses from "../analytics/top-courses";
import AdminQuickLinks from "./quick-links";
import AdminRevenueChart from "./revenue-chart";
import AdminActivityFeed from "./activity-feed";

export default function AdminDashboard() {
  return (
    <div className="space-y-5">
      {/* Platform-wide KPIs */}
      <AnalyticsStatsCards />

      {/* Quick access to management modules */}
      <AdminQuickLinks />

      {/* Platform revenue + Recent activity */}
      <div className="flex flex-col xl:flex-row gap-5">
        <div className="flex-3 min-w-0">
          <AdminRevenueChart />
        </div>
        <div className="flex-2 min-w-0">
          <AdminActivityFeed />
        </div>
      </div>

      {/* User growth + Conversion funnel */}
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
