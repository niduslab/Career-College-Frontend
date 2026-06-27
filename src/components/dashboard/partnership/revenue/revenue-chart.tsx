"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { REVENUE_CHART } from "./data";

type View = "revenue" | "commission";

const MAX = Math.max(...REVENUE_CHART.map((d) => d.revenue));

export default function RevenueChart() {
  const [view, setView] = useState<View>("revenue");
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

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
  }, [view]);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
            Revenue Over Time
          </p>
          <p className="text-[12px] text-(--gray-400) mt-0.5">Jan – Jun 2026</p>
        </div>
        <div className="flex gap-1 bg-(--gray-100) rounded-lg p-0.5">
          {(["revenue", "commission"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`h-7 px-3 text-[12px]  rounded-md cursor-pointer transition-colors capitalize ${
                view === v
                  ? "bg-white text-(--text-title) shadow-sm font-medium"
                  : "text-(--gray-500) hover:text-(--gray-700) font-normal"
              }`}
            >
              {v === "revenue" ? "Revenue" : "Commission"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-3 h-48 md:h-52 lg:h-full">
        {REVENUE_CHART.map((d, i) => {
          const val = view === "revenue" ? d.revenue : d.commission;
          const pct = Math.round((val / MAX) * 100);
          return (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
            >
              <span className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-(--text-title) whitespace-nowrap">
                ${(val / 1000).toFixed(1)}k
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
                {d.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
