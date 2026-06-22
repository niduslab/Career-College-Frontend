"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import CoursesStatsCards from "./stats-cards";
import CoursesTable from "./table";
import { TOP_COURSES, TIPS, COURSES } from "./data";
import { CourseStatus } from "./types";

export default function CoursesPageContent() {
  const barRef = useRef<(HTMLDivElement | null)[]>([]);
  const breakdownRef = useRef<(HTMLDivElement | null)[]>([]);

  const maxEnrolled = Math.max(...TOP_COURSES.map((c) => c.enrolled));

  useEffect(() => {
    barRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        { width: `${el.dataset.progress}%`, duration: 0.8, delay: 0.3 + i * 0.1, ease: "power3.out" },
      );
    });
    breakdownRef.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        { width: `${el.dataset.progress}%`, duration: 0.8, delay: 0.5, ease: "power3.out" },
      );
    });
  }, []);

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* Left */}
      <div className="flex-1 min-w-0 space-y-5">
        <CoursesStatsCards />
        <CoursesTable />
      </div>

      {/* Right sidebar */}
      <div className="w-full xl:w-60 2xl:w-72 shrink-0 space-y-4">

        {/* Top Courses by Enrollment */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Top by Enrollment
          </p>
          <div className="space-y-3">
            {TOP_COURSES.map((c, i) => {
              const pct = Math.round((c.enrolled / maxEnrolled) * 100);
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    <Image src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[12px] font-medium text-(--text-title) truncate leading-snug">{c.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                        <div
                          ref={(el) => { barRef.current[i] = el; }}
                          data-progress={pct}
                          className="h-full rounded-full bg-(--primary-600)"
                          style={{ width: "0%" }}
                        />
                      </div>
                      <span className="text-[12px] text-(--gray-500) shrink-0">
                        {c.enrolled.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Status Breakdown
          </p>
          <div className="space-y-2">
            {(["Published", "Draft", "Under Review", "Archived"] as CourseStatus[]).map((st, i) => {
              const count = COURSES.filter((c) => c.status === st).length;
              const pct = Math.round((count / COURSES.length) * 100);
              const bar =
                st === "Published" ? "bg-green-500"
                : st === "Draft" ? "bg-gray-400"
                : st === "Under Review" ? "bg-blue-500"
                : "bg-orange-400";
              const text =
                st === "Published" ? "text-green-600"
                : st === "Draft" ? "text-gray-500"
                : st === "Under Review" ? "text-blue-600"
                : "text-orange-500";
              return (
                <div key={st} className="flex items-center gap-3">
                  <span className="text-[11px] text-(--gray-600) w-20 shrink-0 truncate">{st}</span>
                  <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      ref={(el) => { breakdownRef.current[i] = el; }}
                      data-progress={pct}
                      className={`h-full rounded-full ${bar}`}
                      style={{ width: "0%" }}
                    />
                  </div>
                  <span className={`text-[12px] font-semibold ${text} w-8 text-right shrink-0`}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-600)" />
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Course Tips
            </p>
          </div>
          <div className="space-y-2.5">
            {TIPS.map(({ color, text }) => (
              <div key={text} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color.replace("text-", "bg-")}`} />
                <p className="text-[12px] text-(--gray-500) leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
