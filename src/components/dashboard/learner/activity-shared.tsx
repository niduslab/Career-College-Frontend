import {
  Award,
  Target,
  CheckSquare,
  Clock,
  FileText,
  Code2,
  BookOpen,
} from "lucide-react";

import type { ActivityItem, ActivityType } from "@/lib/learner-dashboard-api";

/** Six event types, matching what the backend can actually source. Badge and
 *  XP rows are absent because no badge or XP event exists. */
export const ACTIVITY_CONFIG: Record<
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

export function relativeTime(iso: string): string {
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
export function activityHeadline(item: ActivityItem): string {
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

export { Clock };
