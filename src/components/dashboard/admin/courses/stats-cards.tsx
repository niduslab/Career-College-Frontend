"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BookOpen, CheckCircle2, Clock, FileEdit } from "lucide-react";
import { useAdminAnalyticsSummary } from "@/hooks/use-admin-analytics";
import { StatsSkeleton } from "@/components/common/query-states";

const CARD_TINTS = [
  {
    bg: "from-(--primary-50) to-white",
    icon: "from-(--primary-500) to-(--primary-600)",
  },
  { bg: "from-emerald-50 to-white", icon: "from-emerald-400 to-emerald-500" },
  { bg: "from-amber-50 to-white", icon: "from-amber-400 to-amber-500" },
  { bg: "from-indigo-50 to-white", icon: "from-indigo-400 to-indigo-500" },
];

function formatNumber(n: number | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString();
}

function pctOfTotal(n: number | undefined, total: number | undefined): string {
  if (n === undefined || !total) return "";
  return `${Math.round((n / total) * 1000) / 10}% of total`;
}

export default function CoursesStatsCards() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { data: summary, isLoading } = useAdminAnalyticsSummary();

  const courses = summary?.courses;
  const breakdown = courses?.status_breakdown ?? {};
  const underReview = breakdown.under_review ?? 0;

  const stats = [
    {
      label: "Total Courses",
      value: formatNumber(courses?.total),
      change: courses ? `${formatNumber(courses.published)} published` : "",
      icon: BookOpen,
    },
    {
      label: "Published",
      value: formatNumber(courses?.published),
      change: pctOfTotal(courses?.published, courses?.total),
      icon: CheckCircle2,
    },
    {
      label: "Under Review",
      value: formatNumber(underReview),
      change: "Awaiting admin decision",
      icon: Clock,
    },
    {
      label: "Draft",
      value: formatNumber(courses?.draft),
      change: pctOfTotal(courses?.draft, courses?.total),
      icon: FileEdit,
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

  if (isLoading) {
    return <StatsSkeleton count={4} />;
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        const { bg, icon } = CARD_TINTS[i % CARD_TINTS.length];
        return (
          <div
            key={s.label}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className={`opacity-0 bg-linear-to-b ${bg} rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                  {s.label}
                </p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                  {s.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 xl:w-8 xl:h-8 rounded-[6px_4px_6px_6px] flex items-center justify-center shrink-0 bg-linear-to-br ${icon} text-white shadow-sm`}
              >
                <Icon className="w-6 h-6 xl:w-5 xl:h-5" />
              </div>
            </div>
            <div className="border border-dashed border-gray-200" />
            <p className="text-[12px] font-medium text-(--gray-500)">
              {s.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
