"use client";

import RevenueStatsCards from "./stats-cards";
import RevenueChart from "./revenue-chart";
import RevenueByPartner from "./revenue-by-partner";
import Transactions from "./transactions";

export default function RevenuePageContent() {
  return (
    <div className="space-y-5">
      <RevenueStatsCards />

      <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
        <div className="flex-3 min-w-0">
          <RevenueChart />
        </div>
        <div className="flex-2 min-w-0">
          <RevenueByPartner />
        </div>
      </div>

      <Transactions />
    </div>
  );
}
