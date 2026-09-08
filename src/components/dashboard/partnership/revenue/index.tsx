"use client";

import { usePartnerRevenueSummary } from "@/hooks/use-partner-revenue";
import { StatsSkeleton } from "@/components/common/query-states";
import RevenueStatsCards from "./stats-cards";
import RevenueChart from "./revenue-chart";
import RevenueByItem from "./revenue-by-item";
import Transactions from "./transactions";

export default function RevenuePageContent() {
  const { data: summary, isLoading, isError } = usePartnerRevenueSummary("monthly", 6);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <StatsSkeleton count={4} />
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-3 h-72 rounded-2xl border border-(--gray-200) bg-(--gray-50) animate-pulse" />
          <div className="flex-2 h-72 rounded-2xl border border-(--gray-200) bg-(--gray-50) animate-pulse" />
        </div>
        <div className="h-64 rounded-2xl border border-(--gray-200) bg-(--gray-50) animate-pulse" />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <p className="text-[14px] text-rose-500 text-center py-12">
        Couldn&apos;t load your revenue data. Please try again.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <RevenueStatsCards summary={summary} />

      <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
        <div className="flex-3 min-w-0">
          <RevenueChart summary={summary} />
        </div>
        <div className="flex-2 min-w-0">
          <RevenueByItem summary={summary} />
        </div>
      </div>

      <Transactions />
    </div>
  );
}
