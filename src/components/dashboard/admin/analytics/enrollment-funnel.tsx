"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Loader2 } from "lucide-react";
import { useConversionFunnel } from "@/hooks/use-admin-analytics";

export default function EnrollmentFunnel() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { data, isLoading } = useConversionFunnel();

  const stages = data?.stages ?? [];
  const firstCount = stages[0]?.count ?? 0;

  useEffect(() => {
    if (isLoading) return;
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
  }, [isLoading]);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 space-y-4 h-full">
      <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
        Conversion Funnel
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-(--gray-400)">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {stages.map((stage, i) => {
              const pct = firstCount > 0 ? Math.round((stage.count / firstCount) * 100) : 0;
              return (
                <div key={stage.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-(--text-title)">
                      {stage.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-(--gray-400)">{pct}%</span>
                      <span className="text-[13px] font-semibold text-(--text-title) w-16 text-right">
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      ref={(el) => {
                        barRefs.current[i] = el;
                      }}
                      data-progress={pct}
                      className="h-full rounded-full bg-(--primary-600)"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[12px] text-(--gray-400) pt-1">
            Distinct learner accounts, signup through certification.
          </p>
        </>
      )}
    </div>
  );
}
