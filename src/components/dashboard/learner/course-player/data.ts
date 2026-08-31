import { BookOpen, File, FileText, Star, Target } from "lucide-react";

export const AI_SHORTCUTS = [
  { icon: FileText, label: "Summarize lesson" },
  { icon: Target, label: "Explain concept" },
  { icon: BookOpen, label: "Quiz me" },
  { icon: File, label: "Generate notes" },
  { icon: Star, label: "Study plan" },
];

export const AI_INITIAL =
  "Hi! I'm following along with this lesson. Ask me anything, or pick a shortcut below 👇";

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
