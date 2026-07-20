"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { getCourse } from "@/lib/course-api";
import type { Course } from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import CourseStatusBadge from "../status-badge";
import { LEVEL_LABEL } from "../data";
import AssignExpertPanel from "@/components/dashboard/common/assign-expert-panel";
import StatusActions from "./status-actions";

export default function CourseDetailPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    if (!Number.isFinite(courseId)) return;
    let active = true;
    getCourse(courseId)
      .then((c) => {
        if (!active) return;
        setCourse(c);
      })
      .catch((err) => {
        if (!active) return;
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load course.",
        );
        setCourse(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId, refreshKey]);

  if (!Number.isFinite(courseId)) {
    return (
      <p className="text-[14px] text-(--gray-500)">Invalid course id.</p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading course…
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard/partnership/courses")}
          className="flex items-center gap-1.5 text-[13px] font-medium text-(--gray-600) hover:text-(--text-title) cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>
        <div className="bg-white border border-(--gray-200) rounded-2xl p-12 text-center">
          <BookOpen className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
          <p className="text-[14px] text-(--gray-500)">Course not found.</p>
        </div>
      </div>
    );
  }

  const editable = course.status === "draft" || course.status === "rejected";

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => router.push("/dashboard/partnership/courses")}
        className="flex items-center gap-1.5 text-[13px] font-medium text-(--gray-600) hover:text-(--text-title) cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      {/* Header */}
      <div className="bg-white border border-(--gray-200) rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-(--gray-100) flex items-center justify-center">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                width={64}
                height={64}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-6 h-6 text-(--gray-400)" />
            )}
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] lg:text-[20px] font-semibold text-(--text-title) truncate">
                {course.title}
              </h1>
              <CourseStatusBadge status={course.status} />
            </div>
            <p className="text-[13px] text-(--gray-500)">
              {course.category?.name ?? "Uncategorized"} ·{" "}
              {LEVEL_LABEL[course.level]} ·{" "}
              {Number(course.price) > 0 ? `$${course.price}` : "Free"}
            </p>
            {course.status === "rejected" && course.rejection_reason && (
              <p className="text-[13px] text-red-600">
                Rejected: {course.rejection_reason}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {course.slug && course.status === "published" && (
            <a
              href={`/course-player/${course.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          )}
          {editable && (
            <Link
              href={`/dashboard/instructor/course-builder?courseId=${course.id}`}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit Content
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white border border-(--gray-200) rounded-2xl p-5 space-y-2">
            <p className="text-[14px] font-semibold text-(--text-title)">Description</p>
            <p className="text-[13px] text-(--gray-600) leading-relaxed whitespace-pre-line">
              {course.description || "No description yet."}
            </p>
          </div>

          <AssignExpertPanel course={course} onChanged={refresh} />
        </div>

        <div className="space-y-5">
          <StatusActions course={course} onChanged={refresh} />
        </div>
      </div>
    </div>
  );
}
