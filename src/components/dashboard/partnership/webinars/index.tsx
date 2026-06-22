"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import WebinarsStatsCards from "./stats-cards";
import WebinarsTable from "./table";
import { WEBINARS, TOPIC_BREAKDOWN, TIPS } from "./data";
import { WebinarStatus } from "./types";

export default function WebinarsPageContent() {
  const barRef = useRef<(HTMLDivElement | null)[]>([]);
  const breakdownRef = useRef<(HTMLDivElement | null)[]>([]);

  const maxCount = Math.max(...TOPIC_BREAKDOWN.map((t) => t.count));

  useEffect(() => {
    barRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        { width: `${el.dataset.progress}%`, duration: 0.8, delay: 0.3 + i * 0.1, ease: "power3.out" },
      );
    });
    breakdownRef.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        { width: `${el.dataset.progress}%`, duration: 0.8, delay: 0.5, ease: "power3.out" },
      );
    });
  }, []);

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* Left */}
      <div className="flex-1 min-w-0 space-y-5">
        <WebinarsStatsCards />
        <WebinarsTable />
      </div>

      {/* Right sidebar */}
      <div className="w-full xl:w-60 2xl:w-72 shrink-0 space-y-4">

        {/* Topic Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            By Topic
          </p>
          <div className="space-y-3">
            {TOPIC_BREAKDOWN.map((topic, i) => {
              const pct = Math.round((topic.count / maxCount) * 100);
              return (
                <div key={topic.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-(--text-title) truncate">{topic.label}</span>
                    <span className="text-[12px] text-(--gray-500) shrink-0 ml-2">{topic.count}</span>
                  </div>
                  <div className="h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      ref={(el) => { barRef.current[i] = el; }}
                      data-progress={pct}
                      className={`h-full rounded-full ${topic.color}`}
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Status Breakdown
          </p>
          <div className="space-y-2">
            {(["Live", "Upcoming", "Recorded", "Cancelled"] as WebinarStatus[]).map((st, i) => {
              const count = WEBINARS.filter((w) => w.status === st).length;
              const pct = Math.round((count / WEBINARS.length) * 100);
              const bar =
                st === "Live" ? "bg-red-500"
                : st === "Upcoming" ? "bg-blue-500"
                : st === "Recorded" ? "bg-gray-400"
                : "bg-orange-400";
              const text =
                st === "Live" ? "text-red-600"
                : st === "Upcoming" ? "text-blue-600"
                : st === "Recorded" ? "text-gray-500"
                : "text-orange-500";
              return (
                <div key={st} className="flex items-center gap-3">
                  <span className="text-[11px] text-(--gray-600) w-20 shrink-0 truncate">{st}</span>
                  <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      ref={(el) => { breakdownRef.current[i] = el; }}
                      data-progress={pct}
                      className={`h-full rounded-full ${bar}`}
                      style={{ width: "0%" }}
                    />
                  </div>
                  <span className={`text-[12px] font-semibold ${text} w-8 text-right shrink-0`}>
                    {pct}%
                  </span>
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
              Webinar Tips
            </p>
          </div>
          <div className="space-y-2.5">
            {TIPS.map(({ color, text }) => (
              <div key={text} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color.replace("text-", "bg-")}`} />
                <p className="text-[12px] text-(--gray-500) leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
