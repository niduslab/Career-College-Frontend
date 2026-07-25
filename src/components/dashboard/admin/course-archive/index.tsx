"use client";

import { useState } from "react";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { useArchiveCourse, useRestoreCourse } from "@/hooks/use-admin-courses";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";

export default function AdminCourseArchiveContent() {
  const [courseId, setCourseId] = useState("");
  const archive = useArchiveCourse();
  const restore = useRestoreCourse();

  const busy = archive.isPending || restore.isPending;

  const parsedId = () => {
    const id = Number(courseId);
    if (!id || id <= 0) {
      notify.error("Enter a valid course id.");
      return null;
    }
    return id;
  };

  const handleArchive = () => {
    const id = parsedId();
    if (!id) return;
    archive.mutate(id, {
      onSuccess: (data) => {
        notify.success(`"${data.title}" archived.`);
        setCourseId("");
      },
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to archive course."),
    });
  };

  const handleRestore = () => {
    const id = parsedId();
    if (!id) return;
    restore.mutate(id, {
      onSuccess: (data) => {
        notify.success(`"${data.title}" restored to draft.`);
        setCourseId("");
      },
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to restore course."),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 max-w-md">
      <p className="text-[14px] font-semibold text-(--text-title)">Archive / Restore a Course</p>
      <p className="text-[12px] text-(--gray-500) mt-0.5 mb-4">
        Enter a course ID to archive it (published → archived) or restore it (archived → draft),
        overriding owner scope.
      </p>

      <label className="block text-[12px] font-medium text-(--gray-600) mb-1.5">Course ID</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="e.g. 42"
          className="h-9 flex-1 px-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
        />
        <button
          onClick={handleArchive}
          disabled={busy}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium bg-(--primary-600) text-white hover:bg-(--primary-700) transition-colors cursor-pointer disabled:opacity-50"
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
          disabled={busy}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium border border-(--gray-200) text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-50"
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
