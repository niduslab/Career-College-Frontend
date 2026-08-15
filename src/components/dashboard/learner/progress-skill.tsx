"use client";

import { useEffect, useRef } from "react";
import { Flame, BookOpen, Trophy } from "lucide-react";
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
          {/* 2 stat pills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-(--gray-50) rounded-xl px-4 py-3 border border-(--gray-100)">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-orange-50 flex items-center justify-center">
                <Flame className="w-4.5 h-4.5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[20px] font-extrabold text-(--text-title) leading-none">
                  {summary?.day_streak ?? 0}
                </p>
                <p className="text-[11px] text-(--gray-500) font-medium mt-1">
                  Day streak
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-(--gray-50) rounded-xl px-4 py-3 border border-(--gray-100)">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-(--primary-50) flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5 text-(--primary-600)" />
              </div>
              <div className="min-w-0">
                <p className="text-[20px] font-extrabold text-(--text-title) leading-none">
                  {summary?.courses_completed ?? 0}
                </p>
                <p className="text-[11px] text-(--gray-500) font-medium mt-1">
                  Completed
                </p>
              </div>
            </div>
          </div>

          {/* Week activity — presence only, never a duration/magnitude bar */}
          <div className="rounded-2xl bg-(--gray-50) border border-(--gray-100) px-4 py-3.5">
            <div className="flex items-center justify-between mb-3.5">
              <p className="text-[13px] font-semibold text-(--text-title)">
                This week
              </p>
              <span className="text-[11px] font-medium text-(--primary-600) bg-(--primary-50) px-2 py-0.5 rounded-full">
                {activeDays} of 7 days active
              </span>
            </div>
            <div className="flex items-center gap-2">
              {week.map((d) => {
                const isToday =
                  new Date(d.date).toDateString() ===
                  new Date().toDateString();
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`w-full h-9 rounded-lg flex items-center justify-center transition-colors ${
                        d.is_active
                          ? "bg-(--primary-600)"
                          : "bg-white border border-(--gray-200)"
                      } ${isToday && !d.is_active ? "border-(--primary-300) border-dashed" : ""}`}
                    >
                      {d.is_active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${isToday ? "text-(--primary-600)" : "text-(--gray-400)"}`}
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
