"use client";

import { useEffect, useRef } from "react";
import { Wallet, Receipt, TrendingUp, BookOpen } from "lucide-react";
import gsap from "gsap";
import type { PartnerRevenueSummary } from "@/lib/partner-revenue-api";

interface StatsCardsProps {
  summary: PartnerRevenueSummary;
}

const CARD_TINTS = [
  {
    bg: "from-(--primary-50) to-white",
    icon: "from-(--primary-500) to-(--primary-600)",
  },
  {
    bg: "from-indigo-50 to-white",
    icon: "from-indigo-400 to-indigo-500",
  },
  { bg: "from-amber-50 to-white", icon: "from-amber-400 to-amber-500" },
  {
    bg: "from-emerald-50 to-white",
    icon: "from-emerald-400 to-emerald-500",
  },
];

function GrowthFooter({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <p className="text-[12px] font-medium text-(--gray-500)">no prior data</p>
    );
  }
  const positive = pct >= 0;
  return (
    <p
      className={`text-[12px] font-medium ${positive ? "text-(--success-500)" : "text-rose-500"}`}
    >
      {positive ? "+" : ""}
      {pct}% vs last window
    </p>
  );
}

export default function RevenueStatsCards({ summary }: StatsCardsProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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
        <p className="text-[12px] font-medium text-(--gray-500)">
          avg {summary.avg_order_value.toLocaleString()} {summary.currency}
        </p>
      ),
    },
    {
      label: "This Window",
      value: `${Number(summary.window_gross).toLocaleString()} ${summary.currency}`,
      icon: TrendingUp,
      footer: (
        <p className="text-[12px] font-medium text-(--gray-500)">
          last {summary.window_days} days
        </p>
      ),
    },
    {
      label: "Courses vs Webinars",
      value: `${Number(summary.by_item_type.course).toLocaleString()} / ${Number(summary.by_item_type.webinar).toLocaleString()}`,
      icon: BookOpen,
      footer: (
        <p className="text-[12px] font-medium text-(--gray-500)">
          {summary.currency} gross
        </p>
      ),
    },
  ];

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          delay: i * 0.08,
          ease: "back.out(1.4)",
        },
      );
    });
  }, [summary]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        const { bg, icon } = CARD_TINTS[i % CARD_TINTS.length];
        return (
          <div
            key={s.label}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className={`opacity-0 bg-linear-to-b ${bg} rounded-2xl p-5 border border-(--gray-200) flex flex-col gap-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
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
              <div
                className={`w-8 h-8 rounded-[6px_4px_6px_6px] bg-linear-to-br ${icon} flex items-center justify-center shrink-0 shadow-sm`}
              >
                <Icon className="w-5 h-5 text-white" />
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
