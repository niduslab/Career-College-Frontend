"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

import { ListSkeleton } from "@/components/common/query-states";
import { useLearnerActivity } from "@/hooks/use-learner-dashboard";
import {
  ACTIVITY_CONFIG,
  activityHeadline,
  relativeTime,
  Clock,
} from "./activity-shared";

const FEED_SIZE = 6;

export default function RecentActivity() {
  const listRef = useRef<HTMLUListElement>(null);

  const { data, isLoading, isError } = useLearnerActivity({
    page: 1,
    page_size: FEED_SIZE,
  });
  const activities = data?.results ?? [];

  useEffect(() => {
    if (!listRef.current || activities.length === 0) return;

    const rows = listRef.current.querySelectorAll(".activity-row");
    const lines = listRef.current.querySelectorAll(".timeline-line");

    gsap.fromTo(
      rows,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.45, stagger: 0.1, ease: "power3.out" },
    );

    gsap.fromTo(
      lines,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.35,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.18,
      },
    );
  }, [activities.length]);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title) flex items-center gap-2">
          <Clock className="w-5 h-5 text-(--primary-600)" />
          Recent Activity
        </h3>
        <Link
          href="/dashboard/learner/activity"
          className="text-[13px] font-semibold text-(--primary-600) hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : isError ? (
        <p className="text-[14px] text-(--gray-400) py-6 text-center">
          Couldn&apos;t load your recent activity.
        </p>
      ) : activities.length === 0 ? (
        <p className="text-[14px] text-(--gray-400) py-6 text-center">
          Nothing here yet — your progress will show up as you study.
        </p>
      ) : (
        <ul ref={listRef}>
          {activities.map((item, i) => {
            const cfg = ACTIVITY_CONFIG[item.type];
            const Icon = cfg.icon;
            return (
              <li
                key={item.id}
                className="activity-row opacity-0 flex gap-4 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="relative flex flex-col items-center shrink-0 w-9">
                  <div
                    className={`w-9 h-9 rounded-full ${cfg.iconBg} flex items-center justify-center z-10 shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                  </div>
                  {i < activities.length - 1 && (
                    <div className="timeline-line absolute top-9 -bottom-6.5 left-1/2 -translate-x-1/2 w-px bg-(--gray-200)" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-(--text-title)">
                      {activityHeadline(item)}
                    </p>
                    <p className="text-[12px] text-(--gray-500) mt-0.5 truncate">
                      {item.title}
                      {item.course ? ` · ${item.course.title}` : ""}
                    </p>
                  </div>
                  <span className="text-[12px] text-(--gray-500) shrink-0">
                    {relativeTime(item.occurred_at)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
