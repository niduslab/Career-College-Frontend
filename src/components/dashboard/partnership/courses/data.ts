import { BookOpen, Users, Star, TrendingUp } from "lucide-react";
import type { CourseStatus } from "@/lib/course-api";

export const STAT_ICONS = [BookOpen, Users, Star, TrendingUp];

export const TIPS = [
  {
    color: "text-blue-500",
    text: "Courses with intro videos see 3× higher enrollment rates.",
  },
  {
    color: "text-green-500",
    text: "Break content into modules under 10 minutes for best completion.",
  },
  {
    color: "text-orange-500",
    text: "Add quizzes to boost learner engagement by up to 40%.",
  },
];

export const STATUS_OPTIONS: ("All" | CourseStatus)[] = [
  "All",
  "draft",
  "institution_review",
  "under_review",
  "published",
  "rejected",
  "archived",
];

export const STATUS_LABEL: Record<"All" | CourseStatus, string> = {
  All: "All Statuses",
  draft: "Draft",
  institution_review: "Institution Review",
  under_review: "Under Review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

export const LEVEL_OPTIONS: ("All" | "beginner" | "intermediate" | "advanced")[] =
  ["All", "beginner", "intermediate", "advanced"];

export const LEVEL_LABEL: Record<string, string> = {
  All: "All Levels",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
