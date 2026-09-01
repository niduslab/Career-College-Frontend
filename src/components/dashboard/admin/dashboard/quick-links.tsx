"use client";

import Link from "next/link";
import {
  Users,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Building2,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useAdminAnalyticsSummary } from "@/hooks/use-admin-analytics";

function formatCount(n: number | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString();
}

export default function AdminQuickLinks() {
  const { data: summary, isLoading } = useAdminAnalyticsSummary();

  const links = [
    {
      label: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
      count: summary?.users.total,
      color: "bg-(--primary-50) text-(--primary-600)",
    },
    {
      label: "Courses",
      href: "/dashboard/admin/courses",
      icon: BookOpen,
      count: summary?.courses.total,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Approvals",
      href: "/dashboard/admin/approvals",
      icon: ShieldCheck,
      count: summary?.courses.status_breakdown.under_review ?? 0,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Instructors",
      href: "/dashboard/admin/instructors",
      icon: GraduationCap,
      count: summary?.users.by_type.instructor,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Partners",
      href: "/dashboard/admin/partners",
      icon: Building2,
      count: summary?.users.by_type.partner_institution,
      color: "bg-orange-50 text-orange-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title) mb-4">
        Quick Access
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {links.map(({ label, href, icon: Icon, count, color }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-(--gray-200) hover:border-(--primary-200) hover:shadow-sm transition-all"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-[12px] font-semibold text-(--text-title) text-center leading-tight">
              {label}
            </p>
            <div className="flex items-center gap-0.5 text-(--gray-400) group-hover:text-(--primary-600) transition-colors">
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <span className="text-[11px] font-medium">{formatCount(count)}</span>
              )}
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
