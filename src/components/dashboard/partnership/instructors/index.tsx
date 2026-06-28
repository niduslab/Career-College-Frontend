"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import InstructorsStatsCards from "./stats-cards";
import InstructorsTable from "./table";
import { DEPT_BREAKDOWN, SPECIALIZATION_TAGS, TIPS } from "./data";

export default function InstructorsPageContent() {
  const barRef = useRef<(HTMLDivElement | null)[]>([]);

  const maxCount = Math.max(...DEPT_BREAKDOWN.map((d) => d.count));

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
  }, []);

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* Left */}
      <div className="flex-1 space-y-5">
        <InstructorsStatsCards />
        <InstructorsTable />
      </div>

      {/* Right sidebar */}
      <div className="w-full xl:w-60 2xl:w-72 shrink-0 space-y-4">
        {/* Department Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            By Department
          </p>
          <div className="space-y-3">
            {DEPT_BREAKDOWN.map((dept, i) => {
              const pct = Math.round((dept.count / maxCount) * 100);
              return (
                <div key={dept.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-(--text-title) truncate">
                      {dept.label}
                    </span>
                    <span className="text-[12px] text-(--gray-500) shrink-0 ml-2">
                      {dept.count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      ref={(el) => {
                        barRef.current[i] = el;
                      }}
                      data-progress={pct}
                      className={`h-full rounded-full ${dept.color}`}
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Specializations */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Specializations
          </p>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATION_TAGS.map(({ label, color }) => (
              <span
                key={label}
                className={`text-[12px] font-medium px-2.5 py-1 rounded-full ${color}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-600)" />
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Tips
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
      </div>
    </div>
  );
}
