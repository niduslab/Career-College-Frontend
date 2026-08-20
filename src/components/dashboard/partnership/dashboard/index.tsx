"use client";

import Link from "next/link";
import {
  BookOpen,
  Users,
  Award,
  Video,
  Star,
  TrendingUp,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import {
  usePartnerAnalyticsSummary,
  usePartnerTopCourses,
} from "@/hooks/use-partner-analytics";
import EnrollmentTrendChart from "./enrollment-trend-chart";

function GrowthBadge({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <p className="text-[12px] font-medium text-(--success-500)">
        no prior data
      </p>
    );
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

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  footer: React.ReactNode;
}

function KpiCard({ label, value, icon: Icon, footer }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-[#4a5565] font-normal mb-2">{label}</p>
          <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
            {value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-(--primary-600)" />
        </div>
      </div>
      <div className="border border-dashed border-gray-200 mt-2 mb-2" />
      {footer}
    </div>
  );
}

const ENGAGEMENT_LABELS: Record<string, string> = {
  completion: "Course Completion",
  active_ratio: "Learner Activity",
  rating: "Course Rating",
  attendance: "Webinar Attendance",
};

export default function PartnershipDashboard() {
  const { data, isLoading, isError } = usePartnerAnalyticsSummary();
  const { data: topCourses } = usePartnerTopCourses("enrollments", 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-[14px] text-rose-500 text-center py-12">
        Couldn&apos;t load your analytics. Please try again.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Active Enrollments"
          value={data.enrollments.active.toLocaleString()}
          icon={Users}
          footer={<GrowthBadge pct={data.enrollments.growth.growth_pct} />}
        />
        <KpiCard
          label="Courses"
          value={String(data.courses.total)}
          icon={BookOpen}
          footer={
            <p className="text-[12px] font-medium text-(--success-500)">
              {data.courses.published} published · {data.courses.draft} drafts
            </p>
          }
        />
        <KpiCard
          label="Webinars"
          value={String(data.webinars.total)}
          icon={Video}
          footer={
            <p className="text-[12px] font-medium text-(--success-500)">
              {data.webinars.upcoming} upcoming · {data.webinars.registrations}{" "}
              registrations
            </p>
          }
        />
        <KpiCard
          label="Avg. Rating"
          value={data.courses.avg_rating.toFixed(2)}
          icon={Star}
          footer={
            <p className="text-[12px] font-medium text-(--success-500)">
              ({data.courses.total_reviews} reviews)
            </p>
          }
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Left column: enrollment trend + certificates/roster + top courses */}
        <div className="flex-3 min-w-0 space-y-5">
          <EnrollmentTrendChart />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KpiCard
              label="Certificates Issued"
              value={String(data.certificates.total)}
              icon={Award}
              footer={
                <p className="text-[12px] font-medium text-(--success-500)">
                  +{data.certificates.this_month} this month
                </p>
              }
            />

            <KpiCard
              label="Active Experts"
              value={String(data.roster.experts_active)}
              icon={Users}
              footer={
                <p className="text-[12px] font-medium text-(--success-500)">
                  / {data.roster.experts_total} total
                </p>
              }
            />
          </div>
        </div>

        {/* Right column: engagement score breakdown */}
        <div className="flex-2 min-w-0">
          <div className="bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6 h-full">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
                Engagement Score
              </h3>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-[32px] font-semibold text-(--text-title) leading-none mb-1">
              {data.engagement_score.composite}
              <span className="text-[14px] font-normal text-(--gray-400)">
                /100
              </span>
            </p>
            <p className="text-[12px] text-(--gray-400) mb-5">
              Composite of completion, activity, rating and attendance
            </p>

            <div className="space-y-4">
              {Object.entries(data.engagement_score.components).map(
                ([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-(--gray-600)">
                        {ENGAGEMENT_LABELS[key] ?? key}
                      </span>
                      <span className="text-[12px] font-medium text-(--text-title)">
                        {value}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-(--gray-100) overflow-hidden">
                      <div
                        className="h-full rounded-full bg-(--primary-600) transition-all duration-700"
                        style={{
                          width: `${Math.min(Math.max(value, 2), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>

            {!data.webinars.attendance_tracking_enabled && (
              <p className="text-[11px] text-(--gray-400) mt-5">
                Webinar attendance tracking is not yet enabled — this component
                reads 0 until live join-tracking ships.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top courses — full width */}
      <div className="bg-white rounded-2xl border border-(--gray-200) overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
            Top Performing Courses
          </h3>
          <Link
            href="/dashboard/partnership/courses"
            className="text-[12px] text-(--primary-600) font-medium flex items-center gap-1 hover:underline"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {!topCourses || topCourses.length === 0 ? (
          <p className="text-[13px] text-(--gray-400) text-center py-10">
            No courses with enrollments yet.
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-150">
              <thead>
                <tr className="bg-(--primary-50)">
                  {["Course", "Enrollments", "Completion", "Rating"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-[14px] font-semibold text-(--text-paragraph) tracking-wider px-5 py-3 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {topCourses.map((c) => (
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
                      {c.completion_rate}%
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
    </div>
  );
}
