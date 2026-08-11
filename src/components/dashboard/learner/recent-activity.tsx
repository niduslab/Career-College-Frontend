"use client";

import { useEffect, useRef } from "react";
import {
  Award,
  Target,
  CheckSquare,
  Clock,
  FileText,
  Code2,
  BookOpen,
} from "lucide-react";
import gsap from "gsap";

import { ListSkeleton } from "@/components/common/query-states";
import { useLearnerActivity } from "@/hooks/use-learner-dashboard";
import type { ActivityItem, ActivityType } from "@/lib/learner-dashboard-api";

const FEED_SIZE = 6;

/** Six event types, matching what the backend can actually source. Badge and
 *  XP rows are absent because no badge or XP event exists. */
const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: typeof Award; iconBg: string; iconColor: string; title: string }
> = {
  certificate_earned: {
    icon: Award,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "Earned certificate",
  },
  quiz_submitted: {
    icon: Target,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Submitted quiz",
  },
  lecture_completed: {
    icon: CheckSquare,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Completed lesson",
  },
  assignment_submitted: {
    icon: FileText,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Submitted assignment",
  },
  coding_submitted: {
    icon: Code2,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-500",
    title: "Submitted coding exercise",
  },
  course_enrolled: {
    icon: BookOpen,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    title: "Enrolled in a course",
  },
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

/** Numbers only when `meta` actually carries them — the backend supplies
 *  scores per type, and a missing one must not become a fabricated "0%". */
function activityHeadline(item: ActivityItem): string {
  const base = ACTIVITY_CONFIG[item.type].title;
  if (item.type === "quiz_submitted") {
    const score = item.meta.score;
    const max = item.meta.max_score;
    if (typeof score === "number" && typeof max === "number" && max > 0) {
      return `Scored ${Math.round((score / max) * 100)}% on quiz`;
    }
  }
  if (item.type === "coding_submitted") {
    const passed = item.meta.passed_tests;
    const total = item.meta.total_tests;
    if (typeof passed === "number" && typeof total === "number" && total > 0) {
      return `Passed ${passed}/${total} tests`;
    }
  }
  return base;
}

export default function RecentActivity() {
  const listRef = useRef<HTMLUListElement>(null);

  const { data, isLoading, isError } = useLearnerActivity({
    page: 1,
    page_size: FEED_SIZE,
  });
  const activities = data?.results ?? [];

  useEffect(() => {
    if (!listRef.current || activities.length === 0) return;

    const rows = listRef.current.querySelectorAll(".activity-row");
    const lines = listRef.current.querySelectorAll(".timeline-line");

    gsap.fromTo(
      rows,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.45, stagger: 0.1, ease: "power3.out" },
    );

    gsap.fromTo(
      lines,
      { scaleY: 0, transformOrigin: "top center" },
      {
        scaleY: 1,
        duration: 0.35,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.18,
      },
    );
  }, [activities.length]);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6">
      <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title) flex items-center gap-2 mb-5">
        <Clock className="w-5 h-5 text-(--primary-600)" />
        Recent Activity
      </h3>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : isError ? (
        <p className="text-[14px] text-(--gray-400) py-6 text-center">
          Couldn&apos;t load your recent activity.
        </p>
      ) : activities.length === 0 ? (
        <p className="text-[14px] text-(--gray-400) py-6 text-center">
          Nothing here yet — your progress will show up as you study.
        </p>
      ) : (
        <ul ref={listRef}>
          {activities.map((item, i) => {
            const cfg = ACTIVITY_CONFIG[item.type];
            const Icon = cfg.icon;
            return (
              <li
                key={item.id}
                className="activity-row opacity-0 flex gap-4 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="relative flex flex-col items-center shrink-0 w-9">
                  <div
                    className={`w-9 h-9 rounded-full ${cfg.iconBg} flex items-center justify-center z-10 shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                  </div>
                  {i < activities.length - 1 && (
                    <div className="timeline-line absolute top-9 -bottom-2.5 left-1/2 -translate-x-1/2 w-px bg-(--gray-200)" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-(--text-title)">
                      {activityHeadline(item)}
                    </p>
                    <p className="text-[12px] text-(--gray-500) mt-0.5 truncate">
                      {item.title}
                      {item.course ? ` · ${item.course.title}` : ""}
                    </p>
                  </div>
                  <span className="text-[12px] text-(--gray-500) shrink-0">
                    {relativeTime(item.occurred_at)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
