"use client";

import AdminKpiCards from "./kpi-cards";
import AdminQuickLinks from "./quick-links";
import AdminRevenueChart from "./revenue-chart";
import AdminActivityFeed from "./activity-feed";
import ApprovalOverview from "./approval-overview";

export default function AdminDashboard() {
  return (
    <div className="space-y-5">
      {/* Platform-wide KPIs  */}
      <AdminKpiCards />

      {/* Quick access to management modules */}
      <AdminQuickLinks />

      {/* Platform revenue + Activity feed   */}
      <div className="flex flex-col xl:flex-row gap-5">
        <div className="flex-3 min-w-0">
          <AdminRevenueChart />
        </div>
        <div className="flex-2 min-w-0">
          <AdminActivityFeed />
        </div>
      </div>

      {/* AI course approval oversight */}
      <ApprovalOverview />
    </div>
  );
}
