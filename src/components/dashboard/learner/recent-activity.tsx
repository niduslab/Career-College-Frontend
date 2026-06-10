"use client";

import { useEffect, useRef } from "react";
import { Award, Target, Trophy, CheckSquare, Zap, Clock } from "lucide-react";
import gsap from "gsap";

const activities = [
  {
    icon: Award,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "Earned certificate",
    sub: "Deep Learning Foundations",
    time: "1 week ago",
  },
  {
    icon: Target,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Scored 94% on quiz",
    sub: "Convolutional Networks",
    time: "2 days ago",
  },
  {
    icon: Trophy,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    title: "Unlocked badge",
    sub: '"Consistency King" — 21 day streak',
    time: "6 days ago",
  },
  {
    icon: CheckSquare,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Completed lesson",
    sub: "Backpropagation Explained",
    time: "2 hours ago",
  },
  {
    icon: Zap,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-500",
    title: "+150 XP earned",
    sub: "Daily challenge complete",
    time: "Today",
  },
];

export default function RecentActivity() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const rows = listRef.current.querySelectorAll(".activity-row");
    gsap.fromTo(
      rows,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.45, stagger: 0.08, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6">
      <h3 className="text-[16px] font-bold text-(--text-title) flex items-center gap-2 mb-5">
        <Clock className="w-5 h-5 text-(--primary-600)" />
        Recent Activity
      </h3>

      <ul ref={listRef} className="divide-y divide-(--gray-100)">
        {activities.map((item, i) => {
          const Icon = item.icon;
          return (
            <li
              key={i}
              className="activity-row opacity-0 flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              {/* Icon + vertical line */}
              <div className="relative flex flex-col items-center self-stretch">
                <div
                  className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 z-10`}
                >
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                {i < activities.length - 1 && (
                  <div className="w-px flex-1 bg-(--gray-200) mt-1" />
                )}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <p className="text-[13px] font-semibold text-(--text-title)">{item.title}</p>
                <p className="text-[12px] text-(--gray-400) mt-0.5">{item.sub}</p>
              </div>

              <span className="text-[12px] text-(--gray-400) shrink-0">{item.time}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
