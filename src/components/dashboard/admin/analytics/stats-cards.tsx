"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Users, GraduationCap, Wallet, BookOpen } from "lucide-react";
import { useAdminAnalyticsSummary } from "@/hooks/use-admin-analytics";
import { StatsSkeleton } from "@/components/common/query-states";

const CARD_TINTS = [
  {
    bg: "from-(--primary-50) to-white",
    icon: "from-(--primary-500) to-(--primary-600)",
  },
  { bg: "from-indigo-50 to-white", icon: "from-indigo-400 to-indigo-500" },
  { bg: "from-amber-50 to-white", icon: "from-amber-400 to-amber-500" },
  {
    bg: "from-emerald-50 to-white",
    icon: "from-emerald-400 to-emerald-500",
  },
];

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatCurrency(n: number, currency: string): string {
  return `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

export default function AnalyticsStatsCards() {
  const cardsRef = useRef<(HTMLDivElement | HTMLAnchorElement | null)[]>([]);
  const { data: summary, isLoading } = useAdminAnalyticsSummary();

  const stats = [
    {
      label: "Total Users",
      value: summary ? formatNumber(summary.users.total) : "—",
      change: summary
        ? `${formatPct(summary.users.growth_pct)} vs previous window`
        : "",
      icon: Users,
      href: "/dashboard/admin/users",
    },
    {
      label: "Total Enrollments",
      value: summary ? formatNumber(summary.enrollments.total) : "—",
      change: summary
        ? `${formatPct(summary.enrollments.growth_pct)} vs previous window`
        : "",
      icon: GraduationCap,
      href: undefined,
    },
    {
      label: "Platform Revenue",
      value: summary
        ? summary.revenue.enabled
          ? formatCurrency(summary.revenue.gross, summary.revenue.currency)
          : "—"
        : "—",
      change: summary?.revenue.enabled
        ? `${formatPct(summary.revenue.growth_pct)} vs previous window`
        : "",
      icon: Wallet,
      href: undefined,
    },
    {
      label: "Active Courses",
      value: summary ? formatNumber(summary.courses.published) : "—",
      change: summary ? `${summary.courses.total} total courses` : "",
      icon: BookOpen,
      href: "/dashboard/admin/courses",
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
        const cardClassName = `opacity-0 bg-linear-to-b ${bg} rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
          s.href ? "cursor-pointer" : ""
        }`;
        const content = (
          <>
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
          </>
        );

        if (s.href) {
          return (
            <Link
              key={s.label}
              href={s.href}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className={cardClassName}
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={s.label}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className={cardClassName}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
