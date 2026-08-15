"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Clock,
  CalendarClock,
  CalendarCheck,
  Unlock,
  Video,
  BookOpen,
  Lock,
} from "lucide-react";
import gsap from "gsap";

import {
  useContinueLearning,
  useLearnerUpcoming,
} from "@/hooks/use-learner-dashboard";
import type { UpcomingItem, UpcomingType } from "@/lib/learner-dashboard-api";

/** The API returns exactly four upcoming kinds — icon and verb derive from
 *  those, not from an arbitrary per-item `action` string. */
const UPCOMING_CONFIG: Record<
  UpcomingType,
  { icon: typeof Video; iconBg: string; iconColor: string; action: string }
> = {
  course_starts: {
    icon: CalendarClock,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    action: "View",
  },
  course_ends: {
    icon: CalendarCheck,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    action: "View",
  },
  section_unlocks: {
    icon: Unlock,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    action: "Open",
  },
  webinar_starts: {
    icon: Video,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    action: "Join",
  },
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (sameDay) return `Today, ${time}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString())
    return `Tomorrow, ${time}`;

  return `${date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}, ${time}`;
}

function formatLectureLength(seconds: number | null): string | null {
  if (!seconds) return null;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function upcomingHref(item: UpcomingItem): string {
  if (item.type === "webinar_starts") return "/dashboard/learner/live-sessions";
  if (item.course)
    return `/dashboard/learner/course-player/${item.course.slug}`;
  return "/dashboard/learner/my-courses";
}

export default function ContinueLearning() {
  const heroRef = useRef<HTMLDivElement>(null);
  const upcomingRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const { data: resume, isLoading: resumeLoading } = useContinueLearning();
  const { data: upcoming } = useLearnerUpcoming({ days: 7, limit: 4 });

  const items = upcoming?.items ?? [];
  const progress = resume?.enrollment.progress_percent ?? 0;

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, x: -32 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.35 },
      );
    }
  }, []);

  useEffect(() => {
    if (!progressBarRef.current) return;
    gsap.fromTo(
      progressBarRef.current,
      { width: "0%" },
      {
        width: `${progress}%`,
        duration: 1.4,
        ease: "power2.out",
        delay: 0.4,
      },
    );
  }, [progress]);

  useEffect(() => {
    if (!upcomingRef.current) return;
    const rows = upcomingRef.current.querySelectorAll(".upcoming-row");
    if (rows.length === 0) return;
    gsap.fromTo(
      rows,
      { opacity: 0, x: 24 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.09, ease: "power3.out" },
    );
  }, [items.length]);

  const nextLectureLength = formatLectureLength(
    resume?.next_lecture?.duration_seconds ?? null,
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div
        ref={heroRef}
        className="opacity-0 relative flex-3 bg-white rounded-2xl border border-(--gray-200) p-6 lg:p-8 flex flex-col justify-between min-h-55"
      >
        <div>
          <div className="flex items-center gap-2 mb-4">
            {/* <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> */}
            <span className="text-[12px] font-semibold text-(--primary-600) tracking-widest uppercase">
              Continue Learning
            </span>
          </div>
          <h2 className="text-[20px] lg:text-[30px] font-bold text-(--text-title) leading-snug max-w-110">
            {resumeLoading
              ? "Loading your course…"
              : (resume?.course.title ?? "Start your first course")}
          </h2>
        </div>

        <div className="mt-6">
          {resume ? (
            <>
              <div className="flex items-center justify-between mb-1.5 gap-3">
                <span className="text-[12px] lg:text-[14px] text-(--gray-500) truncate">
                  {resume.next_lecture
                    ? `Up next: ${resume.next_lecture.title}`
                    : resume.is_course_complete
                      ? "You've finished this course"
                      : resume.locked_until
                        ? `Next section unlocks ${formatWhen(resume.locked_until)}`
                        : "Nothing left to watch here"}
                </span>
                <span className="text-[12px] lg:text-[14px] font-semibold text-(--primary-600) shrink-0">
                  {progress}% complete
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-(--primary-50)">
                <div
                  ref={progressBarRef}
                  className="h-2.5 rounded-full bg-(--primary-600)"
                  style={{ width: "0%" }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-5">
                {resume.next_lecture ? (
                  <Link
                    href={`/dashboard/learner/course-player/${resume.course.slug}`}
                    className="flex items-center gap-2 cursor-pointer bg-(--primary-600) text-white font-semibold text-[14px] px-4 py-2.5 rounded-lg hover:bg-(--primary-700) transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    Resume Learning
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/learner/course-player/${resume.course.slug}`}
                    className="flex items-center gap-2 cursor-pointer bg-(--primary-600) text-white font-semibold text-[14px] px-4 py-2.5 rounded-lg hover:bg-(--primary-700) transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    Open Course
                  </Link>
                )}
                {resume.next_lecture?.section && (
                  <span className="flex items-center gap-1.5 text-[12px] lg:text-[14px] text-(--gray-500) whitespace-nowrap">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    {resume.next_lecture.section.title}
                  </span>
                )}
                {nextLectureLength && (
                  <span className="flex items-center gap-1.5 text-[12px] lg:text-[14px] text-(--gray-500) whitespace-nowrap">
                    <Clock className="w-4 h-4 shrink-0" />
                    {nextLectureLength}
                  </span>
                )}
                {!resume.next_lecture && resume.locked_until && (
                  <span className="flex items-center gap-1.5 text-[12px] lg:text-[14px] text-(--gray-500) whitespace-nowrap">
                    <Lock className="w-4 h-4 shrink-0" />
                    Content on a release schedule
                  </span>
                )}
              </div>
            </>
          ) : (
            !resumeLoading && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[14px] text-(--gray-500)">
                  You&apos;re not enrolled in anything yet.
                </p>
                <Link
                  href="/dashboard/learner/course-catalog"
                  className="flex items-center gap-2 cursor-pointer bg-(--primary-600) text-white font-semibold text-[14px] px-4 py-2.5 rounded-lg hover:bg-(--primary-700) transition-colors whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  Browse the catalog
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      <div
        ref={upcomingRef}
        className="flex-2 bg-white rounded-2xl border border-(--gray-200) p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-(--text-title)">
            Upcoming
          </h3>
          <span className="text-[12px] font-semibold text-(--primary-600) bg-(--primary-50) px-2.5 py-1 rounded-lg">
            next 7 days
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-[14px] text-(--gray-400) py-6 text-center">
            Nothing scheduled this week.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const cfg = UPCOMING_CONFIG[item.type];
              const Icon = cfg.icon;
              return (
                <li
                  key={`${item.type}-${item.occurs_at}-${item.title}`}
                  className="upcoming-row opacity-0 flex bg-gray-100 p-3 rounded-xl items-center gap-3"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${cfg.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-(--text-title) truncate">
                      {item.title}
                    </p>
                    <p className="text-[12px] text-(--gray-400) font-medium">
                      {formatWhen(item.occurs_at)}
                      {item.subtitle ? ` · ${item.subtitle}` : ""}
                    </p>
                  </div>
                  <Link
                    href={upcomingHref(item)}
                    className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-colors border border-(--primary-600) text-(--primary-600) hover:bg-(--primary-50)"
                  >
                    {cfg.action}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
