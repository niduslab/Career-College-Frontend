"use client";

import { useState } from "react";
import {
  X,
  Eye,
  Plus,
  ChevronDown,
  Upload,
  Trash2,
  LayoutGrid,
  Check,
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
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { uid } from "./constants";
import type { QuizQuestion } from "./quiz-types";
import { QTYPES, QUIZ_TABS, type QuizTab, defaultOptions } from "./quiz-types";
import QuestionCard from "./question-card";
import PreviewTab from "./tabs/preview-tab";
import SubmissionTab from "./tabs/submission-tab";

export default function QuizBuilder({
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

  const addQuestion = () =>
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
              options: q.options.map((o) => ({ ...o, correct: o.id === oid })),
            }
          : q,
      ),
    );

  const reorderQuestions = (oldIdx: number, newIdx: number) =>
    setQuestions((prev) => arrayMove(prev, oldIdx, newIdx));

  const duplicateQuestion = (idx: number) =>
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
        <div className="px-4 sm:px-6 py-3">
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
                <span className="truncate">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 pb-6 space-y-5 flex-1">
          {/* ── Build tab ── */}
          {activeTab === "Build" && (
            <>
              {/* Title + Question Type + Preview as Student */}
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
                  onClick={() => setActiveTab("Preview")}
                  className="shrink-0 flex items-center justify-center gap-2 h-12 px-4 border border-(--gray-200) rounded-lg text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors whitespace-nowrap w-full sm:w-auto"
                >
                  <Eye className="w-4 h-4" />
                  Preview as Student
                </button>
              </div>

              {/* Questions */}
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

          {activeTab === "Preview" && (
            <PreviewTab quizTitle={quizTitle} questions={questions} />
          )}
          {activeTab === "Submission" && (
            <SubmissionTab questions={questions} passMark={passMark} />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-(--gray-200) bg-(--gray-100) rounded-b-2xl">
          {questions.length > 0 ? (
            <button className="flex items-center gap-2 text-[14px] font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors self-start sm:self-auto order-last sm:order-first">
              <Trash2 className="w-4 h-4" />
              Delete Quiz
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            {questions.length > 0 && (
              <>
                <button
                  onClick={onBack}
                  className="flex-1 sm:flex-none px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors whitespace-nowrap"
                >
                  Save Draft
                </button>
                <button
                  onClick={onDone}
                  className="flex-1 sm:flex-none px-5 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors whitespace-nowrap"
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
