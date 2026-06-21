"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import PartnershipsStatsCards from "./stats-cards";
import PartnershipsTable from "./table";
import { TOP_PARTNERS, TIPS, PARTNERS } from "./data";
import { PartnerStatus } from "./types";

export default function PartnershipsPageContent() {
  const barRef = useRef<(HTMLDivElement | null)[]>([]);
  const breakdownRef = useRef<(HTMLDivElement | null)[]>([]);

  const maxRevenue = Math.max(
    ...TOP_PARTNERS.map((p) => parseFloat(p.revenue.replace(/[$,]/g, ""))),
  );

  useEffect(() => {
    barRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${el.dataset.progress}%`,
          duration: 0.8,
          delay: 0.3 + i * 0.1,
          ease: "power3.out",
        },
      );
    });
    breakdownRef.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${el.dataset.progress}%`,
          duration: 0.8,
          delay: 0.5,
          ease: "power3.out",
        },
      );
    });
  }, []);

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* Left */}
      <div className="flex-1 space-y-5">
        <PartnershipsStatsCards />
        <PartnershipsTable />
      </div>

      {/* Right sidebar */}
      <div className="w-full xl:w-60 2xl:w-72 shrink-0 space-y-4">
        {/* Top partners by revenue */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Top Partners by Revenue
          </p>
          <div className="space-y-3">
            {TOP_PARTNERS.map((p, i) => {
              const val = parseFloat(p.revenue.replace(/[$,]/g, ""));
              const pct = Math.round((val / maxRevenue) * 100);
              return (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-(--primary-700) text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[12px] font-medium text-(--text-title) truncate">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                        <div
                          ref={(el) => {
                            barRef.current[i] = el;
                          }}
                          data-progress={pct}
                          className="h-full rounded-full bg-(--primary-600)"
                          style={{ width: "0%" }}
                        />
                      </div>
                      <span className="text-[12px] text-(--gray-500) shrink-0">
                        {p.revenue}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-600)" />
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Partner Tips
            </p>
          </div>
          <div className="space-y-2.5">
            {TIPS.map(({ color, text }) => (
              <div key={text} className="flex items-start gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color.replace("text-", "bg-")}`}
                />
                <p className="text-[12px] text-(--gray-500) leading-snug">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Status Breakdown
          </p>
          <div className="space-y-2">
            {(["Active", "Pending", "Inactive"] as PartnerStatus[]).map(
              (st, i) => {
                const count = PARTNERS.filter((p) => p.status === st).length;
                const pct = Math.round((count / PARTNERS.length) * 100);
                const bar =
                  st === "Active"
                    ? "bg-green-500"
                    : st === "Pending"
                      ? "bg-orange-400"
                      : "bg-gray-400";
                const text =
                  st === "Active"
                    ? "text-green-600"
                    : st === "Pending"
                      ? "text-orange-500"
                      : "text-gray-500";
                return (
                  <div key={st} className="flex items-center gap-3">
                    <span className="text-[12px] text-(--gray-600) w-16 shrink-0">
                      {st}
                    </span>
                    <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                      <div
                        ref={(el) => {
                          breakdownRef.current[i] = el;
                        }}
                        data-progress={pct}
                        className={`h-full rounded-full ${bar}`}
                        style={{ width: "0%" }}
                      />
                    </div>
                    <span
                      className={`text-[12px] font-semibold ${text} w-8 text-right shrink-0`}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
