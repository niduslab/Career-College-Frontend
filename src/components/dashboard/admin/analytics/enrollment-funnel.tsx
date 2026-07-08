"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ENROLLMENT_FUNNEL } from "./data";

export default function EnrollmentFunnel() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    barRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${el.dataset.progress}%`,
          duration: 0.8,
          delay: 0.2 + i * 0.12,
          ease: "power3.out",
        },
      );
    });
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 space-y-4 h-full">
      <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
        Enrollment Funnel
      </p>
      <div className="space-y-3">
        {ENROLLMENT_FUNNEL.map((stage, i) => (
          <div key={stage.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-(--text-title)">
                {stage.label}
              </span>
              <div className="flex items-center gap-3">
                {/* <span className="text-[12px] text-(--gray-400)">
                  {stage.pct}%
                </span> */}
                <span className="text-[13px] font-semibold text-(--text-title) w-14 text-right">
                  {stage.count.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="h-2.5 bg-(--gray-100) rounded-full overflow-hidden">
              <div
                ref={(el) => {
                  barRefs.current[i] = el;
                }}
                data-progress={stage.pct}
                className={`h-full rounded-full ${stage.color}`}
                style={{ width: "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[12px] text-(--gray-400) pt-1">
        Based on 84,500 course page visits in the last 30 days
      </p>
    </div>
  );
}
