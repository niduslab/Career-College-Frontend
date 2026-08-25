"use client";
import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  MonitorPlay,
  FileText,
  HelpCircle,
  Code2,
  ClipboardList,
  Lock,
} from "lucide-react";
import type { CatalogCurriculumSection } from "@/lib/course-api";

interface CourseContentProps {
  sections: CatalogCurriculumSection[];
  totalContentItems: number;
}

const INITIAL_SHOW = 5;

const ITEM_ICON: Record<string, typeof MonitorPlay> = {
  lecture: MonitorPlay,
  quiz: HelpCircle,
  coding: Code2,
  assignment: ClipboardList,
};

function itemLabel(item: CatalogCurriculumSection["contents"][number]): string {
  return item.content?.title ?? "Untitled";
}

function itemDuration(
  item: CatalogCurriculumSection["contents"][number],
): string | null {
  if (item.item_type !== "lecture" || !item.content) return null;
  const seconds = (item.content as { duration_seconds: number | null })
    .duration_seconds;
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function isPreviewable(
  item: CatalogCurriculumSection["contents"][number],
): boolean {
  return (
    item.item_type === "lecture" &&
    item.content !== null &&
    (item.content as { is_preview?: boolean }).is_preview === true
  );
}

export default function CourseContent({
  sections,
  totalContentItems,
}: CourseContentProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [showAll, setShowAll] = useState(false);

  if (sections.length === 0) return null;

  const visibleSections = showAll ? sections : sections.slice(0, INITIAL_SHOW);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? -1 : i);

  return (
    <div className="mt-6 lg:mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="sg-h5 font-semibold --title-text">Course Content</h2>
        <span className="sg-p-small text-gray-500">
          {sections.length} section{sections.length === 1 ? "" : "s"} ·{" "}
          {totalContentItems} item{totalContentItems === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-4 mt-4 border rounded-2xl border-gray-200 bg-white shadow-sm p-6">
        {visibleSections.map((section, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={section.id}
              className="rounded-lg border-[0.5px] border-gray-200 bg-gray-50 overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center cursor-pointer justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium sg-p-default --text-title">
                  {section.title}
                </span>
                {isOpen ? (
                  <ChevronUp size={20} className="--text-title shrink-0" />
                ) : (
                  <ChevronDown size={20} className="--text-title shrink-0" />
                )}
              </button>

              {isOpen && section.contents.length > 0 && (
                <ul className="border-t border-gray-200">
                  {section.contents.map((item) => {
                    const Icon = ITEM_ICON[item.item_type] ?? FileText;
                    const preview = isPreviewable(item);
                    const duration = itemDuration(item);
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 px-5 py-3 sg-p-small font-normal --text-paragraph last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <Icon size={16} className="text-gray-500 shrink-0" />
                        <span className="flex-1 leading-snug">
                          {itemLabel(item)}
                        </span>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {preview ? (
                            <span className="sg-p-small font-medium text-(--primary-700)">
                              Preview
                            </span>
                          ) : (
                            <Lock size={16} className="text-gray-400" />
                          )}
                          {duration && (
                            <span className="sg-p-small --text-paragraph min-w-11.5 text-right">
                              {duration}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {sections.length > INITIAL_SHOW && (
          <div className="px-5 py-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm cursor-pointer underline font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              {showAll ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
