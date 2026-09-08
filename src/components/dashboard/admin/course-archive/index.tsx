"use client";

import { useState } from "react";
import { Archive, ArchiveRestore, Loader2, Search, AlertTriangle, BookOpen } from "lucide-react";
import { useArchiveCourse, useRestoreCourse } from "@/hooks/use-admin-courses";
import { getCourseReviewDetail, type AdminCourseDetail } from "@/lib/admin-courses-api";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; course: AdminCourseDetail }
  | { status: "not-found" };

const STATUS_TONE: Record<string, string> = {
  draft: "bg-(--gray-100) text-(--gray-600)",
  institution_review: "bg-blue-50 text-blue-600",
  under_review: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  archived: "bg-(--gray-100) text-(--gray-500)",
};

function ownerLabel(course: AdminCourseDetail): string {
  if (course.partner_institution) return course.partner_institution.institution_name;
  return course.created_by?.full_name ?? course.instructors[0]?.full_name ?? "—";
}

export default function AdminCourseArchiveContent() {
  const [courseId, setCourseId] = useState("");
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
  const archive = useArchiveCourse();
  const restore = useRestoreCourse();

  const busy = archive.isPending || restore.isPending;
  const parsed = Number(courseId);
  const isValidId = courseId.trim() !== "" && parsed > 0;

  const handleLookup = () => {
    if (!isValidId) {
      notify.error("Enter a valid course id.");
      return;
    }
    setLookup({ status: "loading" });
    getCourseReviewDetail(parsed)
      .then((course) => setLookup({ status: "found", course }))
      .catch(() => setLookup({ status: "not-found" }));
  };

  const handleArchive = () => {
    if (!isValidId) {
      notify.error("Enter a valid course id.");
      return;
    }
    archive.mutate(parsed, {
      onSuccess: (data) => {
        notify.success(`"${data.title}" archived.`);
        setCourseId("");
        setLookup({ status: "idle" });
      },
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to archive course."),
    });
  };

  const handleRestore = () => {
    if (!isValidId) {
      notify.error("Enter a valid course id.");
      return;
    }
    restore.mutate(parsed, {
      onSuccess: (data) => {
        notify.success(`"${data.title}" restored to draft.`);
        setCourseId("");
        setLookup({ status: "idle" });
      },
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to restore course."),
    });
  };

  const canArchive = lookup.status !== "found" || lookup.course.status === "published";
  const canRestore = lookup.status !== "found" || lookup.course.status === "archived";

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 max-w-md shadow-sm hover:shadow-lg transition-shadow duration-200">
      <p className="text-[14px] font-semibold text-(--text-title)">Archive / Restore a Course</p>
      <p className="text-[12px] text-(--gray-500) mt-0.5 mb-4">
        Don&apos;t know the course ID? Find it on the{" "}
        <span className="font-medium text-(--text-title)">Courses</span> table — it appears in
        that course&apos;s edit page URL. Look it up here first to confirm you have the right one.
      </p>

      <label className="block text-[12px] font-medium text-(--gray-600) mb-1.5">Course ID</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={courseId}
          onChange={(e) => {
            setCourseId(e.target.value);
            setLookup({ status: "idle" });
          }}
          placeholder="e.g. 42"
          className="h-9 flex-1 px-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
        />
        <button
          onClick={handleLookup}
          disabled={lookup.status === "loading" || !isValidId}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium text-(--gray-600) border border-(--gray-200) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {lookup.status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Look up
        </button>
      </div>

      {lookup.status === "found" && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-(--gray-200) bg-(--gray-50) p-3">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-(--primary-500) to-(--primary-600) text-white flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-(--text-title) truncate">
              {lookup.course.title}
            </p>
            <p className="text-[11px] text-(--gray-500) truncate">{ownerLabel(lookup.course)}</p>
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize ${
              STATUS_TONE[lookup.course.status] ?? "bg-(--gray-100) text-(--gray-600)"
            }`}
          >
            {lookup.course.status.replace(/_/g, " ")}
          </span>
        </div>
      )}

      {lookup.status === "not-found" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-[12px] text-amber-700">
            No course found with that ID — double-check the number before acting.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={handleArchive}
          disabled={busy || !isValidId || !canArchive}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium bg-linear-to-br from-(--primary-600) to-(--primary-700) hover:from-(--primary-700) hover:to-(--primary-900) text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {archive.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Archive className="w-4 h-4" />
          )}
          Archive
        </button>
        <button
          onClick={handleRestore}
          disabled={busy || !isValidId || !canRestore}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium border border-(--gray-200) text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {restore.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArchiveRestore className="w-4 h-4" />
          )}
          Restore
        </button>
      </div>
    </div>
  );
}
