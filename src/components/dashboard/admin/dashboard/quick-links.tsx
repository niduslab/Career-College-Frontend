import Link from "next/link";
import {
  Users,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Building2,
  Flag,
  ArrowUpRight,
} from "lucide-react";

const LINKS = [
  {
    label: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
    count: "48.9k",
    color: "bg-(--primary-50) text-(--primary-600)",
  },
  {
    label: "Courses",
    href: "/dashboard/admin/courses",
    icon: BookOpen,
    count: "3,184",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Approvals",
    href: "/dashboard/admin/approvals",
    icon: ShieldCheck,
    count: "18",
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Instructors",
    href: "/dashboard/admin/instructors",
    icon: GraduationCap,
    count: "1,260",
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Partners",
    href: "/dashboard/admin/partners",
    icon: Building2,
    count: "32",
    color: "bg-orange-50 text-orange-500",
  },
  {
    label: "Moderation",
    href: "/dashboard/admin/moderation",
    icon: Flag,
    count: "7",
    color: "bg-pink-50 text-pink-600",
  },
];

export default function AdminQuickLinks() {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title) mb-4">
        Quick Access
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {LINKS.map(({ label, href, icon: Icon, count, color }) => (
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
              <span className="text-[11px] font-medium">{count}</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
