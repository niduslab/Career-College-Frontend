"use client";

import { useEffect, useState } from "react";
import {
  X,
  BookOpen,
  TvMinimalPlay,
  Star,
  DollarSign,
  Globe,
  BarChart2,
  Clock,
  Loader2,
} from "lucide-react";
import {
  listSections,
  listSectionContents,
  type LectureContent,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface PreviewModule {
  id: number;
  title: string;
  lessons: number;
  videos: number;
  durationMinutes: number;
}

interface PreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  courseId: number | null;
  form: {
    title: string;
    category: string;
    level: string;
    language: string;
    description: string;
    price: string;
  };
}

export default function PreviewDrawer({
  open,
  onClose,
  courseId,
  form,
}: PreviewDrawerProps) {
  const [modules, setModules] = useState<PreviewModule[]>([]);
  const [loadedForCourseId, setLoadedForCourseId] = useState<number | null>(
    null,
  );
  const loading =
    open && courseId !== null && loadedForCourseId !== courseId;

  useEffect(() => {
    if (!open || courseId === null || loadedForCourseId === courseId) return;
    let active = true;
    listSections(courseId)
      .then(async (sections) => {
        const withContents = await Promise.all(
          sections.map(async (s) => {
            const contents = await listSectionContents(s.id);
            // This drawer previews what a learner would see, and lessons
            // still awaiting their content are hidden from learners.
            const visible = contents.filter(
              (c) =>
                c.item_type !== "lecture" ||
                !(c.content as LectureContent).is_awaiting_content,
            );
            return {
              id: s.id,
              title: s.title,
              lessons: visible.length,
              videos: visible.filter(
                (c) =>
                  c.item_type === "lecture" &&
                  (c.content as LectureContent).lecture_type === "video",
              ).length,
              durationMinutes: visible.reduce((sum, c) => {
                if (c.item_type !== "lecture") return sum;
                const seconds = (c.content as LectureContent)
                  .active_video_asset?.duration_seconds;
                return sum + (seconds ? seconds / 60 : 0);
              }, 0),
            };
          }),
        );
        if (!active) return;
        setModules(withContents);
        setLoadedForCourseId(courseId);
      })
      .catch((err) => {
        if (!active) return;
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load curriculum.",
        );
        setLoadedForCourseId(courseId);
      });
    return () => {
      active = false;
    };
  }, [open, courseId, loadedForCourseId]);

  const totalLessons = modules.reduce((s, m) => s + m.lessons, 0);
  const totalVideos = modules.reduce((s, m) => s + m.videos, 0);
  const totalDuration = modules.reduce((s, m) => s + m.durationMinutes, 0);

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--gray-200) shrink-0">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
              Student Preview
            </p>
            <h2 className="text-[16px] font-semibold text-(--text-title) mt-0.5">
              {form.title || "Untitled Course"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-(--gray-100) text-(--gray-500) hover:text-(--gray-700) cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Globe,    label: form.category },
              { icon: BarChart2, label: form.level },
              { icon: Globe,    label: form.language },
            ].map(({ icon: Icon, label }) =>
              label ? (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-[12px] text-(--gray-600) bg-(--gray-100) px-3 py-1 rounded-full"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ) : null,
            )}
          </div>

          {/* Description */}
          {form.description ? (
            <p
              className="text-[13px] text-(--gray-500) leading-relaxed"
              dangerouslySetInnerHTML={{ __html: form.description }}
            />
          ) : (
            <p className="text-[13px] text-(--gray-400) italic">
              No description added yet.
            </p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen,      label: "Lessons",  value: totalLessons },
              { icon: TvMinimalPlay, label: "Videos",   value: totalVideos },
              { icon: Clock,         label: "Duration", value: `${totalDuration.toFixed(0)} min` },
              { icon: Star,          label: "Modules",  value: modules.length },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-(--gray-50) border border-(--gray-200) rounded-xl px-4 py-3"
              >
                <Icon className="w-4 h-4 text-(--primary-600) shrink-0" />
                <div>
                  <p className="text-[11px] text-(--gray-400)">{label}</p>
                  <p className="text-[15px] font-bold text-(--text-title)">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-3 bg-(--primary-50) border border-(--primary-200) rounded-xl px-4 py-3">
            <DollarSign className="w-5 h-5 text-(--primary-600) shrink-0" />
            <div>
              <p className="text-[11px] text-(--gray-500)">Course Price</p>
              <p className="text-[18px] font-bold text-(--primary-600)">
                {form.price ? `$${form.price}` : "Free"}
              </p>
            </div>
          </div>

          {/* Curriculum outline */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
              Curriculum
            </p>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-(--gray-500)">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading curriculum…
              </div>
            ) : modules.length === 0 ? (
              <p className="text-[13px] text-(--gray-400) italic">
                No modules added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {modules.map((mod, i) => (
                  <div
                    key={mod.id}
                    className="flex items-start gap-3 px-4 py-3 border border-(--gray-200) rounded-xl"
                  >
                    <div className="w-7 h-7 rounded-full bg-(--primary-700) text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-(--gray-200)">
          <p className="text-[11px] text-(--gray-400) text-center">
            This is a preview of how students will see your course.
          </p>
        </div>
      </div>
    </>
  );
}
