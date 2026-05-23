"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X, BookOpen, LayoutDashboard, Hammer, ClipboardList,
  Radio, Users, BarChart2, MessageSquare, DollarSign,
  Megaphone, Award, Settings,
} from "lucide-react";

const navSections = [
  {
    label: "Management",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/instructor" },
      { icon: BookOpen, label: "My Course", href: "/dashboard/instructor/my-course" },
      { icon: Hammer, label: "Course Builder", href: "/dashboard/instructor/course-builder" },
      { icon: ClipboardList, label: "Assessments", href: "/dashboard/instructor/assessments" },
      { icon: Radio, label: "Live Sessions", href: "/dashboard/instructor/live-sessions" },
    ],
  },
  {
    label: "Community",
    items: [
      { icon: Users, label: "Students", href: "/dashboard/instructor/students" },
      { icon: BarChart2, label: "Analytics", href: "/dashboard/instructor/analytics" },
      { icon: MessageSquare, label: "Messages", href: "/dashboard/instructor/messages" },
    ],
  },
  {
    label: "Growth",
    items: [
      { icon: DollarSign, label: "Revenue", href: "/dashboard/instructor/revenue" },
      { icon: Megaphone, label: "Blog & Marketing", href: "/dashboard/instructor/blog-marketing" },
      { icon: Award, label: "Certificates", href: "/dashboard/instructor/certificates" },
      { icon: Settings, label: "Settings", href: "/dashboard/instructor/settings" },
    ],
  },
];

export default function InstructorSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("toggleSidebar", handler);
    return () => window.removeEventListener("toggleSidebar", handler);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={close} />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-55 bg-white border-r border-(--gray-200) flex flex-col py-6 transition-transform duration-300
          lg:static lg:translate-x-0 lg:z-auto lg:shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="px-6 mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={close}>
            <div className="w-7 h-7 bg-(--primary-600) rounded-md flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-(--text-title) text-[15px]">CareerCollege</span>
          </Link>
          <button onClick={close} className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-100)">
            <X className="w-4 h-4 text-(--gray-500)" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[11px] font-semibold text-(--gray-400) uppercase tracking-wider px-3 mb-2">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map(({ icon: Icon, label, href }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={close}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                          active
                            ? "bg-(--primary-50) text-(--primary-600)"
                            : "text-(--gray-600) hover:bg-(--gray-100) hover:text-(--text-title)"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-(--primary-600)" : "text-(--gray-400)"}`} />
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
