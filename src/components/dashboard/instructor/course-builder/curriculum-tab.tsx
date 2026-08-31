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
import LessonModal, { type LectureSavePayload } from "./lesson-modal";
import OutlinePreviewModal, {
  type OutlineApplyMode,
} from "./outline-preview-modal";
import { readAiSectionIds, writeAiSectionIds } from "@/lib/ai-outline-store";
import {
  generateCourseOutline,
  toPlainText,
  type CourseOutlineDraft,
  type CourseOutlineGenerateInput,
  type OutlineModule,
  type PlannedItem,
  createSection,
  updateSection,
  deleteSection,
  listSections,
  listSectionContents,
  createLecture,
  updateLecture,
  uploadLectureVideo,
  deleteLecture,
  deleteQuiz,
  deleteCodingExercise,
  deleteAssignment,
  type ContentItemBase,
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

/** The Setup-step fields the AI outline generator needs. */
export type OutlineMeta = Omit<CourseOutlineGenerateInput, "extra_instructions">;

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
    awaitingContent: !!content.is_awaiting_content,
    videoStatus: isVideo ? content.active_video_asset?.status : undefined,
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
  loadingEdit,
  onEdit,
  onAddContent,
}: {
  lesson: Lesson;
  processing?: boolean;
  loadingEdit?: boolean;
  onEdit: () => void;
  onAddContent: () => void;
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
      {lesson.awaitingContent && !processing && (
        <>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-medium text-amber-700 shrink-0 whitespace-nowrap">
            No content
          </span>
          <button
            onClick={onAddContent}
            className="inline-flex items-center gap-1 rounded-md border border-(--primary-300) px-2.5 h-7 text-[12px] font-medium text-(--primary-700) hover:bg-(--primary-50) cursor-pointer transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Add content
          </button>
        </>
      )}
      {lesson.isFreePreview && (
        <span className="inline-flex items-center rounded-full bg-(--primary-50) px-2.5 py-0.5 text-[12px] font-medium text-(--primary-700) shrink-0 whitespace-nowrap">
          Free Preview
        </span>
      )}
      <button
        onClick={onEdit}
        disabled={loadingEdit}
        className="p-1 shrink-0 cursor-pointer transition-colors disabled:cursor-not-allowed"
      >
        {loadingEdit ? (
          <Loader2 className="w-4 h-4 text-(--gray-500) animate-spin" />
        ) : (
          <Pencil className="w-4 h-4 text-(--gray-500)" />
        )}
      </button>
    </div>
  );
}

function SortableModule({
  mod,
  modIndex,
  totalModules,
  processingLectureIds,
  loadingEditLessonId,
  onToggle,
  onEditModule,
  onAddLesson,
  onEditLesson,
  onAddLessonContent,
  onReorderLessons,
  onMoveModuleUp,
  onMoveModuleDown,
}: {
  mod: UiModule;
  modIndex: number;
  totalModules: number;
  processingLectureIds: Set<number>;
  loadingEditLessonId: number | null;
  onToggle: () => void;
  onEditModule: () => void;
  onAddLesson: () => void;
  onEditLesson: (content: SectionContentItem) => void;
  onAddLessonContent: (content: SectionContentItem) => void;
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
            Module - {String(modIndex + 1).padStart(2, "0")}: {mod.title}
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
                      loadingEdit={loadingEditLessonId === mod.contents[i]?.id}
                      onEdit={() => onEditLesson(mod.contents[i])}
                      onAddContent={() => onAddLessonContent(mod.contents[i])}
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
  meta,
  onContinue,
}: {
  courseId: number;
  /** Course metadata from the Setup step, used as the AI generation input.
   *  Passed down rather than re-fetched so unsaved Setup edits are honoured —
   *  same arrangement as ReviewTab's `data` prop. */
  meta?: OutlineMeta;
  onContinue?: () => void;
}) {
  const [modules, setModules] = useState<UiModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiFocus, setAiFocus] = useState("");
  const [generating, setGenerating] = useState(false);
  const [creatingSections, setCreatingSections] = useState(false);
  const [outlineDraft, setOutlineDraft] = useState<CourseOutlineDraft | null>(
    null,
  );
  const [outlineError, setOutlineError] = useState<string | null>(null);
  /** Ids of the sections the last AI apply wrote, in outline order. A second
   *  apply reuses these instead of appending a fresh batch. Seeded from
   *  localStorage so a reload keeps working; when there is no record the modal
   *  asks instead of assuming (see ai-outline-store.ts). */
  const [aiSectionIds, setAiSectionIds] = useState<number[]>(() =>
    readAiSectionIds(courseId),
  );

  /** Record the apply's result in both places at once — in-memory for this
   *  session, localStorage so a reload still knows. */
  const rememberAiSections = (ids: number[]) => {
    setAiSectionIds(ids);
    writeAiSectionIds(courseId, ids);
  };
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
  /** Step 2 target: a lecture created earlier that has no payload yet. */
  const [addingContentTo, setAddingContentTo] = useState<{
    moduleId: number;
    content: SectionContentItem;
  } | null>(null);
  const [loadingEditLessonId, setLoadingEditLessonId] = useState<number | null>(
    null,
  );
  const [processingLectureIds, setProcessingLectureIds] = useState<Set<number>>(
    new Set(),
  );

  const moduleSensors = useSensors(useSensor(PointerSensor));

  /**
   * Poll a just-created video lecture until transcoding finishes (ready/failed).
  
   */
  const pollVideoStatus = (lectureId: number, moduleId: number) => {
    setProcessingLectureIds((prev) => new Set(prev).add(lectureId));
    let delay = 2000;

    const tick = async () => {
      try {
        const lecture = await getLecture(lectureId);
        const status = lecture.active_video_asset?.status;
        if (status === "ready" || status === "failed") {
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
          return;
        }
        delay = Math.min(delay * 2, 15000);
        setTimeout(tick, delay);
      } catch {
        setProcessingLectureIds((prev) => {
          const next = new Set(prev);
          next.delete(lectureId);
          return next;
        });
      }
    };

    setTimeout(tick, delay);
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

  // ------------------------------------------------------------ AI outline

  /** Ask the backend for an outline draft. Nothing is saved by this call —
   *  the preview modal is where the instructor decides what to keep. */
  const runGenerate = async (isRegenerate: boolean) => {
    if (!meta) {
      notify.error("Complete Course Setup first so the AI has something to work from.");
      return;
    }
    // Guard before spending a paid, several-second call.
    const missing = (
      [
        ["title", meta.title],
        ["description", meta.description],
        ["audience", meta.audience],
      ] as const
    )
      .filter(([, value]) => !toPlainText(value ?? "").trim())
      .map(([field]) => field);

    if (missing.length > 0) {
      notify.error(
        `Add a ${missing.join(", ")} on the Setup step before generating an outline.`,
      );
      return;
    }

    setGenerating(true);
    setOutlineError(null);
    try {
      const draft = await generateCourseOutline({
        ...meta,
        extra_instructions: aiFocus.trim(),
      });
      if (!draft?.modules?.length) {
        notify.error("The generator returned no modules. Try again.");
        return;
      }
      setOutlineDraft(draft);
      if (isRegenerate) notify.success("New outline generated.");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.detail : "Failed to generate an outline.";
      // Keep a failed regenerate inside the modal; surface a first-run
      // failure as a toast, since there is no modal open to hold it.
      if (isRegenerate) setOutlineError(message);
      else notify.error(message);
    } finally {
      setGenerating(false);
    }
  };

  /** Create one planned item as an empty content row.
   *
   *  Every shell is deliberately incomplete: a lecture with no video, a quiz
   *  with no questions, a coding exercise with no evaluation script, an
   *  assignment with no questions. Each of those blocks course submission until
   *  the instructor fills it in, so the plan is an enforced to-do list rather
   *  than a way to publish a hollow course. */
  const createPlannedItem = async (
    sectionId: number,
    item: PlannedItem,
    position: number,
  ) => {
    const title = item.title.trim();
    switch (item.item_type) {
      case "quiz":
        await createQuiz(sectionId, {
          title,
          description: item.description,
          position,
        });
        return;
      case "coding":
        await createCodingExercise(sectionId, {
          title,
          description: item.description,
          // The service only sets a language on coding items; default to the
          // one the Django model defaults to if it somehow arrives null.
          language: item.language ?? "python",
          position,
        });
        return;
      case "assignment":
        // Scores are left at 0 for the instructor to set — the serializer only
        // requires passing_score <= total_score, which 0/0 satisfies.
        await createAssignment(sectionId, {
          title,
          description: item.description,
          total_score: 0,
          passing_score: 0,
          position,
        });
        return;
      default:
        // Lecture. `description` has nowhere to go — Lecture has no such
        // column — so it survives only in the preview and `outline_text`.
        await createLecture(sectionId, { title, position });
    }
  };

  /** Delete one content row by its type. */
  const deleteContentItem = async (item: SectionContentItem) => {
    switch (item.item_type) {
      case "quiz":
        await deleteQuiz(item.object_id);
        return;
      case "coding":
        await deleteCodingExercise(item.object_id);
        return;
      case "assignment":
        await deleteAssignment(item.object_id);
        return;
      default:
        await deleteLecture(item.object_id);
    }
  };

  /** Rows the AI apply may clear out of a reused section.
   *
   *  Only shells — a row whose `is_awaiting_content` is true holds nothing the
   *  instructor authored (no video, no questions, no code), so replacing it
   *  with the new plan's item loses no work. Anything with real content is
   *  never touched, whoever created it. */
  const replaceableShells = (contents: SectionContentItem[]) =>
    contents.filter(
      (c) => (c.content as ContentItemBase | null)?.is_awaiting_content === true,
    );

  /** Sections this tab produced from an earlier AI apply, in order, filtered to
   *  those that still exist. A second apply overwrites these rather than piling
   *  a new batch on top — see `handleCreateSectionsFromOutline`. */
  const reusableAiSectionIds = aiSectionIds.filter((id) =>
    modules.some((m) => m.id === id),
  );

  /** Apply the approved modules to real CourseSection rows, plus a content row
   *  per kept planned item.
   *
   *  Regenerating and applying again **updates the sections the last apply
   *  produced** instead of appending a second batch. Nothing is ever deleted:
   *  a reused row keeps its id, its position, and any lessons already inside
   *  it, so no authored content is lost and the operation is reversible by
   *  editing. Only modules beyond the reusable rows create new sections.
   *
   *  In a reused section, unfilled shells from the previous apply are deleted
   *  and replaced by the new plan's items, so the lessons track the regenerated
   *  outline without the curriculum doubling. A row with anything authored in
   *  it — a video, questions, code — is never touched, so nothing is lost.
   *  Item writes are best-effort: a failure is counted and reported, never
   *  fatal, because aborting halfway through a module's items would leave the
   *  section partly rebuilt with no way to resume.
   *
   *  Rows the instructor made by hand are never touched — only ids this tab
   *  recorded from its own applies, and only those still present (one deleted
   *  in the meantime is dropped from the list, not resurrected).
   *
   *  Sequential, not Promise.all: `position` is server-ordered, so a
   *  concurrent burst would race for the same slots. On a mid-run failure the
   *  rows already written stay written and the draft is narrowed to the
   *  modules that did not land, so a retry cannot duplicate them. */
  const handleCreateSectionsFromOutline = async (
    drafts: OutlineModule[],
    mode: OutlineApplyMode,
  ) => {
    setCreatingSections(true);
    setOutlineError(null);

    // Which existing rows to overwrite. The tracked list wins when present.
    // Otherwise `mode` carries the user's explicit answer: 'update' targets the
    // first N sections as currently ordered (which may include hand-made ones —
    // the modal says so before offering it), 'append' targets nothing.
    const reusable =
      reusableAiSectionIds.length > 0
        ? reusableAiSectionIds
        : mode === "update"
          ? modules.map((m) => m.id)
          : [];
    // A reused section may already contain lessons authored against its old
    // title. That is worth saying out loud rather than silently retitling.
    const reusedWithLessons = reusable
      .slice(0, drafts.length)
      .filter(
        (id) => (modules.find((m) => m.id === id)?.contents.length ?? 0) > 0,
      ).length;

    let processed = 0;
    let updated = 0;
    let created = 0;
    let itemsCreated = 0;
    let itemsFailed = 0;
    let shellsReplaced = 0;
    let sectionsWithAuthoredKept = 0;
    const usedIds: number[] = [];
    const touchedSectionIds: number[] = [];

    /** Write a module's planned items into its section.
     *
     *  Best-effort by design: a failed item is counted and reported, never
     *  fatal. The section-level resume logic below assumes a module is either
     *  written or not, and aborting halfway through a module's items would
     *  leave a section that a retry then skips (it is no longer empty),
     *  stranding the rest. Everything here is recoverable by hand. */
    const createItemsFor = async (sectionId: number, items: PlannedItem[]) => {
      for (const [itemIndex, item] of items.entries()) {
        try {
          await createPlannedItem(sectionId, item, itemIndex + 1);
          itemsCreated += 1;
        } catch {
          itemsFailed += 1;
        }
      }
      if (items.length > 0) touchedSectionIds.push(sectionId);
    };

    try {
      for (const [index, draft] of drafts.entries()) {
        const reuseId = reusable[index];
        const plan = draft.content_plan ?? [];

        if (reuseId !== undefined) {
          const { data: section } = await updateSection(reuseId, {
            title: draft.title,
            description: draft.summary,
          });
          updated += 1;
          usedIds.push(section.id);
          setModules((prev) =>
            prev.map((m) =>
              m.id === section.id
                ? { ...m, title: section.title, summary: section.description }
                : m,
            ),
          );
          // A reused section keeps everything the instructor authored. Only
          // unfilled shells from a previous apply are cleared out, so the
          // lessons track the new outline without the curriculum doubling on
          // every regenerate and without losing real work.
          if (plan.length > 0) {
            const current =
              modules.find((m) => m.id === section.id)?.contents ?? [];
            const shells = replaceableShells(current);
            const authored = current.length - shells.length;

            for (const shell of shells) {
              try {
                await deleteContentItem(shell);
                shellsReplaced += 1;
              } catch {
                // Leave it in place and carry on; the new items still land, so
                // the worst case is a duplicate the instructor can delete.
                itemsFailed += 1;
              }
            }
            if (authored > 0) sectionsWithAuthoredKept += 1;
            await createItemsFor(section.id, plan);
          }
        } else {
          const { data: section } = await createSection(courseId, {
            title: draft.title,
            description: draft.summary,
            position: modules.length + created + 1,
          });
          created += 1;
          usedIds.push(section.id);
          setModules((prev) => [
            ...prev,
            {
              id: section.id,
              title: section.title,
              summary: section.description,
              expanded: false,
              loadingLessons: false,
              contents: [],
            },
          ]);
          // A brand-new section is empty by definition, so its plan always runs.
          await createItemsFor(section.id, plan);
        }
        processed += 1;
      }

      // Pull the real rows back for every section that gained items, so the
      // freshly created shells (and their "No content" badges) render without
      // a manual refresh.
      await Promise.all(touchedSectionIds.map((id) => loadLessonsFor(id)));

      rememberAiSections(usedIds);
      setOutlineDraft(null);
      setAiFocus("");

      // Modules dropped since the last apply leave their sections behind. They
      // are NOT deleted — say so, so the leftovers are not a silent surprise.
      const leftover = reusable.length - drafts.length;
      const parts: string[] = [];
      if (updated) parts.push(`${updated} section${updated === 1 ? "" : "s"} updated`);
      if (created) parts.push(`${created} added`);
      if (itemsCreated) {
        parts.push(`${itemsCreated} empty lesson${itemsCreated === 1 ? "" : "s"} created`);
      }
      let message = `${parts.join(", ")}.`;
      if (itemsCreated > 0) {
        message += ` Add their content before submitting for review.`;
      }
      if (shellsReplaced > 0) {
        message += ` ${shellsReplaced} empty lesson${shellsReplaced === 1 ? "" : "s"} from the previous outline ${shellsReplaced === 1 ? "was" : "were"} replaced.`;
      }
      if (sectionsWithAuthoredKept > 0) {
        message += ` ${sectionsWithAuthoredKept} reused section${sectionsWithAuthoredKept === 1 ? "" : "s"} had lessons with real content — those were kept, so check for overlap with the new ones.`;
      }
      if (itemsFailed > 0) {
        message += ` ${itemsFailed} lesson${itemsFailed === 1 ? "" : "s"} could not be created — add ${itemsFailed === 1 ? "it" : "them"} by hand.`;
      }
      if (leftover > 0) {
        message += ` ${leftover} earlier section${leftover === 1 ? "" : "s"} left untouched — delete ${leftover === 1 ? "it" : "them"} yourself if no longer needed.`;
      }
      if (reusedWithLessons > 0) {
        message += ` ${reusedWithLessons} reused section${reusedWithLessons === 1 ? "" : "s"} already had lessons — check they still fit the new title.`;
      }
      notify.success(message);
    } catch (err) {
      const reason =
        err instanceof ApiError ? err.detail : "Failed to save sections.";
      if (processed > 0) {
        rememberAiSections([
          ...usedIds,
          ...aiSectionIds.filter((id) => !usedIds.includes(id)),
        ]);
        // Narrow the draft to what did NOT land, so retrying cannot duplicate a
        // row that is already saved. `outline_text` is left as-is: it is a
        // copy-paste convenience, not part of this write path.
        setOutlineDraft((prev) =>
          prev ? { ...prev, modules: drafts.slice(processed) } : prev,
        );
        setOutlineError(
          `${processed} of ${drafts.length} modules were saved, then it stopped: ${reason} The remaining modules are still listed below.`,
        );
      } else {
        setOutlineError(reason);
      }
    } finally {
      setCreatingSections(false);
    }
  };

  /**
   * Step 1 of two-step lecture authoring: create the lesson from its details.
   * It lands with no payload ("No content"); the video or article follows via
   * `handleSaveLectureContent`.
   */
  const handleAddLecture = async (
    moduleId: number,
    lesson: Omit<Lesson, "id">,
  ) => {
    setSavingLesson(true);
    try {
      const position =
        (modules.find((m) => m.id === moduleId)?.contents.length ?? 0) + 1;

      const { message } = await createLecture(moduleId, {
        title: lesson.title,
        position,
        is_preview: lesson.isFreePreview,
      });
      notify.success(message ?? "Lesson added. Add its content next.");
      setModules((prev) =>
        prev.map((m) => (m.id === moduleId ? { ...m, loadingLessons: true } : m)),
      );
      await loadLessonsFor(moduleId);
      setLessonModalModuleId(null);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to add lesson.",
      );
    } finally {
      setSavingLesson(false);
    }
  };

  /**
   * Step 2: commit the lecture to a kind and attach its payload. Video goes
   * as multipart (and starts transcoding); article goes as JSON.
   */
  const handleSaveLectureContent = async (
    moduleId: number,
    lectureId: number,
    lesson: LectureSavePayload,
  ) => {
    setSavingLesson(true);
    try {
      if (lesson.chosenLectureType === "Video") {
        if (!lesson.videoFile) return;
        await uploadLectureVideo(lectureId, lesson.videoFile, {
          title: lesson.title,
          is_preview: lesson.isFreePreview,
        });
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId ? { ...m, loadingLessons: true } : m,
          ),
        );
        await loadLessonsFor(moduleId);
        pollVideoStatus(lectureId, moduleId);
      } else {
        const { message } = await updateLecture(lectureId, {
          title: lesson.title,
          lecture_type: "article",
          article_content: lesson.articleContent ?? "",
          is_preview: lesson.isFreePreview,
        });
        notify.success(message ?? "Lesson content added.");
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId ? { ...m, loadingLessons: true } : m,
          ),
        );
        await loadLessonsFor(moduleId);
      }
      setAddingContentTo(null);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to add lesson content.",
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
        prev.map((m) =>
          m.id === moduleId ? { ...m, loadingLessons: true } : m,
        ),
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
      const { data: created, message } = await createCodingExercise(moduleId, {
        ...input,
        position,
      });
      notify.success(message ?? "Coding exercise created.");
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, loadingLessons: true } : m,
        ),
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
        prev.map((m) =>
          m.id === moduleId ? { ...m, loadingLessons: true } : m,
        ),
      );
      await loadLessonsFor(moduleId);
      return created.object_id;
    } catch (err) {
      // Field-level errors (title/total_score/passing_score) are shown inline
      // by the caller instead of a toast — only surface a toast for the rest.
      const hasFieldErrors =
        err instanceof ApiError &&
        Object.keys(err.fieldErrors).some((k) =>
          ["title", "total_score", "passing_score"].includes(k),
        );
      if (hasFieldErrors) throw err;
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

  /** The /contents/ list is lightweight and never includes article_content — fetch it before editing. */
  const openEditLesson = async (
    moduleId: number,
    content: SectionContentItem,
  ) => {
    if (content.item_type !== "lecture") {
      setEditingLesson({ moduleId, content });
      return;
    }
    const lectureContent = content.content as LectureContent;
    if (lectureContent.lecture_type !== "article") {
      setEditingLesson({ moduleId, content });
      return;
    }
    setLoadingEditLessonId(content.id);
    try {
      const fullLecture = await getLecture(content.object_id);
      setEditingLesson({
        moduleId,
        content: { ...content, content: fullLecture },
      });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to load lesson.",
      );
    } finally {
      setLoadingEditLessonId(null);
    }
  };

  const handleEditLecture = async (
    moduleId: number,
    lectureId: number,
    lesson: LectureSavePayload,
  ) => {
    // Editing a lecture that still has no content is really step 2 —
    // it may also be replacing an uploaded video with a new file.
    if (lesson.videoFile) {
      await handleSaveLectureContent(moduleId, lectureId, lesson);
      setEditingLesson(null);
      return;
    }
    setSavingLesson(true);
    try {
      const { message } = await updateLecture(lectureId, {
        title: lesson.title,
        ...(lesson.chosenLectureType === "Article"
          ? {
              lecture_type: "article" as const,
              article_content: lesson.articleContent ?? "",
            }
          : {}),
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
                    loadingEditLessonId={loadingEditLessonId}
                    onToggle={() => toggleExpand(mod.id)}
                    onEditModule={() =>
                      setModuleModal({ mode: "edit", moduleId: mod.id })
                    }
                    onAddLesson={() => setLessonModalModuleId(mod.id)}
                    onEditLesson={(content) => openEditLesson(mod.id, content)}
                    onAddLessonContent={(content) =>
                      setAddingContentTo({ moduleId: mod.id, content })
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

          {/* Gradient-framed "AI panel" — visually distinct from the plain
              white cards around it, signaling this is the AI-powered tool
              on the page rather than another settings block. */}
          <div
            className={`ai-panel-frame ${generating ? "ai-panel-frame--active" : ""}`}
          >
            <div className="bg-(--gray-950) rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="ai-panel-sparkle w-4 h-4 text-(--primary-400)" />
                <h3 className="text-[13px] font-semibold tracking-wide text-white">
                  AI Outline Generator
                </h3>
              </div>
              <p className="text-[12px] text-(--gray-400) font-normal leading-relaxed">
                Generate a starter curriculum from your course details. Review
                and edit before anything is created.
              </p>
              <input
                type="text"
                value={aiFocus}
                onChange={(e) => setAiFocus(e.target.value)}
                disabled={generating}
                placeholder="Optional focus, e.g. hands-on labs"
                className="w-full h-10 px-3 text-[12px] rounded-md bg-(--gray-900) text-white placeholder:text-(--gray-500) border border-(--gray-700) outline-none focus:ring-2 focus:ring-(--primary-500) focus:border-(--primary-500) transition-shadow disabled:opacity-60"
              />
              <button
                onClick={() => runGenerate(false)}
                disabled={generating}
                className="w-full h-10 bg-(--primary-600) hover:bg-(--primary-500) text-white text-[14px] font-semibold rounded-md cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                {generating ? "Generating…" : "Generate Outline"}
              </button>
            </div>
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

      {outlineDraft && (
        <OutlinePreviewModal
          draft={outlineDraft}
          generating={generating}
          creating={creatingSections}
          error={outlineError}
          reusableCount={reusableAiSectionIds.length}
          existingSectionCount={modules.length}
          onRegenerate={() => runGenerate(true)}
          onApply={handleCreateSectionsFromOutline}
          onClose={() => {
            if (generating || creatingSections) return;
            setOutlineDraft(null);
            setOutlineError(null);
          }}
        />
      )}

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
          onCreateQuiz={(title) => handleCreateQuiz(lessonModalModuleId, title)}
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
              (editingLesson.content.content as LectureContent).lecture_type ===
              "video"
                ? "Video"
                : "Article"
            }
            lectureAwaitingContent={
              !!(editingLesson.content.content as LectureContent)
                .is_awaiting_content
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

      {/* Step 2 — pick the lecture kind and supply its payload. */}
      {addingContentTo && (
        <LessonModal
          contentStep
          lectureAwaitingContent
          initialLesson={contentToLesson(addingContentTo.content)}
          initialLectureType="Video"
          saving={savingLesson}
          onSave={(lesson) =>
            handleSaveLectureContent(
              addingContentTo.moduleId,
              addingContentTo.content.object_id,
              lesson,
            )
          }
          onClose={() => !savingLesson && setAddingContentTo(null)}
        />
      )}
    </>
  );
}
