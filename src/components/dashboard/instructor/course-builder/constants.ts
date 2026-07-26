import {
  BookOpen,
  FileQuestion,
  Code2,
  ClipboardList,
  Settings,
  Rocket,
  CalendarClock,
  Users,
} from "lucide-react";
import type { Step, LessonType, Module } from "./types";

export const SELF_PACED_STEPS: { key: Step; icon: React.ElementType }[] = [
  { key: "Setup", icon: Settings },
  { key: "Team", icon: Users },
  { key: "Curriculum", icon: BookOpen },
  { key: "Review", icon: Rocket },
];

export const SCHEDULED_STEPS: { key: Step; icon: React.ElementType }[] = [
  { key: "Setup", icon: Settings },
  { key: "Team", icon: Users },
  { key: "Schedule", icon: CalendarClock },
  { key: "Curriculum", icon: BookOpen },
  { key: "Review", icon: Rocket },
];

/** @deprecated use SELF_PACED_STEPS / SCHEDULED_STEPS based on the course's delivery_mode. */
export const steps = SELF_PACED_STEPS;

export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const VIDEO_TYPES = ["Free Preview", "Paid"];

export const LESSON_TYPES: { key: LessonType; icon: React.ElementType }[] = [
  { key: "Lecture", icon: BookOpen },
  { key: "Quiz", icon: FileQuestion },
  { key: "Coding Exercise", icon: Code2 },
  { key: "Assignment", icon: ClipboardList },
];

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function totalLessons(modules: Module[]) {
  return modules.reduce((s, m) => s + m.lessons.length, 0);
}
