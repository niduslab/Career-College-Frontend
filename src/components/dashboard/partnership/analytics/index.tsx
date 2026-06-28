"use client";

import AnalyticsStatsCards from "./stats-cards";
import ProposalFunnel from "./proposal-funnel";
import TopPartners from "./top-partners";
import CoursePerformance from "./course-performance";
import PeriodComparison from "./period-comparison";
import PartnershipRevenueChart from "@/components/dashboard/partnership/dashboard/revenue-chart";

export default function AnalyticsPageContent() {
  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <AnalyticsStatsCards />

      {/* Revenue chart (left) + Proposal funnel (right) */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
        <div className="flex-2 min-w-0">
          <PartnershipRevenueChart />
        </div>
        <div className="flex-2 min-w-0">
          <ProposalFunnel />
        </div>
      </div>

      {/* Top partners (left) + Course performance (right) */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-2 min-w-0">
          <TopPartners />
        </div>
        <div className="flex-2 min-w-0">
          <CoursePerformance />
        </div>
      </div>

      {/* Period comparison — full width */}
      <PeriodComparison />
    </div>
  );
}
