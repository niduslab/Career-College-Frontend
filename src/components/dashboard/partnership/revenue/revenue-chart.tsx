"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { PartnerRevenueSummary } from "@/lib/partner-revenue-api";

interface RevenueChartProps {
  summary: PartnerRevenueSummary;
}

function formatPeriodLabel(period: string, granularity: "monthly" | "weekly"): string {
  if (granularity === "weekly") {
    const [, week] = period.split("-W");
    return `W${week}`;
  }
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}

export default function RevenueChart({ summary }: RevenueChartProps) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const series = summary.trend.series;
  const max = Math.max(...series.map((d) => d.value), 1);

  useEffect(() => {
    barRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { height: "0%" },
        {
          height: `${el.dataset.progress}%`,
          duration: 0.7,
          delay: 0.1 + i * 0.08,
          ease: "power3.out",
        },
      );
    });
  }, [series]);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
            Revenue Over Time
          </p>
          <p className="text-[12px] text-(--gray-400) mt-0.5">
            Last {summary.trend.periods} {summary.trend.granularity === "weekly" ? "weeks" : "months"}
          </p>
        </div>
      </div>

      {series.every((d) => d.value === 0) ? (
        <div className="flex-1 flex items-center justify-center text-[13px] text-(--gray-400)">
          No revenue in this period yet.
        </div>
      ) : (
        <div className="flex items-end gap-3 h-48 md:h-52 lg:h-full">
          {series.map((d, i) => {
            const pct = Math.round((d.value / max) * 100);
            return (
              <div
                key={d.period}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >
                <span className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-(--text-title) whitespace-nowrap">
                  {(d.value / 1000).toFixed(1)}k
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    ref={(el) => {
                      barRefs.current[i] = el;
                    }}
                    data-progress={pct}
                    className="w-full rounded-t-lg bg-(--primary-600) h-[0%] transition-all duration-700 ease-out"
                  />
                </div>
                <span className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-400)">
                  {formatPeriodLabel(d.period, summary.trend.granularity)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
