"use client";

import RevenueStatsCards from "./stats-cards";
import RevenueChart from "./revenue-chart";
import RevenueBreakdown from "./revenue-breakdown";
import TopRevenueCourses from "./top-courses";
import TransactionsTable from "./transactions-table";

export default function AdminRevenueContent() {
  return (
    <div className="space-y-5">
      <RevenueStatsCards />

      <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
        <div className="flex-3 min-w-0">
          <RevenueChart />
        </div>
        <div className="flex-2 min-w-0">
          <RevenueBreakdown />
        </div>
      </div>

      {/* <TopRevenueCourses /> */}

      <TransactionsTable />
    </div>
  );
}
