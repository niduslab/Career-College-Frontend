import {
  BookOpen,
  FileQuestion,
  Code2,
  ClipboardList,
  Settings,
  Rocket,
} from "lucide-react";
import type { Step, LessonType, Module } from "./types";

export const steps: { key: Step; icon: React.ElementType }[] = [
  { key: "Setup", icon: Settings },
  { key: "Curriculum", icon: BookOpen },
  { key: "Review", icon: Rocket },
];

export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const VIDEO_TYPES = ["Free Preview", "Paid"];

export const LESSON_TYPES: { key: LessonType; icon: React.ElementType }[] = [
  { key: "Lecture", icon: BookOpen },
  { key: "Quiz", icon: FileQuestion },
  { key: "Coding Exercise", icon: Code2 },
  { key: "Assignment", icon: ClipboardList },
];

export const SEED_MODULES: Module[] = [
  {
    id: "m1",
    title: "Module 01 - Getting Started",
    summary: "",
    expanded: true,
    lessons: [
      {
        id: "l1",
        type: "Lecture",
        title: "Introduction to Figma Essentials training course",
        videoType: "Free Preview",
        duration: "2.34",
        description: "",
        isFreePreview: true,
      },
      {
        id: "l2",
        type: "Lecture",
        title: "Getting started with Figma training",
        videoType: "Free Preview",
        duration: "5.34",
        description: "",
        isFreePreview: true,
      },
      {
        id: "l3",
        type: "Lecture",
        title: "What is Figma for & does it do the coding?",
        videoType: "Paid",
        duration: "8.20",
        description: "",
        isFreePreview: false,
      },
      {
        id: "l4",
        type: "Lecture",
        title: "What we are making in this Figma course",
        videoType: "Paid",
        duration: "3.10",
        description: "",
        isFreePreview: false,
      },
    ],
  },
  {
    id: "m2",
    title: "Module 02 - Wire framing Low Fidelity",
    summary: "",
    expanded: false,
    lessons: [
      {
        id: "l5",
        type: "Lecture",
        title: "Wireframe basics",
        videoType: "Paid",
        duration: "4.00",
        description: "",
        isFreePreview: false,
      },
      {
        id: "l6",
        type: "Lecture",
        title: "Lo-fi layout techniques",
        videoType: "Paid",
        duration: "6.15",
        description: "",
        isFreePreview: false,
      },
      {
        id: "l7",
        type: "Lecture",
        title: "User flow mapping",
        videoType: "Paid",
        duration: "5.45",
        description: "",
        isFreePreview: false,
      },
    ],
  },
  {
    id: "m3",
    title: "Module 03 - Design System",
    summary: "",
    expanded: false,
    lessons: [
      {
        id: "l8",
        type: "Lecture",
        title: "Design tokens overview",
        videoType: "Paid",
        duration: "7.00",
        description: "",
        isFreePreview: false,
      },
    ],
  },
];

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function totalLessons(modules: Module[]) {
  return modules.reduce((s, m) => s + m.lessons.length, 0);
}
