"use client";

import DashboardKpiCards from "./kpi-cards";
import ActivityFeed from "./activity-feed";
import ProposalsPipeline from "./proposals-pipeline";
import QuickLinks from "./quick-links";
import PartnershipRevenueChart from "@/components/dashboard/partnership/dashboard/revenue-chart";

export default function PartnershipDashboard() {
  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <DashboardKpiCards />

      {/* Quick access */}
      <QuickLinks />

      {/* Revenue chart (left 60%) + Activity feed (right 40%) */}
      <div className="flex flex-col  xl:flex-row gap-5">
        <div className="flex-3 min-w-0">
          <PartnershipRevenueChart />
        </div>
        <div className="flex-2 min-w-0">
          <ActivityFeed />
        </div>
      </div>

      {/* Proposals pipeline */}
      <ProposalsPipeline />
    </div>
  );
}
