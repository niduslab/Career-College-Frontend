"use client";

import { useState } from "react";
import { Loader2, Send, Undo2, Archive, RotateCcw } from "lucide-react";
import type { Course } from "@/lib/course-api";
import {
  institutionReviewCourse,
  archiveCourse,
  reworkCourse,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface StatusActionsProps {
  course: Course;
  onChanged: () => void;
}

export default function StatusActions({ course, onChanged }: StatusActionsProps) {
  const [busy, setBusy] = useState(false);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [reason, setReason] = useState("");

  const run = async (fn: () => Promise<{ message?: string }>, successMsg: string) => {
    setBusy(true);
    try {
      const { message } = await fn();
      notify.success(message ?? successMsg);
      onChanged();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitToAdmin = () =>
    run(
      () => institutionReviewCourse(course.id, "submit"),
      "Course forwarded to the platform admin.",
    );

  const handleSendBack = async () => {
    if (!reason.trim()) {
      notify.error("Please provide a reason before sending back.");
      return;
    }
    await run(
      () => institutionReviewCourse(course.id, "send_back", reason.trim()),
      "Course sent back to the expert.",
    );
    setSendBackOpen(false);
    setReason("");
  };

  const handleArchive = () =>
    run(() => archiveCourse(course.id), "Course archived.");

  const handleRework = () =>
    run(() => reworkCourse(course.id), "Course moved back to draft.");

  const nothingToDo =
    course.status !== "institution_review" &&
    course.status !== "published" &&
    course.status !== "archived";

  if (nothingToDo) {
    return (
      <div className="bg-white border border-(--gray-200) rounded-2xl p-5 space-y-1">
        <p className="text-[14px] font-semibold text-(--text-title)">Status</p>
        <p className="text-[13px] text-(--gray-500)">
          {course.status === "draft" &&
            "This course is a draft. An assigned expert must finish it before it can move to institution review."}
          {course.status === "under_review" &&
            "Waiting on the platform admin's decision."}
          {course.status === "rejected" &&
            "This course was rejected. Send it back to draft to rework it, or edit content directly."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl p-5 space-y-3">
      <p className="text-[14px] font-semibold text-(--text-title)">Status Actions</p>

      {course.status === "institution_review" && !sendBackOpen && (
        <div className="space-y-2">
          <p className="text-[13px] text-(--gray-500)">
            The assigned expert has finished this course. Forward it to the
            platform admin, or send it back for changes.
          </p>
          <button
            type="button"
            onClick={handleSubmitToAdmin}
            disabled={busy}
            className="w-full flex items-center justify-center gap-1.5 h-10 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Forward to Admin
          </button>
          <button
            type="button"
            onClick={() => setSendBackOpen(true)}
            disabled={busy}
            className="w-full flex items-center justify-center gap-1.5 h-10 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-60"
          >
            <Undo2 className="w-4 h-4" />
            Send Back to Expert
          </button>
        </div>
      )}

      {course.status === "institution_review" && sendBackOpen && (
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-(--text-title)">
            Reason for sending back
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Missing quiz answers in section 2."
            className="w-full px-3 py-2 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setSendBackOpen(false); setReason(""); }}
              disabled={busy}
              className="flex-1 h-9 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendBack}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Back
            </button>
          </div>
        </div>
      )}

      {course.status === "published" && (
        <button
          type="button"
          onClick={handleArchive}
          disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 h-10 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
          Archive Course
        </button>
      )}

      {course.status === "archived" && (
        <button
          type="button"
          onClick={handleRework}
          disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 h-10 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          Move Back to Draft
        </button>
      )}
    </div>
  );
}
