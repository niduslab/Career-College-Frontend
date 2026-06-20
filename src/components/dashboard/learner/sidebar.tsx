"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  BookOpenText,
  LayoutDashboard,
  BookOpen,
  Play,
  Award,
  Settings,
  Heart,
  SplinePointer,
  Target,
  Trophy,
  Search,
  Video,
  MessageCircle,
  Users,
  Calendar,
  CreditCard,
  NotebookPen,
  Sparkles,
} from "lucide-react";

const navSections = [
  {
    label: "Learning",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/dashboard/learner",
      },
      {
        icon: BookOpen,
        label: "My Courses",
        href: "/dashboard/learner/my-courses",
      },
      {
        icon: SplinePointer,
        label: "Learning Paths",
        href: "/dashboard/learner/learning-paths",
      },
      {
        icon: Play,
        label: "Course Player",
        href: "/dashboard/learner/course-player",
      },
      {
        icon: Target,
        label: "Quiz Assessment",
        href: "/dashboard/learner/quiz-assessment",
      },
    ],
  },
  {
    label: "Grow",
    items: [
      {
        icon: Award,
        label: "Certificates",
        href: "/dashboard/learner/certificates",
      },
      {
        icon: Trophy,
        label: "Achievements",
        href: "/dashboard/learner/achievements",
      },
      {
        icon: Search,
        label: "Course Catalog",
        href: "/dashboard/learner/course-catalog",
      },
      {
        icon: Heart,
        label: "Wishlist",
        href: "/dashboard/learner/wishlist",
      },
    ],
  },
  {
    label: "Connect",
    items: [
      {
        icon: Video,
        label: "Live Sessions",
        href: "/dashboard/learner/live-sessions",
      },
      {
        icon: MessageCircle,
        label: "Discussions",
        href: "/dashboard/learner/discussions",
      },
      {
        icon: Users,
        label: "Study Groups",
        href: "/dashboard/learner/study-groups",
      },
      {
        icon: Calendar,
        label: "Consultancy",
        href: "/dashboard/learner/consultancy",
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        icon: Sparkles,
        label: "AI Assistant",
        href: "/dashboard/learner/ai-assistant",
      },
      {
        icon: NotebookPen,
        label: "Notes",
        href: "/dashboard/learner/notes",
      },
      {
        icon: CreditCard,
        label: "Payment History",
        href: "/dashboard/learner/payment-history",
      },
      {
        icon: Settings,
        label: "Settings",
        href: "/dashboard/learner/settings",
      },
    ],
  },
];

export default function LearnerSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("toggleLearnerSidebar", handler);
    return () => window.removeEventListener("toggleLearnerSidebar", handler);
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
              <p className="text-[12px] font-semibold text-(--gray-400) tracking-[0.08em] uppercase px-3 mb-1">
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
                        className={`flex items-center gap-3 h-9 px-3 rounded-lg text-[14px] transition-colors ${
                          active
                            ? "bg-(--primary-600) font-medium text-white hover:bg-(--primary-700)"
                            : "text-(--gray-500) font-normal hover:bg-(--gray-100) hover:text-(--text-title)"
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
