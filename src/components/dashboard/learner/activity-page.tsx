"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ListSkeleton } from "@/components/common/query-states";
import { Pagination } from "@/components/common/pagination";
import { useLearnerActivity } from "@/hooks/use-learner-dashboard";
import {
  ACTIVITY_CONFIG,
  activityHeadline,
  relativeTime,
  Clock,
} from "./activity-shared";

const PAGE_SIZE = 20;

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useLearnerActivity({
    page,
    page_size: PAGE_SIZE,
  });

  const activities = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/learner"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-(--gray-500) hover:text-(--text-title) mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6">
        <h1 className="text-[18px] lg:text-[20px] font-semibold text-(--text-title) flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-(--primary-600)" />
          Recent Activity
        </h1>
        <p className="text-[13px] text-(--gray-500) mb-5">
          Your most recent study activity, newest first. Shows up to the last
          200 events.
        </p>

        {isLoading ? (
          <ListSkeleton count={6} />
        ) : isError ? (
          <p className="text-[14px] text-(--gray-400) py-6 text-center">
            Couldn&apos;t load your activity.
          </p>
        ) : activities.length === 0 ? (
          <p className="text-[14px] text-(--gray-400) py-6 text-center">
            Nothing here yet — your progress will show up as you study.
          </p>
        ) : (
          <ul>
            {activities.map((item, i) => {
              const cfg = ACTIVITY_CONFIG[item.type];
              const Icon = cfg.icon;
              return (
                <li
                  key={item.id}
                  className="flex gap-4 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="relative flex flex-col items-center shrink-0 w-9">
                    <div
                      className={`w-9 h-9 rounded-full ${cfg.iconBg} flex items-center justify-center z-10 shrink-0`}
                    >
                      <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                    </div>
                    {i < activities.length - 1 && (
                      <div className="absolute top-9 -bottom-6.5 left-1/2 -translate-x-1/2 w-px bg-(--gray-200)" />
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
