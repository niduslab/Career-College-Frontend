"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { STAT_ICONS } from "./data";
import type { Course } from "./types";

interface StatsCardsProps {
  courses: Course[];
}

export default function CoursesStatsCards({ courses }: StatsCardsProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const total = courses.length;
  const published = courses.filter((c) => c.status === "published").length;
  const drafts = courses.filter((c) => c.status === "draft").length;
  const pendingReview = courses.filter(
    (c) => c.status === "under_review" || c.status === "institution_review",
  ).length;

  const stats = [
    {
      label: "Total Courses",
      value: String(total),
      footer: total === 0 ? "No courses yet" : `${published} published so far`,
    },
    {
      label: "Published",
      value: String(published),
      footer: total > 0 ? `${Math.round((published / total) * 100)}% of total` : "no courses yet",
    },
    {
      label: "Drafts",
      value: String(drafts),
      footer: drafts === 0 ? "nothing in progress" : "in progress",
    },
    {
      label: "Pending Review",
      value: String(pendingReview),
      footer: pendingReview === 0 ? "nothing awaiting review" : "awaiting a decision",
    },
  ];

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: i * 0.08, ease: "back.out(1.4)" },
      );
    });
  }, [total]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = STAT_ICONS[i];
        return (
          <div
            key={s.label}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="opacity-0 bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">{s.label}</p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">{s.value}</p>
              </div>
              <div className="w-10 h-10 xl:w-8 xl:h-8 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 xl:w-5 xl:h-5 text-(--primary-600)" />
              </div>
            </div>
            <div className="border border-dashed border-gray-200 mt-2 mb-2" />
            <p className="text-[12px] font-medium text-[#4a5565]">{s.footer}</p>
          </div>
        );
      })}
    </div>
  );
}
