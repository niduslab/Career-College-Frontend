"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BookOpen, Video } from "lucide-react";
import type { PartnerRevenueSummary } from "@/lib/partner-revenue-api";

interface RevenueByItemProps {
  summary: PartnerRevenueSummary;
}

export default function RevenueByItem({ summary }: RevenueByItemProps) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const items = summary.by_item;
  const totalGross = Number(summary.gross) || 1;
  const maxRevenue = Math.max(...items.map((i) => Number(i.gross)), 1);

  useEffect(() => {
    barRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${el.dataset.progress}%`,
          duration: 0.7,
          delay: 0.15 + i * 0.1,
          ease: "power3.out",
        },
      );
    });
  }, [items]);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 h-full flex flex-col">
      <div className="mb-4">
        <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
          Top Earning Content
        </p>
        <p className="text-[12px] text-(--gray-400) mt-0.5">
          Highest-grossing courses and webinars
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[13px] text-(--gray-400)">
          No paid orders yet.
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {items.map((item, i) => {
            const gross = Number(item.gross);
            const barPct = Math.round((gross / maxRevenue) * 100);
            const pctOfTotal = Math.round((gross / totalGross) * 100);
            const Icon = item.item_type === "course" ? BookOpen : Video;
            return (
              <div key={`${item.item_type}-${item.id}`} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      item.item_type === "course"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-pink-100 text-pink-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-(--text-title) truncate">
                        {item.title}
                      </p>
                      <span className="text-[13px] font-semibold text-(--text-title) shrink-0">
                        {gross.toLocaleString()} {summary.currency}
                      </span>
                    </div>
                    <p className="text-[11px] text-(--gray-400) mt-0.5">
                      {item.paid_orders} order{item.paid_orders === 1 ? "" : "s"} · {pctOfTotal}% of total
                    </p>
                  </div>
                </div>
                <div className="h-1.5 bg-(--gray-100) rounded-full overflow-hidden ml-11">
                  <div
                    ref={(el) => {
                      barRefs.current[i] = el;
                    }}
                    data-progress={barPct}
                    className="h-full rounded-full bg-(--primary-600) w-[0%] transition-all duration-700 ease-out"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
