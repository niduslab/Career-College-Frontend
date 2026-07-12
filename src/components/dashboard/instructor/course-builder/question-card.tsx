"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, Loader2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { UiQuizQuestion } from "./quiz-types";

export default function QuestionCard({
  question,
  index,
  saving,
  onUpdateText,
  onDeleteQuestion,
  onAddAnswer,
  onUpdateAnswerText,
  onSetCorrectAnswer,
  onDeleteAnswer,
}: {
  question: UiQuizQuestion;
  index: number;
  saving?: boolean;
  onUpdateText: (text: string) => void;
  onDeleteQuestion: () => void;
  onAddAnswer: (text: string) => void;
  onUpdateAnswerText: (answerId: number, text: string) => void;
  onSetCorrectAnswer: (answerId: number) => void;
  onDeleteAnswer: (answerId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });
  const [newAnswerText, setNewAnswerText] = useState("");

  const handleAddAnswer = () => {
    if (!newAnswerText.trim()) return;
    onAddAnswer(newAnswerText.trim());
    setNewAnswerText("");
  };

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
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-(--gray-100) bg-(--gray-50) rounded-t-xl">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical className="w-4 h-4 text-(--gray-400)" />
        </button>
        <div className="w-6 h-6 rounded-full bg-(--primary-700) text-white text-[12px] font-bold flex items-center justify-center shrink-0">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onDeleteQuestion}
          disabled={saving}
          className="p-1 text-red-400 hover:text-red-600 cursor-pointer transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Question text */}
      <div className="px-4 py-3">
        <input
          type="text"
          value={question.question_text}
          onChange={(e) => onUpdateText(e.target.value)}
          placeholder="Write the question..."
          className="w-full h-10 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
        />
      </div>

      {/* Answers */}
      <div className="px-4 pb-4 space-y-2">
        {question.loadingAnswers ? (
          <div className="flex items-center gap-2 text-(--gray-500) text-[13px] py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading answers…
          </div>
        ) : (
          <>
            {question.answers.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-3 h-11 px-3 border rounded-lg transition-colors ${
                  a.is_correct
                    ? "border-(--primary-300) bg-(--primary-50)"
                    : "border-(--gray-200) bg-white"
                }`}
              >
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={a.is_correct}
                  onChange={() => onSetCorrectAnswer(a.id)}
                  className="accent-(--primary-700) shrink-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={a.answer_text}
                  onChange={(e) => onUpdateAnswerText(a.id, e.target.value)}
                  className="flex-1 text-[14px] text-(--text-title) bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => onDeleteAnswer(a.id)}
                  className="text-(--gray-400) hover:text-red-500 cursor-pointer transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAnswerText}
                onChange={(e) => setNewAnswerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAnswer();
                  }
                }}
                placeholder="Add an answer option..."
                className="flex-1 h-10 px-3 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
              <button
                type="button"
                onClick={handleAddAnswer}
                className="flex items-center gap-1 h-10 px-3 border border-(--gray-200) rounded-lg text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
