"use client";

import {
  BookOpen,
  Code2,
  CheckCircle2,
  Circle,
  ChevronRight,
  ClipboardList,
  Lock,
  Play,
  Loader2,
} from "lucide-react";
import type { CurriculumItem, LearnerCurriculum } from "@/lib/course-api";

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ItemIcon({
  done,
  active,
  locked,
}: {
  done: boolean;
  active: boolean;
  locked: boolean;
}) {
  if (done)
    return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
  if (active)
    return (
      <div className="w-5 h-5 rounded-full bg-(--primary-600) flex items-center justify-center shrink-0">
        <Play className="w-2.5 h-2.5 text-white fill-current" />
      </div>
    );
  if (locked)
    return (
      <span className="w-5 h-5 flex items-center justify-center shrink-0">
        <Lock className="w-3.5 h-3.5 text-(--gray-300)" />
      </span>
    );
  return <Circle className="w-5 h-5 text-(--gray-300) shrink-0" />;
}

function ItemTypeIcon({ item }: { item: CurriculumItem }) {
  const cls = "w-3 h-3 shrink-0";
  switch (item.item_type) {
    case "quiz":
      return <BookOpen className={cls} />;
    case "coding":
      return <Code2 className={cls} />;
    case "assignment":
      return <ClipboardList className={cls} />;
    default:
      return <Play className={cls} />;
  }
}

function itemMeta(item: CurriculumItem): string {
  if (item.item_type === "lecture") {
    const dur = formatDuration(item.duration_seconds);
    return dur || (item.lecture_type === "article" ? "Article" : "Video");
  }
  if (item.item_type === "coding" && item.language) {
    return item.language.charAt(0).toUpperCase() + item.language.slice(1);
  }
  if (item.item_type === "quiz") return "Quiz";
  if (item.item_type === "assignment") return "Assignment";
  return "";
}

export default function CurriculumPanel({
  curriculum,
  isLoading,
  activeContentId,
  onSelectItem,
  expandedSections,
  toggleSection,
  lockedContentIds,
  completedContentIds,
}: {
  curriculum: LearnerCurriculum | undefined;
  isLoading: boolean;
  activeContentId: number | null;
  onSelectItem: (item: CurriculumItem) => void;
  expandedSections: number[];
  toggleSection: (id: number) => void;
  lockedContentIds: Set<number>;
  /**
   * Client-tracked completions (quiz/coding/assignment — the curriculum
   * endpoint only carries is_completed for lectures).
   */
  completedContentIds: Set<number>;
}) {
  const sections = curriculum?.sections ?? [];
  const allItems = sections.flatMap((s) => s.items);
  const totalItems = allItems.length;
  const doneItems = allItems.filter(
    (i) => i.is_completed || completedContentIds.has(i.content_id),
  ).length;
  const progressPct =
    totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Course header */}
      <div className="p-4 border-b border-(--gray-200)">
        <p className="text-[12px] font-semibold text-(--gray-400) uppercase tracking-widest mb-1">
          Course
        </p>
        <h2 className="text-[14px] font-semibold text-(--text-title) leading-snug">
          {curriculum?.course.title ?? "—"}
        </h2>
        {totalItems > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-(--gray-400)">
                {doneItems} of {totalItems} done
              </span>
              <span className="text-[12px] font-semibold text-(--primary-700)">
                {progressPct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-(--gray-100)">
              <div
                className="h-1.5 rounded-full bg-(--primary-700)"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-(--gray-400) text-[14px] p-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading curriculum...
        </div>
      ) : sections.length === 0 ? (
        <p className="text-[14px] text-(--gray-400) p-4">
          No content available yet.
        </p>
      ) : (
        <div className="py-2">
          {sections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-(--gray-50) transition-colors"
                >
                  <span className="flex items-center gap-1.5 text-[12px] lg:text-[14px] font-medium text-(--gray-400) tracking-wide">
                    {section.is_locked && (
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    {section.title}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-(--gray-400) transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>
                {isExpanded && (
                  <ul className="pb-2">
                    {section.items.map((item) => {
                      const active = activeContentId === item.content_id;
                      const done =
                        !!item.is_completed ||
                        completedContentIds.has(item.content_id);
                      const locked =
                        section.is_locked ||
                        lockedContentIds.has(item.content_id);
                      return (
                        <li key={item.content_id}>
                          <button
                            onClick={() => onSelectItem(item)}
                            disabled={locked}
                            title={
                              locked && !section.is_locked
                                ? "Complete the previous items to unlock"
                                : undefined
                            }
                            className={`w-full flex items-start cursor-pointer gap-3 px-4 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                              active
                                ? "bg-(--primary-50)"
                                : "hover:bg-(--gray-50)"
                            }`}
                          >
                            <ItemIcon
                              done={done}
                              active={active}
                              locked={locked}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[14px] leading-snug ${
                                  active
                                    ? "font-semibold text-(--primary-600)"
                                    : done
                                      ? "text-(--text-black)"
                                      : "text-(--gray-400)"
                                }`}
                              >
                                {item.title}
                              </p>
                              <p className="text-[12px] text-(--gray-400) mt-0.5 flex items-center gap-1">
                                <ItemTypeIcon item={item} />
                                {itemMeta(item)}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
