"use client";

import { useRef, useState } from "react";
import {
  X,
  Upload,
  Trash2,
  Video,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import RichTextEditor from "@/components/common/rich-text-editor";
import type { Lesson, LessonType, LectureType } from "./types";
import { LESSON_TYPES } from "./constants";
import QuizBuilder from "./quiz-builder";
import CodingExerciseModal from "./coding-exercise-modal";
import type { CreateCodingExercisePayload } from "./coding-exercise-modal";
import AssignmentBuilder from "./assignment-builder";
import { ApiError } from "@/lib/api";
import {
  generateArticleLecture,
  type ArticleLectureDraft,
  type ArticleLectureGenerateInput,
} from "@/lib/course-api";

export type LectureSavePayload = Omit<Lesson, "id"> & {
  articleContent?: string;
  videoFile?: File;
  /** Which kind of lecture the payload is for. Absent on step 1, where the
   *  lesson is created from its details alone and has no payload yet. */
  chosenLectureType?: LectureType;
};

/** Course-level context handed to the AI article writer. Every field is
 *  optional — the lesson title alone is enough to generate from. */
export type ArticleAiContext = Pick<
  ArticleLectureGenerateInput,
  "course_title" | "section_title" | "audience" | "level" | "language"
>;

function isRichTextEmpty(html: string): boolean {
  return !html.replace(/<[^>]*>/g, "").trim();
}

function currentVideoLabel(lesson?: Omit<Lesson, "id">): string {
  const duration = lesson?.duration ? ` (${lesson.duration} min)` : "";
  switch (lesson?.videoStatus) {
    case "ready":
      return `Current video: Ready${duration}`;
    case "processing":
    case "uploading":
      return "Current video: Processing…";
    case "failed":
      return "Current video: Processing failed — please upload a new file.";
    default:
      return "Upload mp4 Video";
  }
}

export default function LessonModal({
  initialLesson,
  initialLectureType,
  articleAiContext,
  contentStep = false,
  lectureAwaitingContent = false,
  initialQuizId,
  initialCodingExerciseId,
  initialAssignmentId,
  saving,
  deleting,
  onSave,
  onDelete,
  onClose,
  onCreateQuiz,
  onQuizDeleted,
  onCreateCodingExercise,
  onCodingExerciseDeleted,
  onCreateAssignment,
  onAssignmentDeleted,
}: {
  initialLesson?: Omit<Lesson, "id">;
  /** For an existing Lecture, whether it's a video or article — determines which fields render in edit mode. */
  initialLectureType?: LectureType;
  /** Course/module context for the AI article writer. Omitting it only makes
   *  the generated article less specific — the panel still works. */
  articleAiContext?: ArticleAiContext;
  /** Step 2 of two-step authoring: show only the lecture-type picker and its
   *  payload fields. The lesson's details were already saved in step 1. */
  contentStep?: boolean;
  /** The lecture exists but has no payload yet, so its type is still free to
   *  choose and its payload is required. */
  lectureAwaitingContent?: boolean;
  initialQuizId?: number;
  initialCodingExerciseId?: number;
  initialAssignmentId?: number;
  saving?: boolean;
  deleting?: boolean;
  onSave: (lesson: LectureSavePayload) => void;
  onDelete?: () => void;
  onClose: () => void;
  onCreateQuiz?: (title: string) => Promise<number | null>;
  onQuizDeleted?: () => void;
  onCreateCodingExercise?: (
    input: CreateCodingExercisePayload,
  ) => Promise<number | null>;
  onCodingExerciseDeleted?: () => void;
  onCreateAssignment?: (input: {
    title: string;
    description?: string;
    instructions?: string;
    total_score: number;
    passing_score: number;
  }) => Promise<number | null>;
  onAssignmentDeleted?: () => void;
}) {
  const [lessonType, setLessonType] = useState<LessonType>(
    initialLesson?.type ?? "Lecture",
  );
  const [lectureType, setLectureType] = useState<LectureType>(
    initialLectureType ?? "Video",
  );
  const [title, setTitle] = useState(initialLesson?.title ?? "");
  const [description, setDescription] = useState(
    initialLectureType ? "" : (initialLesson?.description ?? ""),
  );
  const [isFreePreview, setIsFreePreview] = useState(
    initialLesson?.isFreePreview ?? false,
  );
  const [articleContent, setArticleContent] = useState(
    initialLectureType === "Article" ? (initialLesson?.description ?? "") : "",
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    videoFile?: string;
    articleContent?: string;
  }>({});
  const isEditingLecture = !!initialLesson && !!initialLectureType;

  // AI article drafting. Nothing here is saved — a generated draft only lands
  // on the lecture if the instructor then saves the modal like any other edit.
  const [aiFocus, setAiFocus] = useState("");
  const [aiMinutes, setAiMinutes] = useState("");
  const [aiWithCode, setAiWithCode] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDraft, setAiDraft] = useState<ArticleLectureDraft | null>(null);
  /** Set on the first click when the editor already holds text: generating
   *  replaces everything, so the second click is the confirmation. */
  const [aiConfirmReplace, setAiConfirmReplace] = useState(false);
  /** Bumped to remount the editor. `RichTextEditor` reads `value` only when it
   *  mounts, so a new draft is invisible without a fresh instance — and a
   *  full replacement is exactly when losing the undo stack is acceptable. */
  const [editorVersion, setEditorVersion] = useState(0);

  const runArticleAi = async () => {
    if (!title.trim()) {
      setErrors((prev) => ({
        ...prev,
        title: "Add a lesson title first — the article is written from it.",
      }));
      return;
    }
    if (!isRichTextEmpty(articleContent) && !aiConfirmReplace) {
      setAiConfirmReplace(true);
      return;
    }

    setAiGenerating(true);
    setAiError(null);
    try {
      const draft = await generateArticleLecture({
        ...articleAiContext,
        lecture_title: title.trim(),
        target_duration_minutes: aiMinutes ? Number(aiMinutes) : null,
        include_code_examples: aiWithCode,
        extra_instructions: aiFocus.trim(),
      });
      setArticleContent(draft.article_html);
      setAiDraft(draft);
      setEditorVersion((v) => v + 1);
      setErrors((prev) => ({ ...prev, articleContent: undefined }));
    } catch (err) {
      setAiError(
        err instanceof ApiError
          ? err.message
          : "Could not generate the article. Please try again.",
      );
    } finally {
      setAiGenerating(false);
      setAiConfirmReplace(false);
    }
  };

  // Two-step authoring:
  //   step 1 (`isDetailsStep`) — creating a lesson: title + preview flag only.
  //   step 2 (`contentStep`)   — picking the kind and supplying its payload.
  // Editing a finished lecture is neither: it shows both, with the type locked.
  const isDetailsStep = !initialLesson && !contentStep;
  const showLecturePayload = !isDetailsStep;
  const lockLectureType = isEditingLecture && !lectureAwaitingContent;
  // Nothing is stored yet, so the payload can't be "left unchanged".
  const payloadRequired = !isEditingLecture || lectureAwaitingContent;

  // Quiz fields
  const [quizTitle, setQuizTitle] = useState(
    initialLesson?.type === "Quiz" ? initialLesson.title : "",
  );
  const [quizId, setQuizId] = useState<number | null>(
    initialLesson?.type === "Quiz" ? (initialQuizId ?? null) : null,
  );
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  // Coding Exercise fields
  const [codingExerciseId, setCodingExerciseId] = useState<number | null>(
    initialLesson?.type === "Coding Exercise"
      ? (initialCodingExerciseId ?? null)
      : null,
  );

  // Assignment fields
  const [instructions, setInstructions] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [totalScore, setTotalScore] = useState("");
  const [assignmentId, setAssignmentId] = useState<number | null>(
    initialLesson?.type === "Assignment" ? (initialAssignmentId ?? null) : null,
  );
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [assignmentErrors, setAssignmentErrors] = useState<{
    title?: string;
    total_score?: string;
    passing_score?: string;
  }>({});
  const passingScoreError =
    passingScore !== "" &&
    totalScore !== "" &&
    parseFloat(passingScore) > parseFloat(totalScore);

  const isEdit = !!initialLesson;

  const handleSave = async () => {
    if (lessonType === "Quiz") {
      if (!quizTitle.trim()) return;
      if (quizId !== null) return;
      if (!onCreateQuiz) return;
      setCreatingQuiz(true);
      try {
        const createdId = await onCreateQuiz(quizTitle.trim());
        if (createdId !== null) setQuizId(createdId);
      } finally {
        setCreatingQuiz(false);
      }
    } else if (lessonType === "Assignment") {
      if (!title.trim()) return;
      if (passingScoreError) return;
      if (assignmentId !== null) return;
      if (!onCreateAssignment) return;
      setCreatingAssignment(true);
      setAssignmentErrors({});
      try {
        const createdId = await onCreateAssignment({
          title: title.trim(),
          description,
          instructions,
          total_score: parseFloat(totalScore),
          passing_score: parseFloat(passingScore),
        });
        if (createdId !== null) setAssignmentId(createdId);
      } catch (err) {
        if (err instanceof ApiError) {
          setAssignmentErrors({
            title: err.fieldErrors.title,
            total_score: err.fieldErrors.total_score,
            passing_score: err.fieldErrors.passing_score,
          });
        }
      } finally {
        setCreatingAssignment(false);
      }
    } else {
      const nextErrors: typeof errors = {};
      if (!title.trim()) {
        nextErrors.title = "Lesson title is required.";
      }
      if (showLecturePayload) {
        if (lectureType === "Video" && !videoFile && payloadRequired) {
          nextErrors.videoFile = "Please upload a video file.";
        }
        if (lectureType === "Article" && isRichTextEmpty(articleContent)) {
          nextErrors.articleContent = "Article content is required.";
        }
      }
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }
      setErrors({});
      onSave({
        type: lessonType,
        title: title.trim(),
        videoType: "",
        duration: "",
        description: "",
        isFreePreview,
        chosenLectureType: showLecturePayload ? lectureType : undefined,
        articleContent:
          showLecturePayload && lectureType === "Article"
            ? articleContent
            : undefined,
        videoFile:
          showLecturePayload && lectureType === "Video"
            ? (videoFile ?? undefined)
            : undefined,
      });
    }
  };

  if (quizId !== null) {
    return (
      <QuizBuilder
        quizId={quizId}
        quizTitle={quizTitle}
        setQuizTitle={setQuizTitle}
        onDone={() =>
          onSave({
            type: "Quiz",
            title: quizTitle.trim(),
            videoType: "",
            duration: "",
            description: "",
            isFreePreview: false,
          })
        }
        onDelete={() => {
          setQuizId(null);
          onQuizDeleted?.();
          onClose();
        }}
        onClose={onClose}
      />
    );
  }

  if (lessonType === "Coding Exercise") {
    return (
      <CodingExerciseModal
        initialLesson={initialLesson}
        initialExerciseId={codingExerciseId ?? undefined}
        onCreateCodingExercise={onCreateCodingExercise}
        onCodingExerciseDeleted={() => {
          setCodingExerciseId(null);
          onCodingExerciseDeleted?.();
        }}
        onSave={onSave}
        onClose={onClose}
      />
    );
  }

  if (assignmentId !== null) {
    return (
      <AssignmentBuilder
        assignmentId={assignmentId}
        onDone={() =>
          onSave({
            type: "Assignment",
            title: title.trim(),
            videoType: "",
            duration: "",
            description,
            isFreePreview: false,
          })
        }
        onDelete={() => {
          setAssignmentId(null);
          onAssignmentDeleted?.();
          onClose();
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            {contentStep
              ? "Add Lecture Content"
              : isEdit
                ? "Edit Lesson"
                : "Add Lesson"}
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 pb-6 space-y-5 flex-1">
          {/* Lesson Type — step 2 is about the payload only, the kind of
              lesson was already settled in step 1. */}
          <div className={`space-y-2 ${contentStep ? "hidden" : ""}`}>
            <label className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
              Lesson Type
            </label>
            <div className="flex gap-2 mt-1 overflow-x-auto pb-1 scrollbar-none">
              {LESSON_TYPES.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  disabled={isEdit}
                  onClick={() => setLessonType(key)}
                  className={`flex items-center gap-2 px-4 h-10 rounded-md text-[14px] border transition-colors shrink-0 ${
                    isEdit ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  } ${
                    lessonType === key
                      ? "bg-(--primary-700) text-white border-(--primary-700) font-semibold"
                      : "border-(--gray-200) text-(--text-paragraph) hover:border-(--primary-300) hover:bg-(--primary-50) font-normal"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {key}
                </button>
              ))}
            </div>
            {isEdit && (
              <p className="text-[12px] text-(--gray-500)">
                Lesson type can&apos;t be changed after creation.
              </p>
            )}
          </div>

          {/* Quiz setup */}
          {lessonType === "Quiz" && (
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
          )}

          {/* Lecture fields */}
          {lessonType === "Lecture" && (
            <>
              {/* Lecture type toggle: Video / Article. Hidden on step 1 —
                  the kind is chosen when the content is added. */}
              {showLecturePayload && (
                <div className="space-y-2">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Lecture Type
                  </label>
                  <div className="flex gap-2 mt-1">
                    {(["Video", "Article"] as LectureType[]).map((t) => {
                      const Icon = t === "Video" ? Video : FileText;
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={lockLectureType}
                          onClick={() => setLectureType(t)}
                          className={`flex items-center gap-2 px-4 h-9 rounded-md text-[13px] border transition-colors ${
                            lockLectureType
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer"
                          } ${
                            lectureType === t
                              ? "bg-(--primary-700) text-white border-(--primary-700) font-semibold"
                              : "border-(--gray-200) text-(--text-paragraph) hover:border-(--primary-300) hover:bg-(--primary-50)"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {lockLectureType && (
                    <p className="text-[12px] text-(--gray-500)">
                      Lecture type can&apos;t be changed once content is added.
                    </p>
                  )}
                </div>
              )}

              {/* Lesson Title */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  placeholder={
                    lectureType === "Video"
                      ? "Write video title"
                      : "Write article title"
                  }
                  className={`w-full h-12 px-3 text-[14px] mt-1 border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow ${
                    errors.title
                      ? "border-red-400 focus:ring-red-400"
                      : "border-(--gray-200) focus:ring-(--primary-700)"
                  }`}
                />
                {errors.title && (
                  <p className="text-[12px] text-red-500 mt-1">
                    {errors.title}
                  </p>
                )}
                {isDetailsStep && (
                  <p className="text-[12px] text-(--gray-500) mt-1">
                    Save the lesson first, then add its video or article with
                    “Add content”. A lesson with no content can&apos;t be
                    submitted for review.
                  </p>
                )}
              </div>

              {/* Free Preview checkbox */}
              <div className="flex items-center gap-2">
                <input
                  id="freePreview"
                  type="checkbox"
                  checked={isFreePreview}
                  onChange={(e) => setIsFreePreview(e.target.checked)}
                  className="w-4 h-4 rounded border-(--gray-300) accent-(--primary-700) cursor-pointer"
                />
                <label
                  htmlFor="freePreview"
                  className="text-[14px] font-normal text-(--text-title) cursor-pointer select-none"
                >
                  Free Preview
                </label>
              </div>

              {showLecturePayload && lectureType === "Video" && (
                <>
                  {/* Upload Video */}
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-normal text-(--text-title)">
                      Upload Video{" "}
                      {payloadRequired && <span className="text-red-500">*</span>}
                    </label>
                    {!payloadRequired && (
                      <p className="text-[12px] text-(--gray-500)">
                        Leave empty to keep the current video.
                      </p>
                    )}
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className={`w-full rounded-lg border mt-1 border-dashed bg-(--gray-50) flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-(--primary-300) hover:bg-(--primary-50) transition-colors ${
                        errors.videoFile
                          ? "border-red-400"
                          : "border-(--gray-200)"
                      }`}
                    >
                      <Upload className="w-5 h-5 text-(--gray-400)" />
                      <p className="text-[12px] text-(--gray-500)">
                        {videoFile
                          ? videoFile.name
                          : currentVideoLabel(initialLesson)}
                      </p>
                    </div>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/*"
                      className="hidden"
                      onChange={(e) => {
                        setVideoFile(e.target.files?.[0] ?? null);
                        setErrors((prev) => ({
                          ...prev,
                          videoFile: undefined,
                        }));
                      }}
                    />
                    {errors.videoFile && (
                      <p className="text-[12px] text-red-500 mt-1">
                        {errors.videoFile}
                      </p>
                    )}
                    <p className="text-[12px] text-(--gray-500)">
                      Note: All files should be at least 720p and less than 4.0
                      GB. The video will be processed after saving — this can
                      take a few minutes.
                    </p>
                  </div>
                </>
              )}

              {showLecturePayload && lectureType === "Article" && (
                <div className="space-y-1.5">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Article Content <span className="text-red-500">*</span>
                  </label>

                  {/* AI drafting. A draft is loaded into the editor below and
                      is saved only when the instructor saves the lesson. */}
                  <div className="mt-1 rounded-lg border border-(--primary-200) bg-(--primary-50) px-3 py-3 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-(--primary-700) shrink-0" />
                      <p className="text-[13px] font-semibold text-(--text-title)">
                        Write with AI
                      </p>
                    </div>
                    <p className="text-[12px] text-(--gray-500)">
                      Drafts the article from the lesson title and the course
                      around it. Read it through and edit before saving —
                      nothing is stored until you save the lesson.
                    </p>

                    <input
                      type="text"
                      value={aiFocus}
                      onChange={(e) => setAiFocus(e.target.value)}
                      placeholder="Optional: what to focus on, e.g. “open with a worked example”"
                      className="w-full h-10 px-3 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-[12px] text-(--text-paragraph)">
                        Reading time
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={aiMinutes}
                          onChange={(e) => setAiMinutes(e.target.value)}
                          placeholder="auto"
                          className="w-20 h-9 px-2 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                        />
                        min
                      </label>
                      <label className="flex items-center gap-2 text-[12px] text-(--text-paragraph) cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={aiWithCode}
                          onChange={(e) => setAiWithCode(e.target.checked)}
                          className="w-4 h-4 rounded border-(--gray-300) accent-(--primary-700) cursor-pointer"
                        />
                        Include code examples
                      </label>
                      <button
                        type="button"
                        onClick={runArticleAi}
                        disabled={aiGenerating || !!saving}
                        className={`ml-auto flex items-center gap-2 px-4 h-9 text-[13px] font-semibold rounded-md transition-colors ${
                          aiGenerating || saving
                            ? "bg-(--gray-200) text-(--gray-400) cursor-not-allowed"
                            : "bg-(--primary-700) hover:bg-(--primary-900) text-white cursor-pointer"
                        }`}
                      >
                        {aiGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {aiGenerating
                          ? "Writing…"
                          : aiConfirmReplace
                            ? "Replace it"
                            : aiDraft
                              ? "Regenerate"
                              : "Generate article"}
                      </button>
                    </div>

                    {aiConfirmReplace && (
                      <p className="text-[12px] text-(--gray-600)">
                        This replaces everything currently in the editor. Click
                        again to continue.
                      </p>
                    )}
                    {aiError && (
                      <p className="text-[12px] text-red-500">{aiError}</p>
                    )}
                    {aiDraft && !aiGenerating && (
                      <p className="text-[12px] text-(--gray-500)">
                        Draft loaded — {aiDraft.word_count} words, about{" "}
                        {aiDraft.estimated_reading_minutes} min to read.
                      </p>
                    )}
                  </div>

                  <div className="mt-1">
                    <RichTextEditor
                      key={`article-editor-${editorVersion}`}
                      value={articleContent}
                      onChange={(html) => {
                        setArticleContent(html);
                        setErrors((prev) => ({
                          ...prev,
                          articleContent: undefined,
                        }));
                      }}
                      placeholder="Write your article content here..."
                      minHeight="100px"
                    />
                  </div>
                  {errors.articleContent && (
                    <p className="text-[12px] text-red-500 mt-1">
                      {errors.articleContent}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Assignment fields */}
          {lessonType === "Assignment" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Lesson Title <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setAssignmentErrors((prev) => ({
                      ...prev,
                      title: undefined,
                    }));
                  }}
                  placeholder="Write assignment title"
                  className={`w-full h-12 px-3 text-[14px] mt-1 border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow ${
                    assignmentErrors.title
                      ? "border-red-400 focus:ring-red-400"
                      : "border-(--gray-200) focus:ring-(--primary-700)"
                  }`}
                />
                {assignmentErrors.title && (
                  <p className="text-[12px] text-red-500 mt-1">
                    {assignmentErrors.title}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Write assignment description"
                  className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  placeholder="Write step-by-step instructions for the assignment"
                  className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Total Score <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={totalScore}
                    onChange={(e) => {
                      setTotalScore(e.target.value);
                      setAssignmentErrors((prev) => ({
                        ...prev,
                        total_score: undefined,
                      }));
                    }}
                    placeholder="e.g. 100"
                    className={`w-full h-12 px-3 text-[14px] mt-1 border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow ${
                      assignmentErrors.total_score
                        ? "border-red-400 focus:ring-red-400"
                        : "border-(--gray-200) focus:ring-(--primary-700)"
                    }`}
                  />
                  {assignmentErrors.total_score && (
                    <p className="text-[12px] text-red-500 mt-1">
                      {assignmentErrors.total_score}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Passing Score <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={passingScore}
                    onChange={(e) => {
                      setPassingScore(e.target.value);
                      setAssignmentErrors((prev) => ({
                        ...prev,
                        passing_score: undefined,
                      }));
                    }}
                    placeholder="e.g. 70"
                    className={`w-full h-12 px-3 text-[14px] mt-1 border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow ${
                      passingScoreError || assignmentErrors.passing_score
                        ? "border-red-400 focus:ring-red-400"
                        : "border-(--gray-200) focus:ring-(--primary-700)"
                    }`}
                  />
                  {passingScoreError && (
                    <p className="text-[12px] text-red-500 mt-1">
                      Passing score must be ≤ total score ({totalScore})
                    </p>
                  )}
                  {!passingScoreError && assignmentErrors.passing_score && (
                    <p className="text-[12px] text-red-500 mt-1">
                      {assignmentErrors.passing_score}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 px-6 py-4 border-t border-(--gray-200) bg-(--gray-100) rounded-b-2xl sm:flex-row sm:items-center sm:justify-between">
          {isEdit && onDelete && (
            <button
              onClick={onDelete}
              disabled={deleting || saving}
              className="flex items-center gap-2 text-[14px] font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {deleting ? "Deleting…" : "Delete Lesson"}
            </button>
          )}
          <div
            className={`flex items-center gap-2 ${isEdit ? "sm:ml-auto" : "ml-auto"}`}
          >
            <button
              onClick={onClose}
              className="px-4 h-9 text-[12px]  md:text-[14px] lg:text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
            >
              Cancel
            </button>
            {/* {lessonType !== "Quiz" && (
              <button
                onClick={onClose}
                className="px-4 h-9 text-[12px]  md:text-[14px] lg:text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
              >
                Save Draft
              </button>
            )} */}
            {(() => {
              const isAssignment = lessonType === "Assignment";
              const isQuiz = lessonType === "Quiz";
              const disabled =
                (isAssignment && !title.trim()) ||
                (isQuiz && !quizTitle.trim()) ||
                passingScoreError ||
                !!saving ||
                !!creatingQuiz ||
                !!creatingAssignment ||
                !!deleting;
              return (
                <button
                  onClick={handleSave}
                  disabled={disabled}
                  className={`flex items-center gap-2 px-4 h-9 text-[12px] md:text-[14px] lg:text-[14px] font-semibold rounded-md transition-colors ${
                    disabled
                      ? "bg-(--gray-200) text-(--gray-400) cursor-not-allowed"
                      : "bg-(--primary-700) hover:bg-(--primary-900) text-white cursor-pointer"
                  }`}
                >
                  {(saving || creatingQuiz || creatingAssignment) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {creatingQuiz || creatingAssignment
                    ? "Creating…"
                    : saving
                      ? "Saving…"
                      : isQuiz || isAssignment
                        ? "Next"
                        : contentStep
                          ? "Save Content"
                          : isEdit
                            ? "Update Lesson"
                            : "Create Lesson"}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
