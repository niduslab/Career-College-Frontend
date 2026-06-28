"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { TrendingUp, TrendingDown } from "lucide-react";
import { REVENUE_BY_PARTNER } from "./data";

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];

const maxRevenue = Math.max(...REVENUE_BY_PARTNER.map((p) => p.revenue));

export default function RevenueByPartner() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

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
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 h-full flex flex-col">
      <div className="mb-4">
        <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
          Revenue by Partner
        </p>
        <p className="text-[12px] text-(--gray-400) mt-0.5">
          Top contributors this quarter
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {REVENUE_BY_PARTNER.map((p, i) => {
          const barPct = Math.round((p.revenue / maxRevenue) * 100);
          const isUp = p.trend.startsWith("+");
          return (
            <div key={p.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-(--text-title) truncate">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[13px] font-semibold text-(--text-title)">
                        ${p.revenue.toLocaleString()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {p.trend}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-(--gray-400) mt-0.5">
                    {p.deals} deals · {p.pct}% of total
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
    </div>
  );
}
