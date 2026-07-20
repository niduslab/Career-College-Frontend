"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sparkles, BookOpen } from "lucide-react";
import gsap from "gsap";
import CoursesStatsCards from "./stats-cards";
import CoursesTable from "./table";
import { TIPS } from "./data";
import { listCourses, getCourseCategories } from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { Course, CourseCategory, CourseStatus } from "./types";

const STATUS_BAR: Record<CourseStatus, string> = {
  draft: "bg-gray-400",
  institution_review: "bg-purple-500",
  under_review: "bg-blue-500",
  published: "bg-green-500",
  rejected: "bg-red-400",
  archived: "bg-orange-400",
};

const STATUS_TEXT: Record<CourseStatus, string> = {
  draft: "text-gray-500",
  institution_review: "text-purple-600",
  under_review: "text-blue-600",
  published: "text-green-600",
  rejected: "text-red-500",
  archived: "text-orange-500",
};

const STATUS_ROW_LABEL: Record<CourseStatus, string> = {
  draft: "Draft",
  institution_review: "Institution Review",
  under_review: "Under Review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

async function fetchCoursesAndCategories(): Promise<{
  courses: Course[];
  categories: CourseCategory[];
} | null> {
  try {
    const [coursesRes, categories] = await Promise.all([
      listCourses(1, 100),
      getCourseCategories(),
    ]);
    return { courses: coursesRes.results, categories };
  } catch (err) {
    notify.error(
      err instanceof ApiError ? err.message : "Failed to load courses.",
    );
    return null;
  }
}

export default function CoursesPageContent() {
  const router = useRouter();
  const breakdownRef = useRef<(HTMLDivElement | null)[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    let active = true;
    fetchCoursesAndCategories().then((result) => {
      if (!active || !result) return;
      setCourses(result.courses);
      setCategories(result.categories);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const topCourses = [...courses]
    .filter((c) => c.status === "published")
    .slice(0, 5);

  const statusBreakdown = (
    Object.keys(STATUS_ROW_LABEL) as CourseStatus[]
  ).map((st) => ({
    status: st,
    count: courses.filter((c) => c.status === st).length,
  }));

  useEffect(() => {
    breakdownRef.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        { width: `${el.dataset.progress}%`, duration: 0.8, delay: 0.5, ease: "power3.out" },
      );
    });
  }, [statusBreakdown]);

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* Left */}
      <div className="flex-1 min-w-0 space-y-5">
        <CoursesStatsCards courses={courses} />
        <CoursesTable
          courses={courses}
          categories={categories}
          loading={loading}
          onRefresh={refresh}
        />
      </div>

      {/* Right sidebar */}
      <div className="w-full xl:w-60 2xl:w-72 shrink-0 space-y-4">
        {/* Published courses */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Published Courses
          </p>
          {topCourses.length === 0 ? (
            <p className="text-[12px] text-(--gray-400)">No published courses yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topCourses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/partnership/courses/${c.id}`)}
                  className="w-full flex items-center gap-3 text-left cursor-pointer hover:bg-(--gray-50) rounded-lg px-1.5 py-1 -mx-1.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-(--gray-100) flex items-center justify-center">
                    {c.thumbnail ? (
                      <Image
                        src={c.thumbnail}
                        alt={c.title}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-4 h-4 text-(--gray-400)" />
                    )}
                  </div>
                  <p className="text-[12px] font-medium text-(--text-title) truncate leading-snug flex-1">
                    {c.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Status Breakdown
          </p>
          <div className="space-y-2">
            {statusBreakdown.map(({ status, count }, i) => {
              const pct = courses.length > 0 ? Math.round((count / courses.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-[11px] text-(--gray-600) w-24 shrink-0 truncate">
                    {STATUS_ROW_LABEL[status]}
                  </span>
                  <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      ref={(el) => { breakdownRef.current[i] = el; }}
                      data-progress={pct}
                      className={`h-full rounded-full ${STATUS_BAR[status]}`}
                      style={{ width: "0%" }}
                    />
                  </div>
                  <span className={`text-[12px] font-semibold ${STATUS_TEXT[status]} w-8 text-right shrink-0`}>
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
