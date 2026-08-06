import { Video, Users, PlayCircle, TrendingUp } from "lucide-react";
import type { WebinarStatus } from "./types";

export const STAT_ICONS = [Video, Users, PlayCircle, TrendingUp];

export const TIPS = [
  {
    color: "text-blue-500",
    text: "Send reminder emails 24h and 1h before the webinar starts.",
  },
  {
    color: "text-green-500",
    text: "Record all sessions — replays typically get 2× the live views.",
  },
  {
    color: "text-orange-500",
    text: "Keep live Q&A to the last 15 minutes for best engagement.",
  },
];

export const STATUS_OPTIONS: ("All" | WebinarStatus)[] = [
  "All",
  "draft",
  "published",
  "archived",
];

export const STATUS_LABEL: Record<"All" | WebinarStatus, string> = {
  All: "All Statuses",
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};
