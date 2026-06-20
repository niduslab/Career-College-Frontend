"use client";

import { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";

// types
export interface AssignmentQuestion {
  id: number;
  questionText: string;
  points: string;
  hint: string;
  modelAnswer: string;
  rubric: string;
}

interface Props {
  questions: AssignmentQuestion[];
  assignmentTitle: string;
  onBack: () => void;
  onDone: (questions: AssignmentQuestion[]) => void;
  onClose: () => void;
}

function emptyQuestion(): AssignmentQuestion {
  return {
    id: Date.now() + Math.random(),
    questionText: "",
    points: "",
    hint: "",
    modelAnswer: "",
    rubric: "",
  };
}

// Single question card
function QuestionCard({
  question,
  index,
  total,
  onChange,
  onRemove,
}: {
  question: AssignmentQuestion;
  index: number;
  total: number;
  onChange: (
    id: number,
    field: keyof AssignmentQuestion,
    value: string,
  ) => void;
  onRemove: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const set =
    (field: keyof AssignmentQuestion) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(question.id, field, e.target.value);

  return (
    <div className="border border-(--gray-200) rounded-xl overflow-hidden">
      {/* Card header — click to collapse */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-(--gray-50) cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-(--primary-700) text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <span className="text-[14px] font-medium text-(--text-title) truncate max-w-[320px]">
            {question.questionText.trim() || "Untitled question"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {question.points && (
            <span className="text-[12px] text-(--gray-500)">
              {question.points} pts
            </span>
          )}
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(question.id);
              }}
              className="text-red-400 hover:text-red-500 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-(--gray-400)" />
          ) : (
            <ChevronDown className="w-4 h-4 text-(--gray-400)" />
          )}
        </div>
      </div>

      {/* Card body */}
      {expanded && (
        <div className="px-4 py-4 space-y-4">
          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Question Text
              <span className="text-red-400 ml-0.5">*</span>
            </label>
            <textarea
              value={question.questionText}
              onChange={set("questionText")}
              rows={2}
              placeholder="Write the question here..."
              className="w-full px-3 py-2 mt-1 text-[12px] md:text-[14px] lg:text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
            />
          </div>

          {/* Points + Hint — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-(--text-title)">
                Points
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={question.points}
                onChange={set("points")}
                placeholder="e.g. 10"
                className="w-full h-10 px-3 mt-1 text-[12px] md:text-[14px] lg:text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-(--text-title)">
                Hint
                <span className="text-[12px] text-(--gray-400) font-normal ml-1">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={question.hint}
                onChange={set("hint")}
                placeholder="Give students a nudge..."
                className="w-full h-10 px-3 mt-1 text-[12px] md:text-[14px] lg:text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
          </div>

          {/* Model Answer */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Model Answer
              <span className="text-[12px] text-(--gray-400) font-normal ml-1">
                (shown to students after submission)
              </span>
            </label>
            <textarea
              value={question.modelAnswer}
              onChange={set("modelAnswer")}
              rows={3}
              placeholder="Write the ideal answer here..."
              className="w-full px-3 py-2 mt-1 text-[12px] md:text-[14px] lg:text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
            />
          </div>

          {/* Rubric */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Rubric
              <span className="text-[12px] text-(--gray-400) font-normal ml-1">
                (grading criteria for instructors)
              </span>
            </label>
            <textarea
              value={question.rubric}
              onChange={set("rubric")}
              rows={3}
              placeholder="e.g. Full marks: complete explanation with example. Partial: explanation only. Zero: off-topic."
              className="w-full px-3 py-2 mt-1 text-[12px] md:text-[14px] lg:text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Main modal
export default function AssignmentQuestionModal({
  questions: initialQuestions,
  assignmentTitle,
  onBack,
  onDone,
  onClose,
}: Props) {
  const [questions, setQuestions] = useState<AssignmentQuestion[]>(
    initialQuestions.length ? initialQuestions : [emptyQuestion()],
  );

  const totalPoints = questions.reduce(
    (sum, q) => sum + (parseFloat(q.points) || 0),
    0,
  );

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (id: number) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  const updateQuestion = (
    id: number,
    field: keyof AssignmentQuestion,
    value: string,
  ) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );

  const canSave = questions.every((q) => q.questionText.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div>
            <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
              Assignment Questions
            </h3>
            {assignmentTitle && (
              <p className="text-[12px] text-(--gray-500) mt-0.5">
                {assignmentTitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Total points summary bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-(--primary-50) border-b border-(--primary-100)">
          <span className="text-[13px] text-(--gray-600)">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[13px] font-semibold text-(--primary-700)">
            Total: {totalPoints} pts
          </span>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={questions.length}
              onChange={updateQuestion}
              onRemove={removeQuestion}
            />
          ))}

          {/* Add question button */}
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 text-[13px] font-medium text-(--primary-700) hover:text-(--primary-900) cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-(--gray-200) bg-(--gray-100) rounded-b-2xl">
          <button
            onClick={onBack}
            className="px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => canSave && onDone(questions)}
              disabled={!canSave}
              className={`px-5 h-10 text-[14px] font-semibold rounded-md transition-colors ${
                canSave
                  ? "bg-(--primary-700) hover:bg-(--primary-900) text-white cursor-pointer"
                  : "bg-(--gray-200) text-(--gray-400) cursor-not-allowed"
              }`}
            >
              Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
