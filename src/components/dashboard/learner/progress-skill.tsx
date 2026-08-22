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
    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay: 0.15 },
      );
    }
  }, []);

  const week = summary?.week_activity ?? [];
  const activeDays = week.filter((d) => d.is_active).length;

  return (
    <div
      ref={progressRef}
      className="opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6 flex flex-col gap-5"
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
          {/* 2 stat cards — matches stats-cards.tsx / achievements pattern */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                    Day Streak
                  </p>
                  <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                    {summary?.day_streak ?? 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-orange-50 flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6 text-orange-500" fill="currentColor" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 my-1" />
              <p className="text-[12px] font-medium text-(--success-500)">
                consecutive days
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                    Completed
                  </p>
                  <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                    {summary?.courses_completed ?? 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-(--primary-600)" />
                </div>
              </div>
              <div className="border border-dashed border-gray-200 my-1" />
              <p className="text-[12px] font-medium text-(--success-500)">
                courses
              </p>
            </div>
          </div>

          {/* Week activity — presence only, never a duration/magnitude bar */}
          <div className="rounded-2xl bg-(--gray-50) border border-(--gray-100) px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-semibold text-(--text-title)">
                This week
              </p>
              <span className="text-[11px] font-medium text-(--primary-600) bg-(--primary-50) px-2 py-0.5 rounded-full">
                {activeDays} of 7 days active
              </span>
            </div>
            <div className="flex items-center justify-between">
              {week.map((d) => {
                const isToday =
                  new Date(d.date).toDateString() ===
                  new Date().toDateString();
                return (
                  <div
                    key={d.date}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        d.is_active
                          ? "bg-(--primary-600)"
                          : isToday
                            ? "bg-white border-2 border-dashed border-(--primary-300)"
                            : "bg-white border border-(--gray-200)"
                      }`}
                    >
                      {d.is_active && (
                        <Check
                          className="w-4 h-4 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium ${isToday ? "text-(--primary-600)" : "text-(--gray-400)"}`}
                    >
                      {DAY_LABELS[new Date(d.date).getDay()]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
