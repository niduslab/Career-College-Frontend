"use client";

import { Loader2 } from "lucide-react";
import { usePartnerRevenueSummary } from "@/hooks/use-partner-revenue";
import RevenueStatsCards from "./stats-cards";
import RevenueChart from "./revenue-chart";
import RevenueByItem from "./revenue-by-item";
import Transactions from "./transactions";

export default function RevenuePageContent() {
  const { data: summary, isLoading, isError } = usePartnerRevenueSummary("monthly", 6);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading...
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
