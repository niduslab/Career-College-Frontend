import { ArrowUpRight } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import avatar1 from "@/assets/images/instructors/instructor1.webp";
import avatar2 from "@/assets/images/instructors/instructor2.webp";
import avatar3 from "@/assets/images/instructors/instructor3.webp";
import avatar4 from "@/assets/images/instructors/instructor4.webp";
import avatar5 from "@/assets/images/instructors/instructor5.webp";

interface ActivityItem {
  avatar: StaticImageData;
  actor: string;
  action: string;
  detail: string;
  time: string;
  type: "success" | "warning" | "info" | "neutral";
}

const ACTIVITIES: ActivityItem[] = [
  {
    avatar: avatar1,
    actor: "AI Review",
    action: "auto-approved",
    detail: "“Advanced React Patterns” (score 88)",
    time: "12m ago",
    type: "success",
  },
  {
    avatar: avatar2,
    actor: "Sarah Mitchell",
    action: "flagged",
    detail: "course for manual review (score 61)",
    time: "1h ago",
    type: "warning",
  },
  {
    avatar: avatar3,
    actor: "Greenfield University",
    action: "partner application",
    detail: "submitted for verification",
    time: "3h ago",
    type: "info",
  },
  {
    avatar: avatar4,
    actor: "Moderation",
    action: "content removed",
    detail: "policy violation in a blog post",
    time: "5h ago",
    type: "warning",
  },
  {
    avatar: avatar5,
    actor: "Finance",
    action: "payout processed",
    detail: "$14,200 to 38 instructors",
    time: "1d ago",
    type: "success",
  },
  {
    avatar: avatar1,
    actor: "James Carter",
    action: "account suspended",
    detail: "after repeated reports",
    time: "2d ago",
    type: "neutral",
  },
];

const TYPE_DOT: Record<ActivityItem["type"], string> = {
  success: "bg-emerald-500",
  warning: "bg-orange-400",
  info: "bg-blue-500",
  neutral: "bg-(--gray-300)",
};

export default function AdminActivityFeed() {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
          Recent Activity
        </p>
        <button
          type="button"
          className="text-[12px] text-(--primary-600) font-medium flex items-center gap-0.5 hover:underline cursor-pointer"
        >
          View all <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <ul className="space-y-4 flex-1">
        {ACTIVITIES.map((a, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={a.avatar}
                  alt={a.actor}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${TYPE_DOT[a.type]}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-(--text-title) leading-snug">
                <span className="font-semibold">{a.actor}</span>{" "}
                <span className="text-(--gray-500)">{a.action}</span>{" "}
                <span className="font-medium">{a.detail}</span>
              </p>
              <p className="text-[11px] text-(--gray-400) mt-0.5">{a.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
