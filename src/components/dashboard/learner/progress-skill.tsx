"use client";

import { useEffect, useRef } from "react";
import { Flame, BookOpen, Trophy, Check } from "lucide-react";
import gsap from "gsap";
import { useLearnerSummary } from "@/hooks/use-learner-dashboard";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProgressSkill() {
  const progressRef = useRef<HTMLDivElement>(null);
  const { data: summary, isLoading } = useLearnerSummary();

  useEffect(() => {
    if (!progressRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        progressRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay: 0.15 },
      );
    }, progressRef);
    return () => ctx.revert();
  }, []);

  const week = summary?.week_activity ?? [];
  const activeDays = week.filter((d) => d.is_active).length;

  return (
    <div
      ref={progressRef}
      className="opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] lg:text-[18px] font-semibold text-(--text-title) flex items-center gap-2">
          <Trophy className="w-5 h-5 text-(--primary-600)" />
          Your Progress
        </h3>
      </div>

      {isLoading ? (
        <p className="text-[13px] text-(--gray-400)">Loading...</p>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row lg:items-start gap-3">
            {/* 2 stat cards — stacked in a narrow left column */}
            <div className="flex flex-col gap-3 lg:w-72 shrink-0">
              <div className="bg-linear-to-b from-orange-50 to-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-(--gray-500) font-medium mb-2">
                      Day Streak
                    </p>
                    <p className="text-[22px] lg:text-[26px] font-bold text-(--text-title) leading-none tracking-tight">
                      {summary?.day_streak ?? 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-linear-to-br from-orange-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                    <Flame className="w-5 h-5 text-white" fill="currentColor" />
                  </div>
                </div>
                <div className="border border-dashed border-gray-200 my-1" />
                <p className="text-[12px] font-medium text-(--gray-500)">
                  consecutive days
                </p>
              </div>
              <div className="bg-linear-to-b from-indigo-50 to-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-(--gray-500) font-medium mb-2">
                      Completed
                    </p>
                    <p className="text-[22px] lg:text-[26px] font-bold text-(--text-title) leading-none tracking-tight">
                      {summary?.courses_completed ?? 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-linear-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="border border-dashed border-gray-200 my-1" />
                <p className="text-[12px] font-medium text-(--gray-500)">
                  courses
                </p>
              </div>
            </div>

            {/* Week activity — presence only, never a duration/magnitude bar */}
            <div className="flex-1 rounded-2xl bg-linear-to-b from-(--gray-50) to-white border border-(--gray-100) px-4 py-5 md:px-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[13px] font-semibold text-(--text-title)">
                  This week
                </p>
                <span className="text-[11px] font-medium text-(--primary-600) bg-(--primary-50) px-2 py-0.5 rounded-full">
                  {activeDays} of 7 days active
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-between gap-2 sm:gap-0">
                {week.map((d) => {
                  const isToday =
                    new Date(d.date).toDateString() ===
                    new Date().toDateString();
                  return (
                    <div
                      key={d.date}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none"
                    >
                      <div
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                          d.is_active
                            ? "bg-linear-to-br from-(--primary-500) to-(--primary-700) shadow-sm"
                            : isToday
                              ? "bg-white border-2 border-dashed border-(--primary-300)"
                              : "bg-(--gray-100) border border-(--gray-200)"
                        }`}
                      >
                        {d.is_active && (
                          <Check
                            className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] font-medium ${isToday ? "text-(--primary-600)" : "text-(--gray-400)"}`}
                      >
                        {DAY_LABELS[new Date(d.date).getDay()]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[12px] text-(--gray-400) mt-5 pt-4 border-t border-dashed border-(--gray-200)">
                {activeDays === 0
                  ? "No active days yet this week — study today to start."
                  : activeDays === 7
                    ? "Perfect week — active every day."
                    : `${7 - activeDays} day${7 - activeDays === 1 ? "" : "s"} left to keep the week going.`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
