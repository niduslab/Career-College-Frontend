"use client";

import {
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronRight,
  Play,
} from "lucide-react";
import { modules } from "./data";
import type { Lesson } from "./types";

function LessonIcon({ lesson }: { lesson: Lesson }) {
  if (lesson.status === "completed")
    return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
  if (lesson.status === "active")
    return (
      <div className="w-5 h-5 rounded-full bg-(--primary-600) flex items-center justify-center shrink-0">
        <Play className="w-2.5 h-2.5 text-white fill-current" />
      </div>
    );
  return <Circle className="w-5 h-5 text-(--gray-300) shrink-0" />;
}

export default function CurriculumPanel({
  doneLessons,
  totalLessons,
  expandedModules,
  toggleModule,
}: {
  doneLessons: number;
  totalLessons: number;
  expandedModules: number[];
  toggleModule: (id: number) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Course header */}
      <div className="p-4 border-b border-(--gray-200)">
        <p className="text-[12px] font-semibold text-(--gray-400) uppercase tracking-widest mb-1">
          Course
        </p>
        <h2 className="text-[14px]  font-semibold text-(--text-title) leading-snug">
          Applied Machine Learning with Python
        </h2>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-(--gray-400)">
              {doneLessons} of {totalLessons} done
            </span>
            <span className="text-[12px] font-semibold text-(--primary-700)">
              68%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-(--gray-100)">
            <div className="h-1.5 rounded-full bg-(--primary-700) w-[68%]" />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="py-2">
        {modules.map((mod) => {
          const isExpanded = expandedModules.includes(mod.id);
          return (
            <div key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-(--gray-50) transition-colors"
              >
                <span className="text-[12px] lg:text-[14px] font-medium text-(--gray-400)  tracking-wide">
                  {mod.title}
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-(--gray-400) transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                />
              </button>
              {isExpanded && (
                <ul className="pb-2">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <button
                        className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                          lesson.status === "active"
                            ? "bg-(--primary-50)"
                            : "hover:bg-(--gray-50)"
                        }`}
                      >
                        <LessonIcon lesson={lesson} />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[14px]   leading-snug ${
                              lesson.status === "active"
                                ? "font-semibold text-(--primary-600)"
                                : lesson.status === "completed"
                                  ? "text-(--text-black)"
                                  : "text-(--gray-400)"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-[12px] text-(--gray-400) mt-0.5 flex items-center gap-1">
                            {lesson.type === "quiz" ? (
                              <BookOpen className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            {lesson.duration}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
