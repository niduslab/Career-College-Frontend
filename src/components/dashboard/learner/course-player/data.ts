import { BookOpen, File, FileText, Star, Target } from "lucide-react";
import type { Module, TabKey } from "./types";

export const modules: Module[] = [
  {
    id: 4,
    title: "Module 4 · Ensemble Methods",
    lessons: [
      {
        id: 1,
        title: "Introduction to Ensembles",
        duration: "8:24",
        status: "completed",
        type: "video",
      },
      {
        id: 2,
        title: "Bagging & Random Forests",
        duration: "14:10",
        status: "completed",
        type: "video",
      },
      {
        id: 3,
        title: "Boosting Fundamentals",
        duration: "11:38",
        status: "completed",
        type: "video",
      },
      {
        id: 4,
        title: "Gradient Boosting & XGBoost",
        duration: "18:52",
        status: "active",
        type: "video",
      },
      {
        id: 5,
        title: "Hyperparameter Tuning",
        duration: "15:20",
        status: "pending",
        type: "video",
      },
      {
        id: 6,
        title: "Module Quiz",
        duration: "10 questions",
        status: "pending",
        type: "quiz",
      },
    ],
  },
  {
    id: 5,
    title: "Module 5 · Model Evaluation",
    lessons: [
      {
        id: 7,
        title: "Cross-Validation Strategies",
        duration: "12:05",
        status: "pending",
        type: "video",
      },
      {
        id: 8,
        title: "ROC, AUC & Precision-Recall",
        duration: "16:40",
        status: "pending",
        type: "video",
      },
      {
        id: 9,
        title: "Handling Imbalanced Data",
        duration: "13:15",
        status: "pending",
        type: "video",
      },
    ],
  },
  // {
  //   id: 6,
  //   title: "Module 6 · Feature Engineering",
  //   lessons: [
  //     { id: 10, title: "Feature Selection Methods", duration: "14:30", status: "pending", type: "video" },
  //     { id: 11, title: "Encoding & Scaling", duration: "11:00", status: "pending", type: "video" },
  //   ],
  // },
];

export const ACTIVE_LESSON = {
  moduleLabel: "Lesson 4 · Gradient Boosting & XGBoost",
  title: "Gradient Boosting & XGBoost",
  description:
    "In this lesson we build intuition for gradient boosting — sequentially fitting weak learners to the residual errors of prior models. You'll learn how XGBoost adds regularization, handles missing values natively, and why learning rate and tree depth are the levers that matter most.",
  objectives: 4,
  duration: "18:52",
  resources: 3,
  xp: "+80 XP",
};

export const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "resources", label: "Resources" },
  { key: "transcript", label: "Transcript" },
  { key: "discussion", label: "Discussion" },
  { key: "reviews", label: "Reviews" },
];

export const AI_SHORTCUTS = [
  { icon: FileText, label: "Summarize lesson" },
  { icon: Target, label: "Explain concept" },
  { icon: BookOpen, label: "Quiz me" },
  { icon: File, label: "Generate notes" },
  { icon: Star, label: "Study plan" },
];

export const AI_INITIAL =
  "Hi Ayesha! I'm following along with this lesson on gradient boosting. Ask me anything, or pick a shortcut below 👇";

export const VIDEO_SRC = "https://www.w3schools.com/html/mov_bbb.mp4";

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
