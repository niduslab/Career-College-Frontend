"use client";

import { useRef, useState } from "react";
import { X, Upload, Trash2, Video, FileText, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/common/rich-text-editor";
import type { Lesson, LessonType, LectureType } from "./types";
import { LESSON_TYPES } from "./constants";
import QuizBuilder from "./quiz-builder";
import CodingExerciseModal from "./coding-exercise-modal";
import type { CreateCodingExercisePayload } from "./coding-exercise-modal";
import AssignmentBuilder from "./assignment-builder";

export type LectureSavePayload = Omit<Lesson, "id"> & {
  articleContent?: string;
  videoFile?: File;
};

function isRichTextEmpty(html: string): boolean {
  return !html.replace(/<[^>]*>/g, "").trim();
}

export default function LessonModal({
  initialLesson,
  initialLectureType,
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
      try {
        const createdId = await onCreateAssignment({
          title: title.trim(),
          description,
          instructions,
          total_score: parseFloat(totalScore),
          passing_score: parseFloat(passingScore),
        });
        if (createdId !== null) setAssignmentId(createdId);
      } finally {
        setCreatingAssignment(false);
      }
    } else {
      const nextErrors: typeof errors = {};
      if (!title.trim()) {
        nextErrors.title = "Lesson title is required.";
      }
      if (lectureType === "Video" && !videoFile && !isEditingLecture) {
        nextErrors.videoFile = "Please upload a video file.";
      }
      if (lectureType === "Article" && isRichTextEmpty(articleContent)) {
        nextErrors.articleContent = "Article content is required.";
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
        articleContent: lectureType === "Article" ? articleContent : undefined,
        videoFile:
          lectureType === "Video" ? (videoFile ?? undefined) : undefined,
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
            {isEdit ? "Edit Lesson" : "Add Lesson"}
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
          {/* Lesson Type */}
          <div className="space-y-2">
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
              {/* Lecture type toggle: Video / Article */}
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
                        disabled={isEditingLecture}
                        onClick={() => setLectureType(t)}
                        className={`flex items-center gap-2 px-4 h-9 rounded-md text-[13px] border transition-colors ${
                          isEditingLecture
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
                {isEditingLecture && (
                  <p className="text-[12px] text-(--gray-500)">
                    Lecture type can&apos;t be changed after creation.
                  </p>
                )}
              </div>

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

              {lectureType === "Video" && (
                <>
                  {/* Upload Video */}
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-normal text-(--text-title)">
                      Upload Video{" "}
                      {!isEditingLecture && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {isEditingLecture && (
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
                        {videoFile ? videoFile.name : "Upload mp4 Video"}
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

              {lectureType === "Article" && (
                <div className="space-y-1.5">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Article Content <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <RichTextEditor
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
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Write assignment title"
                  className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
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
                    Total Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={totalScore}
                    onChange={(e) => setTotalScore(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Passing Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    placeholder="e.g. 70"
                    className={`w-full h-12 px-3 text-[14px] mt-1 border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow ${
                      passingScoreError
                        ? "border-red-400 focus:ring-red-400"
                        : "border-(--gray-200) focus:ring-(--primary-700)"
                    }`}
                  />
                  {passingScoreError && (
                    <p className="text-[12px] text-red-500 mt-1">
                      Passing score must be ≤ total score ({totalScore})
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
                        : isEdit
                          ? "Update Lesson"
                          : "Save Lesson"}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
