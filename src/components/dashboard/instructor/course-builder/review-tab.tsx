"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  CheckCircle2,
  Rocket,
  BookOpen,
  TvMinimalPlay,
  Loader2,
  RotateCcw,
  Archive,
  AlertCircle,
} from "lucide-react";
import {
  listSections,
  listSectionContents,
  submitCourseForReview,
  reworkCourse,
  archiveCourse,
  getCourse,
  type LectureContent,
  type CourseStatus,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface ReviewModule {
  title: string;
  lessons: number;
  videos: number;
  /** Lessons created but never given a video or article — these block submission. */
  awaitingTitles: string[];
}

const STATUS_LABEL: Record<CourseStatus, string> = {
  draft: "Draft",
  under_review: "Under Review",
  institution_review: "Institution Review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

const STATUS_STYLE: Record<CourseStatus, string> = {
  draft: "bg-(--gray-100) text-(--gray-600)",
  under_review: "bg-amber-50 text-amber-700",
  institution_review: "bg-amber-50 text-amber-700",
  published: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  archived: "bg-(--gray-100) text-(--gray-600)",
};

interface ReviewData {
  category: string;
  level: string;
  language: string;
  title: string;
  description: string;
  price: string;
}

export default function ReviewTab({
  courseId,
  data,
  onBack,
  onPublished,
}: {
  courseId: number;
  data: ReviewData;
  onBack: () => void;
  onPublished?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<ReviewModule[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<CourseStatus>("draft");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reworking, setReworking] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCourse(courseId), listSections(courseId)])
      .then(async ([course, sections]) => {
        if (!active) return;
        setStatus(course.status);
        setRejectionReason(course.rejection_reason);
        const withContents = await Promise.all(
          sections.map(async (s) => {
            const contents = await listSectionContents(s.id);
            const awaiting = contents.filter(
              (c) =>
                c.item_type === "lecture" &&
                (c.content as LectureContent).is_awaiting_content,
            );
            return {
              title: s.title,
              lessons: contents.length,
              // Only lectures that actually have a video count as videos.
              videos: contents.filter(
                (c) =>
                  c.item_type === "lecture" &&
                  (c.content as LectureContent).lecture_type === "video" &&
                  !(c.content as LectureContent).is_awaiting_content,
              ).length,
              awaitingTitles: awaiting.map(
                (c) => (c.content as LectureContent).title,
              ),
            };
          }),
        );
        if (!active) return;
        setModules(withContents);
      })
      .catch((err) => {
        if (!active) return;
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load curriculum.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  const totalLessons = modules.reduce((s, m) => s + m.lessons, 0);
  const totalVideos = modules.reduce((s, m) => s + m.videos, 0);
  const awaitingTitles = modules.flatMap((m) => m.awaitingTitles);

  const checks = [
    {
      label: "Course title & description",
      ready: !!(data.title && data.description),
    },
    { label: "At least 1 module added", ready: modules.length >= 1 },
    {
      label: "Each module has content",
      ready: modules.length >= 1 && modules.every((m) => m.lessons >= 1),
    },
    {
      // Mirrors the backend's `empty_lectures` submission check, so the
      // blocker is visible here instead of arriving as a 422.
      label:
        awaitingTitles.length > 0
          ? `Every lesson has content (missing: ${awaitingTitles.join(", ")})`
          : "Every lesson has content",
      ready: awaitingTitles.length === 0,
    },
  ];

  const allReady = checks.every((c) => c.ready);

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      const { message, data: result } = await submitCourseForReview(courseId);
      notify.success(
        message ?? `Course submitted — status: ${result.status}.`,
      );
      setStatus(result.status);
      onPublished?.();
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to submit course for review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRework = async () => {
    setReworking(true);
    try {
      const { message, data: result } = await reworkCourse(courseId);
      notify.success(message ?? `Course moved back to draft.`);
      setStatus(result.status);
      setRejectionReason("");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to rework course.",
      );
    } finally {
      setReworking(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const { message, data: result } = await archiveCourse(courseId);
      notify.success(message ?? "Course archived.");
      setStatus(result.status);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to archive course.",
      );
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ── Left — main content ── */}
      <div className="flex-1 space-y-5">
        <div className="bg-white border border-(--gray-200) rounded-xl p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] lg:text-[18px] font-semibold text-(--text-title)">
                Pre-flight review
              </h2>
              <p className="text-[14px] text-(--gray-500) mt-0.5">
                Confirm everything looks right before you submit for review.
              </p>
            </div>
            <span
              className={`shrink-0 text-[12px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>

          {status === "rejected" && rejectionReason && (
            <div className="flex items-start gap-2 px-4 py-3 border border-red-200 bg-red-50 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-red-700">
                  This course was rejected
                </p>
                <p className="text-[12px] text-red-600 mt-0.5">
                  {rejectionReason}
                </p>
              </div>
            </div>
          )}

          {(status === "under_review" || status === "institution_review") && (
            <div className="flex items-start gap-2 px-4 py-3 border border-amber-200 bg-amber-50 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-700">
                This course is awaiting admin review. It can&apos;t be edited
                until a decision is made.
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-10 text-(--gray-500)">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading curriculum…
            </div>
          ) : (
            <>
              {/* Checklist */}
              <div className="space-y-2">
                {checks.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-center justify-between px-4 py-3 border border-(--gray-200) rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 ${c.ready ? "text-green-500" : "text-(--gray-300)"}`}
                      />
                      <span
                        className={`text-[13px] ${c.ready ? "text-(--text-title)" : "text-(--gray-400)"}`}
                      >
                        {c.label}
                      </span>
                    </div>
                    {c.ready && (
                      <span className="text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                        Ready
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Course Summary */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                  Course Summary
                </p>
                <div className="border border-(--gray-200) rounded-xl p-5 space-y-3">
                  <p className="text-[12px] text-(--gray-400)">
                    {data.category} · {data.level} · {data.language}
                  </p>
                  <h3 className="text-[18px] font-bold text-(--text-title) leading-snug">
                    {data.title || "Untitled Course"}
                  </h3>
                  <p
                    className="text-[13px] text-(--gray-500) leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: data.description }}
                  />
                  <div className="grid grid-cols-4 gap-3 pt-1 border-t border-(--gray-100)">
                    {[
                      { label: "Modules", value: modules.length },
                      { label: "Lessons", value: totalLessons },
                      { label: "Videos", value: totalVideos },
                      {
                        label: "Price",
                        value: data.price ? `$${data.price}` : "Free",
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold tracking-widest text-(--gray-400) uppercase">
                          {label}
                        </p>
                        <p className="text-[18px] font-bold text-(--text-title) mt-0.5">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Curriculum Outline */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                  Curriculum Outline
                </p>
                <div className="space-y-2">
                  {modules.map((mod, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 border border-(--gray-200) rounded-xl"
                    >
                      <div className="w-7 h-7 rounded-full bg-(--primary-700) text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-(--text-title) truncate">
                          {mod.title}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-[11px] text-(--gray-400)">
                            <BookOpen className="w-3 h-3" />
                            {mod.lessons} lesson{mod.lessons !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-(--gray-400)">
                            <TvMinimalPlay className="w-3 h-3" />
                            {mod.videos} video{mod.videos !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 h-12 text-[14px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Curriculum
          </button>

          {status === "draft" && (
            <button
              onClick={handlePublish}
              disabled={!allReady || submitting}
              className="flex items-center gap-2 px-6 h-12 text-[14px] cursor-pointer font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          )}

          {status === "rejected" && (
            <button
              onClick={handleRework}
              disabled={reworking}
              className="flex items-center gap-2 px-6 h-12 text-[14px] cursor-pointer font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {reworking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              {reworking ? "Moving to draft…" : "Rework & Edit"}
            </button>
          )}

          {status === "published" && (
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="flex items-center gap-2 px-6 h-12 text-[14px] cursor-pointer font-semibold border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {archiving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
              {archiving ? "Archiving…" : "Archive Course"}
            </button>
          )}

          {status === "archived" && (
            <button
              onClick={handleRework}
              disabled={reworking}
              className="flex items-center gap-2 px-6 h-12 text-[14px] cursor-pointer font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {reworking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              {reworking ? "Moving to draft…" : "Move Back to Draft"}
            </button>
          )}
        </div>
      </div>

      {/* ── Right — sidebar ── */}
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        <div className="bg-white border border-(--gray-200) rounded-xl p-5 space-y-2">
          <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
            What happens next
          </p>
          <p className="text-[12px] text-(--gray-500) leading-relaxed">
            {status === "draft" &&
              "Submitting sends your course to an admin for review. You'll be notified once it's approved and published, or if changes are requested."}
            {status === "rejected" &&
              "Reworking moves the course back to draft so you can fix the issues above, then resubmit for review."}
            {(status === "under_review" ||
              status === "institution_review") &&
              "An admin will review your course shortly. You'll be notified of the decision."}
            {status === "published" &&
              "Your course is live and visible to learners. Archiving removes it from the catalog but keeps existing enrollments intact."}
            {status === "archived" &&
              "This course is archived and hidden from the catalog. Move it back to draft to edit and republish it."}
          </p>
        </div>
      </div>
    </div>
  );
}
