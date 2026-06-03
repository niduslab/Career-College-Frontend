"use client";

import { useState } from "react";
import {
  X,
  Upload,
  ChevronDown,
  Eye,
  Plus,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  LayoutGrid,
  Check,
  ChartColumn,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lesson, LessonType } from "./types";
import { LESSON_TYPES, VIDEO_TYPES } from "./constants";

// Quiz Builder types

type QuizOption = { id: string; text: string; correct: boolean };
type QuizQuestion = {
  id: string;
  type: string;
  points: number;
  prompt: string;
  options: QuizOption[];
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function defaultOptions(): QuizOption[] {
  return [
    { id: uid(), text: "Option A", correct: true },
    { id: uid(), text: "Option B", correct: false },
    { id: uid(), text: "Option C", correct: false },
    { id: uid(), text: "Option D", correct: false },
  ];
}

// Quiz Builder inner component

const QTYPES = ["Multiple Choice", "True / False", "Short Answer", "Essay"];
const QUIZ_TABS = ["Build", "Preview", "Submission", "Analytics"] as const;
type QuizTab = (typeof QUIZ_TABS)[number];

function QuizBuilder({
  quizTitle,
  setQuizTitle,
  questionType,
  setQuestionType,
  passMark,
  setPassMark,
  onBack,
  onDone,
  onClose,
}: {
  quizTitle: string;
  setQuizTitle: (v: string) => void;
  questionType: string;
  setQuestionType: (v: string) => void;
  passMark: number;
  setPassMark: (v: number) => void;
  onBack: () => void;
  onDone: () => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<QuizTab>("Build");
  const [qtypeDropOpen, setQtypeDropOpen] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: uid(),
        type: questionType,
        points: 1,
        prompt: "",
        options: defaultOptions(),
      },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );

  const updateOption = (qid: string, oid: string, text: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === oid ? { ...o, text } : o,
              ),
            }
          : q,
      ),
    );

  const setCorrect = (qid: string, oid: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((o) => ({
                ...o,
                correct: o.id === oid,
              })),
            }
          : q,
      ),
    );

  const reorderQuestions = (oldIdx: number, newIdx: number) =>
    setQuestions((prev) => arrayMove(prev, oldIdx, newIdx));

  const duplicateQuestion = (idx: number) => {
    setQuestions((prev) => {
      const arr = [...prev];
      const copy = {
        ...arr[idx],
        id: uid(),
        options: arr[idx].options.map((o) => ({ ...o, id: uid() })),
      };
      arr.splice(idx + 1, 0, copy);
      return arr;
    });
  };

  const deleteQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            Quiz Builder
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 py-3 ">
          <div className="flex items-center gap-1 bg-(--gray-100) rounded-xl p-1">
            {QUIZ_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-4 h-9 rounded-lg text-[13px] sm:text-[14px] transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-white border border-(--gray-200) shadow-sm text-(--text-title) font-medium"
                    : "text-(--gray-500) hover:text-(--gray-700) font-normal"
                }`}
              >
                {tab === "Build" && <LayoutGrid className="w-4 h-4 shrink-0" />}
                {tab === "Preview" && <Eye className="w-4 h-4 shrink-0" />}
                {tab === "Submission" && <Check className="w-4 h-4 shrink-0" />}
                {tab === "Analytics" && (
                  <ChartColumn className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {activeTab === "Build" && (
            <>
              {/* Title + Question Type row + Preview */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-normal text-(--text-title)">
                      Video Title
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
                        onClick={() => setQtypeDropOpen((v) => !v)}
                        className="flex items-center w-full h-12 mt-1 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors"
                      >
                        <span className="flex-1 text-left text-(--text-title)">
                          {questionType}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-(--gray-500) transition-transform duration-200 ${qtypeDropOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {qtypeDropOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-50 py-1">
                          {QTYPES.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setQuestionType(t);
                                setQtypeDropOpen(false);
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
                <button
                  type="button"
                  className="shrink-0 flex items-center justify-center gap-2 h-12 px-4 border border-(--gray-200) rounded-lg text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors whitespace-nowrap w-full sm:w-auto"
                >
                  <Eye className="w-4 h-4" />
                  Preview as Student
                </button>
              </div>

              {/* Questions list */}
              {questions.length === 0 ? (
                <div className="w-full rounded-xl border border-dashed border-(--gray-200) bg-(--gray-100) flex flex-col items-center justify-center gap-3 py-10">
                  <Upload className="w-6 h-6 text-(--gray-400)" />
                  <div className="text-center">
                    <p className="text-[16px] font-medium text-(--text-title)">
                      No questions yet
                    </p>
                    <p className="text-[12px] text-(--text-paragraph) font-normal mt-1">
                      Start with your first question you can reorder anytime.
                    </p>
                  </div>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-5 h-10 bg-(--primary-700) hover:bg-(--primary-900) text-white text-[14px] font-semibold rounded-md cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event: DragEndEvent) => {
                      const { active, over } = event;
                      if (!over || active.id === over.id) return;
                      const oldIdx = questions.findIndex(
                        (q) => q.id === active.id,
                      );
                      const newIdx = questions.findIndex(
                        (q) => q.id === over.id,
                      );
                      reorderQuestions(oldIdx, newIdx);
                    }}
                  >
                    <SortableContext
                      items={questions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {questions.map((q, idx) => (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          index={idx}
                          total={questions.length}
                          onUpdate={(patch) => updateQuestion(q.id, patch)}
                          onUpdateOption={(oid, text) =>
                            updateOption(q.id, oid, text)
                          }
                          onSetCorrect={(oid) => setCorrect(q.id, oid)}
                          onMoveUp={() => reorderQuestions(idx, idx - 1)}
                          onMoveDown={() => reorderQuestions(idx, idx + 1)}
                          onDuplicate={() => duplicateQuestion(idx)}
                          onDelete={() => deleteQuestion(q.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-5 h-10 bg-(--primary-700) hover:bg-(--primary-900) text-white text-[14px] font-semibold rounded-md cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Question
                  </button>
                </div>
              )}

              {/* Pass Mark */}
              <div className="flex justify-end">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Pass Mark (%)
                  </label>
                  <div className="flex items-center w-28 h-12 mt-1 border border-(--gray-200) rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-(--primary-700) transition-shadow">
                    <input
                      type="number"
                      value={passMark}
                      onChange={(e) =>
                        setPassMark(
                          Math.min(100, Math.max(0, Number(e.target.value))),
                        )
                      }
                      min={0}
                      max={100}
                      className="flex-1 w-full h-full px-3 text-[14px] text-(--text-title) outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex flex-col h-full border-l border-(--gray-200) shrink-0 divide-y divide-(--gray-200)">
                      <button
                        type="button"
                        onClick={() => setPassMark(Math.min(100, passMark + 1))}
                        className="flex-1 flex items-center justify-center px-2 hover:bg-(--gray-50) cursor-pointer transition-colors"
                      >
                        <ChevronDown className="w-3 h-3 text-(--gray-400) rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPassMark(Math.max(0, passMark - 1))}
                        className="flex-1 flex items-center justify-center px-2 hover:bg-(--gray-50) cursor-pointer transition-colors"
                      >
                        <ChevronDown className="w-3 h-3 text-(--gray-400)" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab !== "Build" && (
            <div className="flex flex-col items-center justify-center py-16 text-(--gray-400) gap-2">
              <p className="text-[15px] font-medium">{activeTab} coming soon</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-(--gray-100)">
          {questions.length > 0 ? (
            <button
              onClick={() => {
                /* delete quiz */
              }}
              className="flex items-center gap-2 text-[14px] font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Quiz
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
            >
              Cancel
            </button>
            {questions.length > 0 && (
              <>
                <button
                  onClick={onBack}
                  className="px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
                >
                  Save Draft
                </button>
                <button
                  onClick={onDone}
                  className="px-5 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors"
                >
                  Publish Quiz
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Question Card
function QuestionCard({
  question,
  index,
  total,
  onUpdate,
  onUpdateOption,
  onSetCorrect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  onUpdate: (patch: Partial<QuizQuestion>) => void;
  onUpdateOption: (oid: string, text: string) => void;
  onSetCorrect: (oid: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [qtypeDropOpen, setQtypeDropOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="border border-(--gray-200) rounded-xl overflow-visible"
    >
      {/* Card header row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-(--gray-100) bg-(--gray-50) rounded-t-xl">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical className="w-4 h-4 text-(--gray-400)" />
        </button>

        {/* Question number badge */}
        <div className="w-6 h-6 rounded-full bg-(--primary-700) text-white text-[12px] font-bold flex items-center justify-center shrink-0">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Question type dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setQtypeDropOpen((v) => !v)}
            className="flex items-center gap-1.5 h-8 px-3 border border-(--gray-200) rounded-md bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
          >
            {question.type}
            <ChevronDown
              className={`w-3.5 h-3.5 text-(--gray-400) transition-transform duration-200 ${qtypeDropOpen ? "rotate-180" : ""}`}
            />
          </button>
          {qtypeDropOpen && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-50 py-1 min-w-40">
              {QTYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onUpdate({ type: t });
                    setQtypeDropOpen(false);
                  }}
                  className={`w-full text-left cursor-pointer px-4 py-2 text-[13px] transition-colors ${t === question.type ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Points stepper */}
        <div className="flex items-center gap-1">
          <div className="flex items-center h-8 border border-(--gray-200) rounded-md bg-white overflow-hidden">
            <input
              type="number"
              value={question.points}
              onChange={(e) =>
                onUpdate({
                  points: Math.max(1, Number(e.target.value)),
                })
              }
              className="w-10 h-full px-2 text-[13px] text-(--text-title) outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="pr-2 text-[13px] text-(--gray-500)">pts</span>
            <div className="flex flex-col h-full border-l border-(--gray-200) divide-y divide-(--gray-200) shrink-0">
              <button
                type="button"
                onClick={() => onUpdate({ points: question.points + 1 })}
                className="flex-1 flex items-center justify-center px-1.5 hover:bg-(--gray-50) cursor-pointer"
              >
                <ChevronDown className="w-3 h-3 text-(--gray-400) rotate-180" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdate({ points: Math.max(1, question.points - 1) })
                }
                className="flex-1 flex items-center justify-center px-1.5 hover:bg-(--gray-50) cursor-pointer"
              >
                <ChevronDown className="w-3 h-3 text-(--gray-400)" />
              </button>
            </div>
          </div>
        </div>

        {/* Reorder + actions */}
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 text-(--gray-400) hover:text-(--gray-600) disabled:opacity-30 cursor-pointer transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 text-(--gray-400) hover:text-(--gray-600) disabled:opacity-30 cursor-pointer transition-colors"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="p-1 text-(--gray-400) hover:text-(--gray-600) cursor-pointer transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Prompt */}
      <div className="px-4 py-3">
        <input
          type="text"
          value={question.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          placeholder="What is Primary Color?"
          className="w-full h-10 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
        />
      </div>

      {/* Options */}
      <div className="px-4 pb-4 space-y-2">
        {question.options.map((opt) => (
          <label
            key={opt.id}
            className={`flex items-center gap-3 h-11 px-3 border rounded-lg cursor-pointer transition-colors ${
              opt.correct
                ? "border-(--primary-300) bg-(--primary-50)"
                : "border-(--gray-200) bg-white hover:bg-(--gray-50)"
            }`}
          >
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={opt.correct}
              onChange={() => onSetCorrect(opt.id)}
              className="accent-(--primary-700) shrink-0"
            />
            <input
              type="text"
              value={opt.text}
              onChange={(e) => onUpdateOption(opt.id, e.target.value)}
              className="flex-1 text-[14px] text-(--text-title) bg-transparent outline-none"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

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
    initialLesson?.type ?? "Video",
  );
  const [title, setTitle] = useState(initialLesson?.title ?? "");
  const [videoType, setVideoType] = useState(initialLesson?.videoType ?? "");
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [duration, setDuration] = useState(initialLesson?.duration ?? "");
  const [description, setDescription] = useState(
    initialLesson?.description ?? "Follow my instruction",
  );

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
      return;
    } else {
      if (!title.trim()) return;
      onSave({
        type: lessonType,
        title: title.trim(),
        videoType,
        duration,
        description,
        isFreePreview: videoType === "Free Preview",
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
        onDone={() => {
          onSave({
            type: "Quiz",
            title: quizTitle.trim(),
            videoType: questionType,
            duration: "",
            description: "",
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

        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Lesson Type */}
          <div className="space-y-2">
            <label className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
              Lesson Type
            </label>
            <div className="flex flex-wrap gap-4">
              {LESSON_TYPES.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLessonType(key)}
                  className={`flex items-center gap-2 mt-2 px-3 h-10 rounded-md text-[14px]  cursor-pointer border transition-colors ${
                    lessonType === key
                      ? "bg-(--primary-700) text-white border-(--primary-700) font-semibold"
                      : "border-(--gray-200) text-(--text-paragraph) hover:border-(--primary-300) hover:bg-(--primary-50) font-normal"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Quiz — setup step */}
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

          {/* Video / Coding Exercise / Assignment fields */}
          {lessonType !== "Quiz" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Write video title"
                    className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] font-normal text-(--text-title)">
                    Type
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTypeDropOpen((v) => !v)}
                      className="flex items-center w-full h-12 mt-1 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors"
                    >
                      <span
                        className={`flex-1 text-left ${videoType ? "text-(--text-title)" : "text-(--gray-400)"}`}
                      >
                        {videoType || "Select type"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-(--gray-500) transition-transform duration-200 ${typeDropOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {typeDropOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-50 py-1">
                        {VIDEO_TYPES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setVideoType(t);
                              setTypeDropOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[14px] transition-colors ${
                              t === videoType
                                ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                                : "text-(--gray-600) hover:bg-(--gray-50)"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

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

              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Write video description"
                  className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Upload Video
                </label>
                <div className="w-full rounded-lg border mt-1 border-dashed border-(--gray-200) bg-(--gray-50) flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-(--primary-300) hover:bg-(--primary-50) transition-colors">
                  <Upload className="w-5 h-5 text-(--gray-400)" />
                  <p className="text-[12px] text-(--gray-500)">
                    Upload m4 Video
                  </p>
                </div>
                <p className="text-[12px] text-(--gray-500)">
                  Note: All files should be at least 720p and less than 4.0 GB.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-(--gray-100)">
          <button
            onClick={onClose}
            className="px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 h-10 text-[14px] font-normal bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors"
          >
            {lessonType === "Quiz" ? "Next" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
