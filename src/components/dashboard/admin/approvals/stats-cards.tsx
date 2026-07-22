"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Clock, CheckCircle2, FileEdit, XCircle, Loader2 } from "lucide-react";
import { useAdminAnalyticsSummary } from "@/hooks/use-admin-analytics";

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function ApprovalsStatsCards() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { data: summary, isLoading } = useAdminAnalyticsSummary();

  const courses = summary?.courses;
  const breakdown = courses?.status_breakdown ?? {};

  const stats = [
    {
      label: "Pending Review",
      value: courses ? formatNumber(breakdown.under_review ?? 0) : "—",
      change: "Awaiting admin decision",
      icon: Clock,
    },
    {
      label: "Published",
      value: courses ? formatNumber(courses.published) : "—",
      change: "Live on the platform",
      icon: CheckCircle2,
    },
    {
      label: "Draft",
      value: courses ? formatNumber(courses.draft) : "—",
      change: "Not yet submitted",
      icon: FileEdit,
    },
    {
      label: "Rejected",
      value: courses ? formatNumber(breakdown.rejected ?? 0) : "—",
      change: "Returned to author",
      icon: XCircle,
    },
  ];

  useEffect(() => {
    if (isLoading) return;
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
  }, [isLoading]);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className={`${isLoading ? "" : "opacity-0"} bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                  {s.label}
                </p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-(--gray-300)" />
                  ) : (
                    s.value
                  )}
                </p>
              </div>
              <div className="w-10 h-10 xl:w-8 xl:h-8 rounded-[6px_4px_6px_6px] flex items-center justify-center shrink-0 bg-(--primary-50) text-(--primary-600)">
                <Icon className="w-6 h-6 xl:w-5 xl:h-5" />
              </div>
            </div>
            <div className="border border-dashed border-gray-200" />
            <p className="text-[12px] font-medium text-(--gray-500)">
              {isLoading ? "Loading…" : s.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
