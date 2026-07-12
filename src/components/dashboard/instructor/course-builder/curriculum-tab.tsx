"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  TvMinimalPlay,
  FileQuestion,
  FileText,
  Code2,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Sparkles,
  Loader2,
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
import type { Lesson } from "./types";
import ModuleModal from "./module-modal";
import LessonModal from "./lesson-modal";
import {
  createSection,
  updateSection,
  deleteSection,
  listSections,
  listSectionContents,
  createArticleLecture,
  createVideoLecture,
  updateLecture,
  deleteLecture,
  reorderSectionContent,
  getLecture,
  createQuiz,
  createCodingExercise,
  createAssignment,
  type SectionContentItem,
  type LectureContent,
} from "@/lib/course-api";
import type { CreateCodingExercisePayload } from "./coding-exercise-modal";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface UiModule {
  id: number;
  title: string;
  summary: string;
  expanded: boolean;
  loadingLessons: boolean;
  contents: SectionContentItem[];
}

function contentToLesson(item: SectionContentItem): Lesson {
  if (item.item_type === "quiz") {
    const content = item.content as { title: string };
    return {
      id: String(item.id),
      type: "Quiz",
      title: content.title,
      videoType: "",
      duration: "",
      description: "",
      isFreePreview: false,
    };
  }
  if (item.item_type === "coding") {
    const content = item.content as { title: string };
    return {
      id: String(item.id),
      type: "Coding Exercise",
      title: content.title,
      videoType: "",
      duration: "",
      description: "",
      isFreePreview: false,
    };
  }
  if (item.item_type === "assignment") {
    const content = item.content as { title: string };
    return {
      id: String(item.id),
      type: "Assignment",
      title: content.title,
      videoType: "",
      duration: "",
      description: "",
      isFreePreview: false,
    };
  }
  const content = item.content as LectureContent;
  const isVideo = content.lecture_type === "video";
  return {
    id: String(item.id),
    type: "Lecture",
    lectureType: isVideo ? "Video" : "Article",
    title: content.title,
    videoType:
      item.content && "is_preview" in content && content.is_preview
        ? "Free Preview"
        : "Paid",
    duration: content.active_video_asset?.duration_seconds
      ? String(Math.round(content.active_video_asset.duration_seconds / 60))
      : "",
    description: isVideo ? "" : (content.article_content ?? ""),
    isFreePreview: !!(content as LectureContent).is_preview,
  };
}

function SortableLesson({
  lesson,
  processing,
  onEdit,
}: {
  lesson: Lesson;
  processing?: boolean;
  onEdit: () => void;
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
      className="flex items-center gap-2 px-3 py-3 border border-(--gray-200) rounded-lg bg-white hover:bg-(--gray-50) transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none shrink-0"
      >
        <GripVertical className="w-4 h-4 text-(--gray-500)" />
      </button>
      <div className="flex items-center justify-center shrink-0">
        {lesson.type === "Quiz" ? (
          <FileQuestion className="w-4 h-4 text-(--gray-500)" />
        ) : lesson.type === "Coding Exercise" ? (
          <Code2 className="w-4 h-4 text-(--gray-500)" />
        ) : lesson.type === "Assignment" ? (
          <ClipboardList className="w-4 h-4 text-(--gray-500)" />
        ) : lesson.lectureType === "Article" ? (
          <FileText className="w-4 h-4 text-(--gray-500)" />
        ) : (
          <TvMinimalPlay className="w-4 h-4 text-(--gray-500)" />
        )}
      </div>
      <span className="flex-1 min-w-0 text-[14px] text-(--text-paragraph) leading-snug truncate">
        {lesson.title}
      </span>
      {processing && (
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-amber-600 shrink-0 whitespace-nowrap">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…
        </span>
      )}
      {lesson.isFreePreview && (
        <span className="inline-flex items-center rounded-full bg-(--primary-50) px-2.5 py-0.5 text-[12px] font-medium text-(--primary-700) shrink-0 whitespace-nowrap">
          Free Preview
        </span>
      )}
      <button
        onClick={onEdit}
        className="p-1 shrink-0 cursor-pointer transition-colors"
      >
        <Pencil className="w-4 h-4 text-(--gray-500)" />
      </button>
    </div>
  );
}

function SortableModule({
  mod,
  modIndex,
  totalModules,
  processingLectureIds,
  onToggle,
  onEditModule,
  onAddLesson,
  onEditLesson,
  onReorderLessons,
  onMoveModuleUp,
  onMoveModuleDown,
}: {
  mod: UiModule;
  modIndex: number;
  totalModules: number;
  processingLectureIds: Set<number>;
  onToggle: () => void;
  onEditModule: () => void;
  onAddLesson: () => void;
  onEditLesson: (content: SectionContentItem) => void;
  onReorderLessons: (
    moduleId: number,
    oldIndex: number,
    newIndex: number,
  ) => void;
  onMoveModuleUp: () => void;
  onMoveModuleDown: () => void;
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
  const lessons = mod.contents.map(contentToLesson);

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorderLessons(mod.id, oldIndex, newIndex);
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
            {mod.loadingLessons ? "…" : lessons.length} Lesson
            {lessons.length !== 1 ? "s" : ""}
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
            {mod.loadingLessons ? (
              <div className="flex items-center gap-2 text-(--gray-500) text-[13px] py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading lessons…
              </div>
            ) : (
              <DndContext
                sensors={lessonSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLessonDragEnd}
              >
                <SortableContext
                  items={lessons.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {lessons.map((lesson, i) => (
                    <SortableLesson
                      key={lesson.id}
                      lesson={lesson}
                      processing={processingLectureIds.has(
                        mod.contents[i]?.object_id,
                      )}
                      onEdit={() => onEditLesson(mod.contents[i])}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
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

export default function CurriculumTab({
  courseId,
  onContinue,
}: {
  courseId: number;
  onContinue?: () => void;
}) {
  const [modules, setModules] = useState<UiModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleModal, setModuleModal] = useState<
    { mode: "add" } | { mode: "edit"; moduleId: number } | null
  >(null);
  const [savingModule, setSavingModule] = useState(false);
  const [lessonModalModuleId, setLessonModalModuleId] = useState<number | null>(
    null,
  );
  const [savingLesson, setSavingLesson] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{
    moduleId: number;
    content: SectionContentItem;
  } | null>(null);
  const [processingLectureIds, setProcessingLectureIds] = useState<Set<number>>(
    new Set(),
  );

  const moduleSensors = useSensors(useSensor(PointerSensor));

  /** Poll a just-created video lecture until transcoding finishes (ready/failed). */
  const pollVideoStatus = (lectureId: number, moduleId: number) => {
    setProcessingLectureIds((prev) => new Set(prev).add(lectureId));
    const interval = setInterval(async () => {
      try {
        const lecture = await getLecture(lectureId);
        const status = lecture.active_video_asset?.status;
        if (status === "ready" || status === "failed") {
          clearInterval(interval);
          setProcessingLectureIds((prev) => {
            const next = new Set(prev);
            next.delete(lectureId);
            return next;
          });
          if (status === "failed") {
            notify.error(`Video processing failed for "${lecture.title}".`);
          } else {
            notify.success(`"${lecture.title}" is ready.`);
          }
          await loadLessonsFor(moduleId);
        }
      } catch {
        clearInterval(interval);
        setProcessingLectureIds((prev) => {
          const next = new Set(prev);
          next.delete(lectureId);
          return next;
        });
      }
    }, 3000);
  };

  const loadLessonsFor = async (sectionId: number) => {
    try {
      const contents = await listSectionContents(sectionId);
      setModules((prev) =>
        prev.map((m) =>
          m.id === sectionId ? { ...m, contents, loadingLessons: false } : m,
        ),
      );
    } catch {
      setModules((prev) =>
        prev.map((m) =>
          m.id === sectionId ? { ...m, loadingLessons: false } : m,
        ),
      );
    }
  };

  useEffect(() => {
    let active = true;
    listSections(courseId)
      .then((sections) => {
        if (!active) return;
        const uiModules: UiModule[] = sections.map((s) => ({
          id: s.id,
          title: s.title,
          summary: s.description,
          expanded: false,
          loadingLessons: true,
          contents: [],
        }));
        setModules(uiModules);
        sections.forEach((s) => loadLessonsFor(s.id));
      })
      .catch((err) => {
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

  const totalLessonsCount = modules.reduce((s, m) => s + m.contents.length, 0);
  const totalVideos = modules.reduce(
    (s, m) =>
      s +
      m.contents.filter(
        (c) =>
          c.item_type === "lecture" &&
          (c.content as LectureContent).lecture_type === "video",
      ).length,
    0,
  );

  const toggleExpand = (id: number) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)),
    );
  };

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setModules((prev) => {
      const oldIdx = prev.findIndex((m) => m.id === active.id);
      const newIdx = prev.findIndex((m) => m.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const moveModule = (id: number, dir: -1 | 1) => {
    setModules((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx + dir < 0 || idx + dir >= prev.length) return prev;
      return arrayMove(prev, idx, idx + dir);
    });
  };

  const handleReorderLessons = async (
    moduleId: number,
    oldIndex: number,
    newIndex: number,
  ) => {
    const targetModule = modules.find((m) => m.id === moduleId);
    if (!targetModule) return;
    const reordered = arrayMove(targetModule.contents, oldIndex, newIndex);
    const movedContent = targetModule.contents[oldIndex];

    // Optimistic local reorder so the drag feels instant.
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, contents: reordered } : m)),
    );

    try {
      await reorderSectionContent(movedContent.id, newIndex + 1);
    } catch (err) {
      // Roll back on failure.
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, contents: targetModule.contents } : m,
        ),
      );
      notify.error(
        err instanceof ApiError ? err.message : "Failed to reorder lesson.",
      );
    }
  };

  const saveModule = async (title: string, summary: string) => {
    if (!moduleModal) return;
    setSavingModule(true);
    try {
      if (moduleModal.mode === "edit") {
        const { data: section, message } = await updateSection(
          moduleModal.moduleId,
          { title, description: summary },
        );
        setModules((prev) =>
          prev.map((m) =>
            m.id === section.id
              ? { ...m, title: section.title, summary: section.description }
              : m,
          ),
        );
        notify.success(message ?? "Section updated.");
      } else {
        const { data: section, message } = await createSection(courseId, {
          title,
          description: summary,
          position: modules.length + 1,
        });
        setModules((prev) => [
          ...prev,
          {
            id: section.id,
            title: section.title,
            summary: section.description,
            expanded: true,
            loadingLessons: false,
            contents: [],
          },
        ]);
        notify.success(message ?? "Section added.");
      }
      setModuleModal(null);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save section.",
      );
    } finally {
      setSavingModule(false);
    }
  };

  const deleteModule = async (moduleId: number) => {
    setSavingModule(true);
    try {
      const message = await deleteSection(moduleId);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      notify.success(message ?? "Section deleted.");
      setModuleModal(null);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete section.",
      );
    } finally {
      setSavingModule(false);
    }
  };

  const handleAddLecture = async (
    moduleId: number,
    lesson: Omit<Lesson, "id"> & { articleContent?: string; videoFile?: File },
  ) => {
    setSavingLesson(true);
    try {
      const position =
        (modules.find((m) => m.id === moduleId)?.contents.length ?? 0) + 1;

      if (lesson.videoFile) {
        const { data: created, message } = await createVideoLecture(moduleId, {
          title: lesson.title,
          video_file: lesson.videoFile,
          position,
          is_preview: lesson.isFreePreview,
        });
        notify.success(message ?? "Video uploaded — processing started.");
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId ? { ...m, loadingLessons: true } : m,
          ),
        );
        await loadLessonsFor(moduleId);
        pollVideoStatus(created.object_id, moduleId);
      } else {
        const { message } = await createArticleLecture(moduleId, {
          title: lesson.title,
          article_content: lesson.articleContent ?? "",
          position,
          is_preview: lesson.isFreePreview,
        });
        notify.success(message ?? "Lesson added.");
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId ? { ...m, loadingLessons: true } : m,
          ),
        );
        await loadLessonsFor(moduleId);
      }
      setLessonModalModuleId(null);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to add lesson.",
      );
    } finally {
      setSavingLesson(false);
    }
  };

  const handleCreateQuiz = async (
    moduleId: number,
    title: string,
  ): Promise<number | null> => {
    try {
      const position =
        (modules.find((m) => m.id === moduleId)?.contents.length ?? 0) + 1;
      const { data: created, message } = await createQuiz(moduleId, {
        title,
        position,
      });
      notify.success(message ?? "Quiz created.");
      setModules((prev) =>
        prev.map((m) => (m.id === moduleId ? { ...m, loadingLessons: true } : m)),
      );
      await loadLessonsFor(moduleId);
      return created.object_id;
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to create quiz.",
      );
      return null;
    }
  };

  const handleCreateCodingExercise = async (
    moduleId: number,
    input: CreateCodingExercisePayload,
  ): Promise<number | null> => {
    try {
      const position =
        (modules.find((m) => m.id === moduleId)?.contents.length ?? 0) + 1;
      const { data: created, message } = await createCodingExercise(
        moduleId,
        { ...input, position },
      );
      notify.success(message ?? "Coding exercise created.");
      setModules((prev) =>
        prev.map((m) => (m.id === moduleId ? { ...m, loadingLessons: true } : m)),
      );
      await loadLessonsFor(moduleId);
      return created.object_id;
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to create coding exercise.",
      );
      return null;
    }
  };

  const handleCreateAssignment = async (
    moduleId: number,
    input: {
      title: string;
      description?: string;
      instructions?: string;
      total_score: number;
      passing_score: number;
    },
  ): Promise<number | null> => {
    try {
      const position =
        (modules.find((m) => m.id === moduleId)?.contents.length ?? 0) + 1;
      const { data: created, message } = await createAssignment(moduleId, {
        ...input,
        position,
      });
      notify.success(message ?? "Assignment created.");
      setModules((prev) =>
        prev.map((m) => (m.id === moduleId ? { ...m, loadingLessons: true } : m)),
      );
      await loadLessonsFor(moduleId);
      return created.object_id;
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to create assignment.",
      );
      return null;
    }
  };

  const refreshModuleLessons = async (moduleId: number) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, loadingLessons: true } : m)),
    );
    await loadLessonsFor(moduleId);
  };

  const handleEditLecture = async (
    moduleId: number,
    lectureId: number,
    lesson: Omit<Lesson, "id"> & { articleContent?: string },
  ) => {
    setSavingLesson(true);
    try {
      const { message } = await updateLecture(lectureId, {
        title: lesson.title,
        article_content: lesson.articleContent,
        is_preview: lesson.isFreePreview,
      });
      notify.success(message ?? "Lesson updated.");
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, loadingLessons: true } : m,
        ),
      );
      await loadLessonsFor(moduleId);
      setEditingLesson(null);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update lesson.",
      );
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLecture = async (moduleId: number, lectureId: number) => {
    setDeletingLesson(true);
    try {
      const message = await deleteLecture(lectureId);
      notify.success(message ?? "Lesson deleted.");
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, loadingLessons: true } : m,
        ),
      );
      await loadLessonsFor(moduleId);
      setEditingLesson(null);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete lesson.",
      );
    } finally {
      setDeletingLesson(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading curriculum…
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-col xl:flex-row gap-5">
        {/* Left — Curriculum list */}
        <div className="flex-1 bg-white border border-(--gray-200) rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-[16px] lg:text-[20px] font-medium text-(--text-black)">
              Curriculum Architecture
            </h2>
            <p className="text-[14px] text-(--text-paragraph) mt-0.5">
              {modules.length} modules · {totalLessonsCount} lessons ·{" "}
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
                    processingLectureIds={processingLectureIds}
                    onToggle={() => toggleExpand(mod.id)}
                    onEditModule={() =>
                      setModuleModal({ mode: "edit", moduleId: mod.id })
                    }
                    onAddLesson={() => setLessonModalModuleId(mod.id)}
                    onEditLesson={(content) =>
                      setEditingLesson({ moduleId: mod.id, content })
                    }
                    onReorderLessons={handleReorderLessons}
                    onMoveModuleUp={() => moveModule(mod.id, -1)}
                    onMoveModuleDown={() => moveModule(mod.id, 1)}
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

        {/* Right — footer (mobile/md) + AI Outline Generator + How It Works */}
        <div className="w-full xl:w-82.5 shrink-0 space-y-5">
          <div className="flex justify-start gap-3 xl:hidden">
            <button
              onClick={onContinue}
              className="px-5 h-11 text-[14px] cursor-pointer font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-(--gray-950) rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-(--primary-600)" />
              <h3 className="text-[12px] font-normal text-(--primary-100)">
                AI Outline Generator
              </h3>
            </div>
            <p className="text-[12px] text-[#f7f5f2] font-normal leading-relaxed">
              Generate a starter curriculum from a topic. Editable results.
            </p>
            <input
              type="text"
              placeholder="e.g. UX Research"
              className="w-full h-9 px-3 text-[12px] rounded-md bg-(--gray-700)   placeholder:text-gray-500 border border-(--gray-700) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
            <button className="w-full h-9 bg-(--primary-700) hover:bg-(--primary-950) text-[#f7f5f2] text-[14px] font-semibold rounded-md cursor-pointer transition-colors">
              Generate Outline
            </button>
          </div>

          <div className="bg-white border border-(--gray-200) rounded-2xl p-4 space-y-3">
            <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
              How It Works
            </h3>
            <ol className="space-y-2.5 list-none">
              {[
                <>
                  Click{" "}
                  <strong className="text-(--text-title)">Add Module</strong> to
                  create a section.
                </>,
                <>
                  Inside each module, click{" "}
                  <strong className="text-(--text-title)">Add Lesson</strong> to
                  upload a video or write an article.
                </>,
                <>Drag handles or use the up/down arrows to reorder.</>,
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[12px] text-(--gray-600) leading-relaxed"
                >
                  <span className="shrink-0 font-semibold text-(--text-title)">
                    {i + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Footer buttons — only on lg and above */}
      <div className="hidden xl:flex justify-start gap-3">
        <button
          onClick={onContinue}
          className="px-5 h-11 text-[14px] cursor-pointer font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {moduleModal &&
        (() => {
          const editingModule =
            moduleModal.mode === "edit"
              ? modules.find((m) => m.id === moduleModal.moduleId)
              : null;
          return (
            <ModuleModal
              module={
                editingModule
                  ? {
                      title: editingModule.title,
                      summary: editingModule.summary,
                    }
                  : null
              }
              lessonCount={editingModule?.contents.length}
              onSave={saveModule}
              onDelete={
                editingModule ? () => deleteModule(editingModule.id) : undefined
              }
              onClose={() => !savingModule && setModuleModal(null)}
            />
          );
        })()}

      {lessonModalModuleId !== null && (
        <LessonModal
          saving={savingLesson}
          onSave={(lesson) => {
            if (
              lesson.type === "Quiz" ||
              lesson.type === "Coding Exercise" ||
              lesson.type === "Assignment"
            ) {
              setLessonModalModuleId(null);
              refreshModuleLessons(lessonModalModuleId);
            } else {
              handleAddLecture(lessonModalModuleId, lesson);
            }
          }}
          onClose={() => !savingLesson && setLessonModalModuleId(null)}
          onCreateQuiz={(title) =>
            handleCreateQuiz(lessonModalModuleId, title)
          }
          onQuizDeleted={() => refreshModuleLessons(lessonModalModuleId)}
          onCreateCodingExercise={(input) =>
            handleCreateCodingExercise(lessonModalModuleId, input)
          }
          onCodingExerciseDeleted={() =>
            refreshModuleLessons(lessonModalModuleId)
          }
          onCreateAssignment={(input) =>
            handleCreateAssignment(lessonModalModuleId, input)
          }
          onAssignmentDeleted={() => refreshModuleLessons(lessonModalModuleId)}
        />
      )}

      {editingLesson &&
        (editingLesson.content.item_type === "quiz" ? (
          <LessonModal
            initialLesson={contentToLesson(editingLesson.content)}
            initialQuizId={editingLesson.content.object_id}
            onSave={() => {
              const moduleId = editingLesson.moduleId;
              setEditingLesson(null);
              refreshModuleLessons(moduleId);
            }}
            onClose={() => setEditingLesson(null)}
            onQuizDeleted={() => refreshModuleLessons(editingLesson.moduleId)}
          />
        ) : editingLesson.content.item_type === "coding" ? (
          <LessonModal
            initialLesson={contentToLesson(editingLesson.content)}
            initialCodingExerciseId={editingLesson.content.object_id}
            onSave={() => {
              const moduleId = editingLesson.moduleId;
              setEditingLesson(null);
              refreshModuleLessons(moduleId);
            }}
            onClose={() => setEditingLesson(null)}
            onCodingExerciseDeleted={() =>
              refreshModuleLessons(editingLesson.moduleId)
            }
          />
        ) : editingLesson.content.item_type === "assignment" ? (
          <LessonModal
            initialLesson={contentToLesson(editingLesson.content)}
            initialAssignmentId={editingLesson.content.object_id}
            onSave={() => {
              const moduleId = editingLesson.moduleId;
              setEditingLesson(null);
              refreshModuleLessons(moduleId);
            }}
            onClose={() => setEditingLesson(null)}
            onAssignmentDeleted={() =>
              refreshModuleLessons(editingLesson.moduleId)
            }
          />
        ) : (
          <LessonModal
            initialLesson={contentToLesson(editingLesson.content)}
            initialLectureType={
              (editingLesson.content.content as LectureContent)
                .lecture_type === "video"
                ? "Video"
                : "Article"
            }
            saving={savingLesson}
            deleting={deletingLesson}
            onSave={(lesson) =>
              handleEditLecture(
                editingLesson.moduleId,
                editingLesson.content.object_id,
                lesson,
              )
            }
            onDelete={() =>
              handleDeleteLecture(
                editingLesson.moduleId,
                editingLesson.content.object_id,
              )
            }
            onClose={() =>
              !savingLesson && !deletingLesson && setEditingLesson(null)
            }
          />
        ))}
    </>
  );
}
