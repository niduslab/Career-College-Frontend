"use client";

import { useState } from "react";
import { X, Upload, ChevronDown, Trash2, Video, FileText } from "lucide-react";
import RichTextEditor from "@/components/common/rich-text-editor";
import type { Lesson, LessonType, LectureType } from "./types";
import { LESSON_TYPES } from "./constants";
import QuizBuilder from "./quiz-builder";
import CodingExerciseModal from "./coding-exercise-modal";
import AssignmentQuestionModal from "./assignment-question-modal";
import type { AssignmentQuestion } from "./assignment-question-modal";

export default function LessonModal({
  initialLesson,
  onSave,
  onClose,
}: {
  initialLesson?: Omit<Lesson, "id">;
  onSave: (lesson: Omit<Lesson, "id">) => void;
  onClose: () => void;
}) {
  const [lessonType, setLessonType] = useState<LessonType>(
    initialLesson?.type ?? "Lecture",
  );
  const [lectureType, setLectureType] = useState<LectureType>("Video");
  const [title, setTitle] = useState(initialLesson?.title ?? "");
  const [duration, setDuration] = useState(initialLesson?.duration ?? "");
  const [description, setDescription] = useState(
    initialLesson?.description ?? "Follow my instruction",
  );
  const [isFreePreview, setIsFreePreview] = useState(
    initialLesson?.isFreePreview ?? false,
  );
  const [articleContent, setArticleContent] = useState("");

  // Quiz fields
  const [quizTitle, setQuizTitle] = useState(
    initialLesson?.type === "Quiz" ? initialLesson.title : "",
  );
  const [questionType, setQuestionType] = useState("Multiple Choice");
  const [questionTypeDropOpen, setQuestionTypeDropOpen] = useState(false);
  const [passMark, setPassMark] = useState(70);
  const [quizBuilderOpen, setQuizBuilderOpen] = useState(
    initialLesson?.type === "Quiz",
  );
  const [codingExerciseOpen, setCodingExerciseOpen] = useState(
    initialLesson?.type === "Coding Exercise",
  );

  // Assignment fields
  const [instructions, setInstructions] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [totalScore, setTotalScore] = useState("");
  const [assignmentQuestions, setAssignmentQuestions] = useState<
    AssignmentQuestion[]
  >([]);
  const [assignmentQuestionsOpen, setAssignmentQuestionsOpen] = useState(false);
  const passingScoreError =
    passingScore !== "" &&
    totalScore !== "" &&
    parseFloat(passingScore) > parseFloat(totalScore);

  const QUESTION_TYPES = [
    "Multiple Choice",
    "True / False",
    "Short Answer",
    "Essay",
  ];
  const isEdit = !!initialLesson;

  const handleSave = () => {
    if (lessonType === "Quiz") {
      if (!quizTitle.trim()) return;
      setQuizBuilderOpen(true);
    } else if (lessonType === "Coding Exercise") {
      setCodingExerciseOpen(true);
    } else if (lessonType === "Assignment") {
      if (!title.trim()) return;
      if (passingScoreError) return;
      setAssignmentQuestionsOpen(true);
    } else {
      if (!title.trim()) return;
      onSave({
        type: lessonType,
        title: title.trim(),
        videoType: lectureType,
        duration,
        description,
        isFreePreview,
      });
    }
  };

  if (quizBuilderOpen) {
    return (
      <QuizBuilder
        quizTitle={quizTitle}
        setQuizTitle={setQuizTitle}
        questionType={questionType}
        setQuestionType={setQuestionType}
        passMark={passMark}
        setPassMark={setPassMark}
        onBack={() => setQuizBuilderOpen(false)}
        onDone={() =>
          onSave({
            type: "Quiz",
            title: quizTitle.trim(),
            videoType: questionType,
            duration: "",
            description: "",
            isFreePreview: false,
          })
        }
        onClose={onClose}
      />
    );
  }

  if (codingExerciseOpen) {
    return (
      <CodingExerciseModal
        initialLesson={initialLesson}
        onSave={onSave}
        onClose={onClose}
      />
    );
  }

  if (assignmentQuestionsOpen) {
    return (
      <AssignmentQuestionModal
        questions={assignmentQuestions}
        assignmentTitle={title}
        onBack={() => setAssignmentQuestionsOpen(false)}
        onDone={(questions) => {
          setAssignmentQuestions(questions);
          onSave({
            type: "Assignment",
            title: title.trim(),
            videoType: "",
            duration: "",
            description,
            isFreePreview: false,
          });
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
                  onClick={() => setLessonType(key)}
                  className={`flex items-center gap-2 px-4 h-10 rounded-md text-[14px] cursor-pointer border transition-colors shrink-0 ${
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
          </div>

          {/* Quiz setup */}
          {lessonType === "Quiz" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Question Type
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setQuestionTypeDropOpen((v) => !v)}
                    className="flex items-center w-full h-12 mt-1 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors"
                  >
                    <span
                      className={`flex-1 text-left ${questionType ? "text-(--text-title)" : "text-(--gray-400)"}`}
                    >
                      {questionType || "Select question type"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-(--gray-500) transition-transform duration-200 ${questionTypeDropOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {questionTypeDropOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-50 py-1">
                      {QUESTION_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setQuestionType(t);
                            setQuestionTypeDropOpen(false);
                          }}
                          className={`w-full text-left cursor-pointer px-4 py-2 text-[14px] transition-colors ${t === questionType ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                        onClick={() => setLectureType(t)}
                        className={`flex items-center gap-2 px-4 h-9 rounded-md text-[13px] cursor-pointer border transition-colors ${
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
              </div>

              {/* Lesson Title */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    lectureType === "Video"
                      ? "Write video title"
                      : "Write article title"
                  }
                  className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
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

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Write description"
                  className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>

              {lectureType === "Video" && (
                <>
                  {/* Video Duration */}
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-normal text-(--text-title)">
                      Video Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Write video duration"
                      className="w-full h-12 px-3 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                    />
                  </div>

                  {/* Upload Video */}
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-normal text-(--text-title)">
                      Upload Video
                    </label>
                    <div className="w-full rounded-lg border mt-1 border-dashed border-(--gray-200) bg-(--gray-50) flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-(--primary-300) hover:bg-(--primary-50) transition-colors">
                      <Upload className="w-5 h-5 text-(--gray-400)" />
                      <p className="text-[12px] text-(--gray-500)">
                        Upload mp4 Video
                      </p>
                    </div>
                    <p className="text-[12px] text-(--gray-500)">
                      Note: All files should be at least 720p and less than 4.0
                      GB.
                    </p>
                  </div>
                </>
              )}

              {lectureType === "Article" && (
                <div className="space-y-1.5">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Article Content
                  </label>
                  <div className="mt-1">
                    <RichTextEditor
                      value={articleContent}
                      onChange={setArticleContent}
                      placeholder="Write your article content here..."
                      minHeight="100px"
                    />
                  </div>
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
          {isEdit && (
            <button className="flex items-center gap-2 text-[14px] font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete Lesson
            </button>
          )}
          <div className={`flex items-center gap-2 ${isEdit ? "sm:ml-auto" : "ml-auto"}`}>
            <button
              onClick={onClose}
              className="px-4 h-9 text-[12px]  md:text-[14px] lg:text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
            >
              Cancel
            </button>
            {lessonType !== "Quiz" && (
              <button
                onClick={onClose}
                className="px-4 h-9 text-[12px]  md:text-[14px] lg:text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
              >
                Save Draft
              </button>
            )}
            {(() => {
              const isAssignment = lessonType === "Assignment";
              const disabled = isAssignment && !title.trim();
              return (
                <button
                  onClick={handleSave}
                  disabled={disabled}
                  className={`px-4 h-9 text-[12px] md:text-[14px] lg:text-[14px] font-semibold rounded-md transition-colors ${
                    disabled
                      ? "bg-(--gray-200) text-(--gray-400) cursor-not-allowed"
                      : "bg-(--primary-700) hover:bg-(--primary-900) text-white cursor-pointer"
                  }`}
                >
                  {lessonType === "Quiz" ||
                  lessonType === "Coding Exercise" ||
                  lessonType === "Assignment"
                    ? "Next"
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
