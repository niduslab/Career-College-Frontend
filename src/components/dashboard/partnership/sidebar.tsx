"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  BookOpenText,
  LayoutDashboard,
  ChartColumn,
  MessageSquareMore,
  DollarSign,
  Settings,
  GraduationCap,
  BookOpen,
  UsersRound,
  Video,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/dashboard/partnership",
      },
      {
        icon: GraduationCap,
        label: "Instructors",
        href: "/dashboard/partnership/instructors",
      },
      {
        icon: BookOpen,
        label: "Courses",
        href: "/dashboard/partnership/courses",
      },
      {
        icon: UsersRound,
        label: "Cohorts",
        href: "/dashboard/partnership/cohorts",
      },
      {
        icon: Video,
        label: "Webinars",
        href: "/dashboard/partnership/webinars",
      },
    ],
  },

  // {
  //   label: "Partnerships",
  //   items: [
  //     {
  //       icon: Handshake,
  //       label: "Partnerships",
  //       href: "/dashboard/partnership/partnerships",
  //     },
  //     {
  //       icon: Building2,
  //       label: "Organizations",
  //       href: "/dashboard/partnership/organizations",
  //     },
  //     {
  //       icon: FileText,
  //       label: "Proposals",
  //       href: "/dashboard/partnership/proposals",
  //     },
  //   ],
  // },
  {
    label: "Insights",
    items: [
      {
        icon: ChartColumn,
        label: "Analytics",
        href: "/dashboard/partnership/analytics",
      },

      {
        icon: MessageSquareMore,
        label: "Messages",
        href: "/dashboard/partnership/messages",
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        icon: DollarSign,
        label: "Revenue",
        href: "/dashboard/partnership/revenue",
      },
      // {
      //   icon: BadgePercent,
      //   label: "Commissions",
      //   href: "/dashboard/partnership/commissions",
      // },
    ],
  },
  {
    label: "Account",
    items: [
      {
        icon: Settings,
        label: "Settings",
        href: "/dashboard/partnership/settings",
      },
    ],
  },
];

export default function PartnershipSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("togglePartnershipSidebar", handler);
    return () =>
      window.removeEventListener("togglePartnershipSidebar", handler);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={close}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-55 bg-white border-r border-(--gray-200) flex flex-col py-6 transition-transform duration-300
          lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto lg:shrink-0 lg:self-start
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="px-6 mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 lg:gap-0"
            onClick={close}
          >
            <div className="w-9 h-9 flex items-center justify-center">
              <BookOpenText className="w-6 h-6 text-(--primary-600)" />
            </div>
            <span className="font-medium text-(--primary-600) text-[16px] lg:text-[20px]">
              CareerCollege
            </span>
          </Link>
          <button
            onClick={close}
            className="lg:hidden ml-6 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100)"
          >
            <X className="w-4 h-4 text-(--gray-500)" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[12px] font-medium text-(--gray-600) tracking-[0.08em] px-3 mb-2">
                {section.label}
              </p>
              <ul className="space-y-1.5">
                {section.items.map(({ icon: Icon, label, href }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={close}
                        className={`flex items-center gap-3 h-9 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                          active
                            ? "bg-(--primary-600) font-medium text-white hover:bg-(--primary-700)"
                            : "text-(--gray-600) font-normal hover:bg-(--gray-100) hover:text-(--text-title)"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-(--gray-500)"}`}
                        />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
