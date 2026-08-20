"use client";

import { Wallet, Receipt, TrendingUp, BookOpen } from "lucide-react";
import type { PartnerRevenueSummary } from "@/lib/partner-revenue-api";

interface StatsCardsProps {
  summary: PartnerRevenueSummary;
}

function GrowthFooter({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <p className="text-[12px] font-medium text-(--success-500)">no prior data</p>;
  }
  const positive = pct >= 0;
  return (
    <p className={`text-[12px] font-medium ${positive ? "text-(--success-500)" : "text-rose-500"}`}>
      {positive ? "+" : ""}
      {pct}% vs last window
    </p>
  );
}

export default function RevenueStatsCards({ summary }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Revenue",
      value: `${Number(summary.gross).toLocaleString()} ${summary.currency}`,
      icon: Wallet,
      footer: <GrowthFooter pct={summary.growth_pct} />,
    },
    {
      label: "Paid Orders",
      value: String(summary.paid_orders),
      icon: Receipt,
      footer: (
        <p className="text-[12px] font-medium text-(--success-500)">
          avg {summary.avg_order_value.toLocaleString()} {summary.currency}
        </p>
      ),
    },
    {
      label: "This Window",
      value: `${Number(summary.window_gross).toLocaleString()} ${summary.currency}`,
      icon: TrendingUp,
      footer: (
        <p className="text-[12px] font-medium text-(--success-500)">
          last {summary.window_days} days
        </p>
      ),
    },
    {
      label: "Courses vs Webinars",
      value: `${Number(summary.by_item_type.course).toLocaleString()} / ${Number(summary.by_item_type.webinar).toLocaleString()}`,
      icon: BookOpen,
      footer: <p className="text-[12px] font-medium text-(--success-500)">{summary.currency} gross</p>,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 border border-(--gray-200) flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                  {s.label}
                </p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                  {s.value}
                </p>
              </div>
              <div className="w-8 h-8 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-(--primary-600)" />
              </div>
            </div>
            <div className="border border-dashed border-gray-200" />
            {s.footer}
          </div>
        );
      })}
    </div>
  );
}
