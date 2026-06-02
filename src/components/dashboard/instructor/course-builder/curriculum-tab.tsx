"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  TvMinimalPlay,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Sparkles,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Module, Lesson } from "./types";
import { SEED_MODULES, uid, totalLessons } from "./constants";
import ModuleModal from "./module-modal";
import LessonModal from "./lesson-modal";

function SortableLesson({
  lesson,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  lesson: Lesson;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex cursor-pointer items-center gap-2 px-3 py-3 border border-(--gray-200) rounded-lg bg-white hover:bg-(--gray-50) transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none shrink-0"
      >
        <GripVertical className="w-4 h-4 text-(--gray-500)" />
      </button>
      <div className="flex items-center justify-center shrink-0">
        <TvMinimalPlay className="w-4 h-4 text-(--gray-500)" />
      </div>
      <span className="flex-1 min-w-0 text-[14px] text-(--text-paragraph) leading-snug truncate">
        {lesson.title}
      </span>
      {lesson.isFreePreview && (
        <span className="text-[14px] font-medium text-(--primary-700) underline shrink-0 whitespace-nowrap">
          Free Preview
        </span>
      )}
      <span className="text-[14px] text-(--text-paragraph) font-normal shrink-0 whitespace-nowrap">
        {lesson.duration} min
      </span>
      <button className="p-1 shrink-0 cursor-pointer transition-colors">
        <Pencil className="w-4 h-4 text-(--gray-500)" />
      </button>
    </div>
  );
}

// Sortable Module Card

function SortableModule({
  mod,
  modIndex,
  totalModules,
  onToggle,
  onEditModule,
  onAddLesson,
  onMoveModuleUp,
  onMoveModuleDown,
  onReorderLessons,
  onMoveLessonUp,
  onMoveLessonDown,
}: {
  mod: Module;
  modIndex: number;
  totalModules: number;
  onToggle: () => void;
  onEditModule: () => void;
  onAddLesson: () => void;
  onMoveModuleUp: () => void;
  onMoveModuleDown: () => void;
  onReorderLessons: (lessons: Lesson[]) => void;
  onMoveLessonUp: (lessonId: string) => void;
  onMoveLessonDown: (lessonId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mod.id });

  const lessonSensors = useSensors(useSensor(PointerSensor));

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = mod.lessons.findIndex((l) => l.id === active.id);
    const newIdx = mod.lessons.findIndex((l) => l.id === over.id);
    onReorderLessons(arrayMove(mod.lessons, oldIdx, newIdx));
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="border border-(--gray-200) rounded-lg overflow-hidden"
    >
      {/* Module header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical className="w-4 h-4 text-(--gray-500)" />
        </button>

        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-2 text-left cursor-pointer"
        >
          {mod.expanded ? (
            <ChevronDown className="w-4 h-4 text-(--gray-500) shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-(--gray-500) shrink-0" />
          )}
          <span className="text-[14px] lg:text-[16px] font-medium text-(--text-title) leading-snug">
            {mod.title}
          </span>
        </button>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <span className="hidden sm:inline-flex items-center justify-center rounded-full bg-(--gray-100) px-2.5 py-1 text-[14px] font-normal text-(--text-paragraph)">
            {mod.lessons.length} Lesson{mod.lessons.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={onMoveModuleUp}
            disabled={modIndex === 0}
            className="p-1 rounded hover:bg-(--gray-200) disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ArrowUp className="w-5 h-5 text-(--gray-500)" />
          </button>
          <button
            onClick={onMoveModuleDown}
            disabled={modIndex === totalModules - 1}
            className="p-1 rounded hover:bg-(--gray-200) disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ArrowDown className="w-5 h-5 text-(--gray-500)" />
          </button>
          <button
            onClick={onEditModule}
            className="p-1 rounded hover:bg-(--gray-200) cursor-pointer transition-colors"
          >
            <Pencil className="w-5 h-5 text-(--gray-500)" />
          </button>
        </div>
      </div>

      {/* Lessons */}
      {mod.expanded && (
        <>
          <div className="flex flex-col gap-2 p-3 border-t border-(--gray-200)">
            <DndContext
              sensors={lessonSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleLessonDragEnd}
            >
              <SortableContext
                items={mod.lessons.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {mod.lessons.map((lesson, lIdx) => (
                  <SortableLesson
                    key={lesson.id}
                    lesson={lesson}
                    isFirst={lIdx === 0}
                    isLast={lIdx === mod.lessons.length - 1}
                    onMoveUp={() => onMoveLessonUp(lesson.id)}
                    onMoveDown={() => onMoveLessonDown(lesson.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          <div className="px-4 py-3">
            <button
              onClick={onAddLesson}
              className="w-full h-13 flex items-center justify-center gap-2 border border-(--primary-600) rounded-lg text-(--primary-600) text-[14px] font-semibold hover:bg-(--primary-50) cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lessons
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Curriculum Tab

export default function CurriculumTab() {
  const [modules, setModules] = useState<Module[]>(SEED_MODULES);

  const [moduleModal, setModuleModal] = useState<{
    mode: "add" | "edit";
    moduleId?: string;
  } | null>(null);

  const [lessonModalModuleId, setLessonModalModuleId] = useState<string | null>(
    null,
  );

  const moduleSensors = useSensors(useSensor(PointerSensor));

  const totalVideos = modules.reduce(
    (s, m) => s + m.lessons.filter((l) => l.type === "Video").length,
    0,
  );

  // Module actions

  const toggleExpand = (id: string) =>
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)),
    );

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setModules((prev) => {
      const oldIdx = prev.findIndex((m) => m.id === active.id);
      const newIdx = prev.findIndex((m) => m.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const moveModule = (id: string, dir: -1 | 1) => {
    setModules((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx + dir < 0 || idx + dir >= prev.length) return prev;
      return arrayMove(prev, idx, idx + dir);
    });
  };

  const saveModule = (title: string, summary: string) => {
    if (!moduleModal) return;
    if (moduleModal.mode === "add") {
      setModules((prev) => [
        ...prev,
        { id: uid(), title, summary, expanded: true, lessons: [] },
      ]);
    } else {
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleModal.moduleId ? { ...m, title, summary } : m,
        ),
      );
    }
    setModuleModal(null);
  };

  const deleteModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    setModuleModal(null);
  };

  // Lesson actions

  const addLesson = (moduleId: string, lesson: Omit<Lesson, "id">) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, { ...lesson, id: uid() }] }
          : m,
      ),
    );
    setLessonModalModuleId(null);
  };

  const reorderLessons = (moduleId: string, lessons: Lesson[]) =>
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, lessons } : m)),
    );

  const moveLesson = (moduleId: string, lessonId: string, dir: -1 | 1) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const idx = m.lessons.findIndex((l) => l.id === lessonId);
        if (idx + dir < 0 || idx + dir >= m.lessons.length) return m;
        return { ...m, lessons: arrayMove(m.lessons, idx, idx + dir) };
      }),
    );
  };

  const editingModule =
    moduleModal?.mode === "edit"
      ? modules.find((m) => m.id === moduleModal.moduleId)
      : null;

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left — Curriculum list */}
        <div className="flex-1 bg-white border border-(--gray-200) rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-[16px] lg:text-[20px] font-medium text-(--text-black)">
              Curriculum Architecture
            </h2>
            <p className="text-[14px] text-(--text-paragraph) mt-0.5">
              {modules.length} modules · {totalLessons(modules)} lessons ·{" "}
              {totalVideos} videos
            </p>
          </div>

          <DndContext
            sensors={moduleSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleModuleDragEnd}
          >
            <SortableContext
              items={modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {modules.map((mod, mIdx) => (
                  <SortableModule
                    key={mod.id}
                    mod={mod}
                    modIndex={mIdx}
                    totalModules={modules.length}
                    onToggle={() => toggleExpand(mod.id)}
                    onEditModule={() =>
                      setModuleModal({ mode: "edit", moduleId: mod.id })
                    }
                    onAddLesson={() => setLessonModalModuleId(mod.id)}
                    onMoveModuleUp={() => moveModule(mod.id, -1)}
                    onMoveModuleDown={() => moveModule(mod.id, 1)}
                    onReorderLessons={(lessons) =>
                      reorderLessons(mod.id, lessons)
                    }
                    onMoveLessonUp={(lessonId) =>
                      moveLesson(mod.id, lessonId, -1)
                    }
                    onMoveLessonDown={(lessonId) =>
                      moveLesson(mod.id, lessonId, 1)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={() => setModuleModal({ mode: "add" })}
            className="w-full h-13 flex items-center justify-center gap-2 border border-(--primary-600) rounded-lg text-(--primary-600) text-[14px] font-semibold hover:bg-(--primary-50) cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>

        {/* Right — AI Outline Generator + How It Works */}
        <div className="w-full lg:w-72 shrink-0 space-y-5">
          <div className="bg-(--text-title) rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <h3 className="text-[14px] font-semibold text-white">
                AI Outline Generator
              </h3>
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              Generate a starter curriculum from a topic. Editable results.
            </p>
            <input
              type="text"
              placeholder="e.g. UX Research"
              className="w-full h-10 px-3 text-[13px] rounded-lg bg-white/10 text-white placeholder:text-gray-500 border border-white/10 outline-none focus:ring-2 focus:ring-purple-400 transition-shadow"
            />
            <button className="w-full h-10 bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold rounded-lg cursor-pointer transition-colors">
              Generate Outline
            </button>
          </div>

          <div className="bg-white border border-(--gray-200) rounded-xl p-5 space-y-3">
            <h3 className="text-[14px] font-semibold text-(--text-title)">
              How It Works
            </h3>
            <ol className="space-y-2.5 list-none">
              {[
                <>
                  <strong>Add New Module</strong> to create a section.
                </>,
                <>
                  Inside each module, click <strong>Add Lesson</strong> to
                  upload a video, document, or quiz.
                </>,
                <>
                  Use the <strong>pencil</strong> icon to rename or describe a
                  module or lesson.
                </>,
                <>
                  Drag the <strong>grip handle</strong> or use arrows to
                  reorder.
                </>,
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[12px] text-(--gray-600) leading-relaxed"
                >
                  <span className="shrink-0 font-semibold text-(--gray-400)">
                    {i + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-start gap-3">
        <button className="px-5 h-12 text-[14px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors">
          Save Draft
        </button>
        <button className="px-5 h-12 text-[14px] cursor-pointer font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors flex items-center gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {moduleModal && (
        <ModuleModal
          module={
            editingModule
              ? { title: editingModule.title, summary: editingModule.summary }
              : null
          }
          lessonCount={editingModule?.lessons.length}
          onSave={saveModule}
          onDelete={
            editingModule ? () => deleteModule(editingModule.id) : undefined
          }
          onClose={() => setModuleModal(null)}
        />
      )}

      {lessonModalModuleId && (
        <LessonModal
          onSave={(lesson) => addLesson(lessonModalModuleId, lesson)}
          onClose={() => setLessonModalModuleId(null)}
        />
      )}
    </>
  );
}
