"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Users,
  BookOpen,
  Star,
  TrendingUp,
  Crown,
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/dashboard/common/page-header";
import CreateCourseDropdown from "@/components/dashboard/instructor/create-course-dropdown";
import VerificationBanner from "@/components/dashboard/instructor/verification-banner";
import { StatsSkeleton } from "@/components/common/query-states";
import { useInstructorAnalyticsSummary } from "@/hooks/use-instructor-analytics";

// Merged instructor Dashboard + Analytics page — see backend
// docs/architecture/29-instructor-dashboard-analytics.md. Every number here
// is real. Dropped from the original two mock pages: watch-time trend,
// traffic-source donut, AI insights panel, and the fabricated revenue line
// chart — none of that is derivable from real data (see the doc for why).

/** Animates a number counting up from 0 to `target` once on mount/change. */
function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      frameRef.current = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frameRef.current);
    }

    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, durationMs]);

  return value;
}

function GrowthBadge({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <p className="text-[12px] font-medium text-(--gray-500)">no prior data</p>
    );
  }
  const positive = pct >= 0;
  return (
    <p className="text-[12px] font-medium flex items-center gap-1 text-(--gray-500)">
      {positive && <TrendingUp className="w-4 h-4 shrink-0" />}
      {positive ? "+" : ""}
      {pct}% vs last 30 days
    </p>
  );
}

export default function InstructorDashboardPage() {
  const { data, isLoading, isError } = useInstructorAnalyticsSummary();
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [funnelVisible, setFunnelVisible] = useState(false);

  useEffect(() => {
    if (!data || funnelVisible) return;
    const frame = requestAnimationFrame(() => setFunnelVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [data, funnelVisible]);

  const revenueCount = useCountUp(data ? Number(data.revenue.gross) : 0);
  const studentsCount = useCountUp(data ? data.students.total : 0);
  const coursesCount = useCountUp(data ? data.courses.total : 0);
  const ratingCount = useCountUp(data ? data.rating.avg_rating : 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Your courses, students, and revenue at a glance."
        action={<CreateCourseDropdown />}
      />

      <VerificationBanner />

      {isLoading ? (
        <div className="space-y-6">
          <StatsSkeleton count={4} />
          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col gap-2 lg:flex-row">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-10 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          </div>
          <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="h-12 w-full bg-slate-100 dark:bg-slate-800/60" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 w-full border-t border-slate-100 p-4 dark:border-slate-800"
              >
                <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      ) : isError || !data ? (
        <p className="text-[14px] text-rose-500 text-center py-12">
          Couldn&apos;t load your analytics. Please try again.
        </p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div
              className="dashboard-fade-in relative overflow-hidden rounded-2xl p-4 border border-(--primary-200) bg-linear-to-br from-(--primary-50) to-white flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ animationDelay: "0ms" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[#4a5565] font-normal mb-2">
                    Total Revenue
                  </p>
                  <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                    {Math.round(revenueCount).toLocaleString()}{" "}
                    {data.revenue.currency}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-linear-to-br from-(--primary-500) to-(--primary-600) flex items-center justify-center shrink-0 shadow-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 mt-2 mb-2" />
              <GrowthBadge pct={data.revenue.growth_pct} />
            </div>

            <div
              className="dashboard-fade-in bg-linear-to-b from-indigo-50 to-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ animationDelay: "60ms" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[#4a5565] font-normal mb-2">
                    Total Students
                  </p>
                  <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                    {Math.round(studentsCount).toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-linear-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 mt-2 mb-2" />
              <GrowthBadge pct={data.students.growth_pct} />
            </div>

            <div
              className="dashboard-fade-in bg-linear-to-b from-amber-50 to-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ animationDelay: "120ms" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[#4a5565] font-normal mb-2">
                    Active Courses
                  </p>
                  <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                    {Math.round(coursesCount)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-linear-to-br from-amber-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 mt-2 mb-2" />
              <p className="text-[12px] font-medium text-gray-500">
                {data.courses.published} published · {data.courses.draft} drafts
              </p>
            </div>

            <div
              className="dashboard-fade-in bg-linear-to-b from-emerald-50 to-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ animationDelay: "180ms" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[#4a5565] font-normal mb-2">
                    Avg. Rating
                  </p>
                  <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                    {ratingCount.toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-linear-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Star className="w-6 h-6 text-white" fill="currentColor" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 mt-2 mb-2" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-(--warning-500) fill-current"
                  />
                ))}
                <span className="text-[12px] text-(--gray-500) ml-1">
                  ({data.rating.review_count} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Completion funnel */}
          <div
            className="dashboard-fade-in bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-(--text-title)">
                Completion Funnel
              </h3>
              <span className="hidden sm:flex items-center gap-1.5 text-[12px] text-(--gray-500)">
                Enrolled
                <ArrowRight className="w-3.5 h-3.5 text-(--gray-400)" />
                Started
                <ArrowRight className="w-3.5 h-3.5 text-(--gray-400)" />
                Completed
              </span>
            </div>
            {(() => {
              const stages = [
                {
                  label: "Enrolled",
                  value: data.funnel.enrolled,
                  hint: "Students with an enrollment",
                },
                {
                  label: "Started",
                  value: data.funnel.started,
                  hint: "Made progress past 0%",
                },
                {
                  label: "Completed",
                  value: data.funnel.completed,
                  hint: "Finished the course",
                },
              ];
              const base = stages[0].value || 1;
              return (
                <div className="flex flex-col lg:flex-row lg:items-stretch gap-2">
                  {stages.map((stage, i) => {
                    const pct = Math.round((stage.value / base) * 100);
                    const prev = i > 0 ? stages[i - 1] : null;
                    const dropPct =
                      prev && prev.value > 0
                        ? Math.round(
                            ((prev.value - stage.value) / prev.value) * 100,
                          )
                        : 0;
                    const isHovered = hoveredStage === i;
                    return (
                      <div
                        key={stage.label}
                        className="flex flex-col lg:flex-row lg:items-center gap-2 lg:flex-1"
                      >
                        {prev && (
                          <div className="flex lg:flex-col items-center justify-center gap-1 shrink-0 px-1">
                            <ArrowDown className="w-4 h-4 text-(--gray-400) lg:-rotate-90" />
                            <span className="text-[11px] font-medium text-(--gray-500) whitespace-nowrap">
                              -{dropPct}%
                            </span>
                          </div>
                        )}
                        <div
                          onMouseEnter={() => setHoveredStage(i)}
                          onMouseLeave={() => setHoveredStage(null)}
                          className={`flex-1 rounded-xl border p-4 transition-all duration-200 cursor-default hover:shadow-md hover:-translate-y-0.5 ${
                            isHovered
                              ? "border-(--primary-600) bg-(--primary-50)"
                              : "border-(--gray-200) bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[13px] text-(--gray-500)">
                              {stage.label}
                            </span>
                            <span className="text-[12px] font-medium text-(--primary-600)">
                              {pct}%
                            </span>
                          </div>
                          <p className="text-[22px] font-semibold text-(--text-title) leading-none mb-3">
                            {stage.value}
                          </p>
                          <div className="h-1.5 rounded-full bg-(--gray-100) overflow-hidden mb-2">
                            <div
                              className="h-full rounded-full bg-(--primary-600) transition-all duration-700 ease-out"
                              style={{
                                width: funnelVisible
                                  ? `${Math.max(pct, 4)}%`
                                  : "0%",
                              }}
                            />
                          </div>
                          <p className="text-[11px] text-(--gray-400)">
                            {stage.hint}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Top courses */}
          <div
            className="dashboard-fade-in bg-white rounded-2xl border border-(--gray-200) overflow-hidden"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
                Top Performing Courses
              </h3>
              <Link
                href="/dashboard/instructor/my-course"
                className="text-[12px] text-(--primary-600) font-medium flex items-center gap-1 hover:underline"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {data.top_courses.length === 0 ? (
              <p className="text-[13px] text-(--gray-400) text-center py-10">
                No published courses with enrollments yet.
              </p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-150">
                  <thead>
                    <tr className="bg-(--primary-50)">
                      {["Course", "Students", "Revenue", "Rating"].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[14px] font-semibold text-(--text-paragraph) tracking-wider px-5 py-3 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_courses.map((c, i) => (
                      <tr
                        key={c.id}
                        className="relative border-b border-(--gray-100) last:border-0 hover:bg-(--gray-50) transition-colors duration-150"
                      >
                        <td className="px-5 py-4 text-[14px] font-medium text-(--text-title) whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            {i === 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-(--warning-500)/15 shrink-0">
                                <Crown
                                  className="w-3 h-3 text-(--warning-500)"
                                  fill="currentColor"
                                />
                              </span>
                            )}
                            {c.title}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[14px] text-(--text-paragraph) whitespace-nowrap">
                          {c.enrollments}
                        </td>
                        <td className="px-5 py-4 text-[14px] text-(--text-paragraph) whitespace-nowrap">
                          {Number(c.revenue).toLocaleString()}{" "}
                          {data.revenue.currency}
                        </td>
                        <td className="px-5 py-4 text-[14px] text-(--text-paragraph) whitespace-nowrap">
                          {c.avg_rating > 0 ? c.avg_rating.toFixed(1) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
