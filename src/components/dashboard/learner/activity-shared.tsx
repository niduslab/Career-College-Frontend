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
    iconBg: "bg-gradient-to-br from-blue-400 to-blue-500",
    iconColor: "text-white",
    title: "Earned certificate",
  },
  quiz_submitted: {
    icon: Target,
    iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-500",
    iconColor: "text-white",
    title: "Submitted quiz",
  },
  lecture_completed: {
    icon: CheckSquare,
    iconBg: "bg-gradient-to-br from-indigo-400 to-indigo-500",
    iconColor: "text-white",
    title: "Completed lesson",
  },
  assignment_submitted: {
    icon: FileText,
    iconBg: "bg-gradient-to-br from-amber-400 to-amber-500",
    iconColor: "text-white",
    title: "Submitted assignment",
  },
  coding_submitted: {
    icon: Code2,
    iconBg: "bg-gradient-to-br from-pink-400 to-pink-500",
    iconColor: "text-white",
    title: "Submitted coding exercise",
  },
  course_enrolled: {
    icon: BookOpen,
    iconBg: "bg-gradient-to-br from-orange-400 to-orange-500",
    iconColor: "text-white",
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
