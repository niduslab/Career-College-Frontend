"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Users,
  BookOpen,
  Star,
  TrendingUp,
  Loader2,
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/dashboard/common/page-header";
import CreateCourseDropdown from "@/components/dashboard/instructor/create-course-dropdown";
import VerificationBanner from "@/components/dashboard/instructor/verification-banner";
import { useInstructorAnalyticsSummary } from "@/hooks/use-instructor-analytics";

// Merged instructor Dashboard + Analytics page — see backend
// docs/architecture/29-instructor-dashboard-analytics.md. Every number here
// is real. Dropped from the original two mock pages: watch-time trend,
// traffic-source donut, AI insights panel, and the fabricated revenue line
// chart — none of that is derivable from real data (see the doc for why).

function GrowthBadge({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <p className="text-[12px] font-medium text-(--gray-400)">no prior data</p>;
  }
  const positive = pct >= 0;
  return (
    <p
      className={`text-[12px] font-medium flex items-center gap-1 ${
        positive ? "text-(--success-500)" : "text-rose-500"
      }`}
    >
      {positive && <TrendingUp className="w-4 h-4 shrink-0" />}
      {positive ? "+" : ""}
      {pct}% vs last 30 days
    </p>
  );
}

export default function InstructorDashboardPage() {
  const { data, isLoading, isError } = useInstructorAnalyticsSummary();
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Your courses, students, and revenue at a glance."
        action={<CreateCourseDropdown />}
      />

      <VerificationBanner />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-(--gray-500)">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading...
        </div>
      ) : isError || !data ? (
        <p className="text-[14px] text-rose-500 text-center py-12">
          Couldn&apos;t load your analytics. Please try again.
        </p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[#4a5565] font-normal mb-2">
                    Total Revenue
                  </p>
                  <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                    {Number(data.revenue.gross).toLocaleString()} {data.revenue.currency}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6 text-(--primary-600)" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 mt-2 mb-2" />
              <GrowthBadge pct={data.revenue.growth_pct} />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[#4a5565] font-normal mb-2">
                    Total Students
                  </p>
                  <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                    {data.students.total.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-(--primary-600)" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 mt-2 mb-2" />
              <GrowthBadge pct={data.students.growth_pct} />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[#4a5565] font-normal mb-2">
                    Active Courses
                  </p>
                  <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                    {data.courses.total}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-(--primary-600)" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 mt-2 mb-2" />
              <p className="text-[12px] font-medium text-[#4a5565]">
                {data.courses.published} published · {data.courses.draft} drafts
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[#4a5565] font-normal mb-2">
                    Avg. Rating
                  </p>
                  <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                    {data.rating.avg_rating.toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-(--primary-600)" fill="currentColor" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 mt-2 mb-2" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-(--warning-500) fill-current" />
                ))}
                <span className="text-[12px] text-(--gray-500) ml-1">
                  ({data.rating.review_count} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Completion funnel */}
          <div className="bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6">
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
                        ? Math.round(((prev.value - stage.value) / prev.value) * 100)
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
                          className={`flex-1 rounded-xl border p-4 transition-colors duration-200 cursor-default ${
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
                              className="h-full rounded-full bg-(--primary-600) transition-all duration-700"
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-(--gray-400)">{stage.hint}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Top courses */}
          <div className="bg-white rounded-2xl border border-(--gray-200) overflow-hidden">
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
                    {data.top_courses.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-(--gray-100) last:border-0 hover:bg-(--gray-50) transition-colors"
                      >
                        <td className="px-5 py-4 text-[14px] font-medium text-(--text-title) whitespace-nowrap">
                          {c.title}
                        </td>
                        <td className="px-5 py-4 text-[14px] text-(--text-paragraph) whitespace-nowrap">
                          {c.enrollments}
                        </td>
                        <td className="px-5 py-4 text-[14px] text-(--text-paragraph) whitespace-nowrap">
                          {Number(c.revenue).toLocaleString()} {data.revenue.currency}
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
