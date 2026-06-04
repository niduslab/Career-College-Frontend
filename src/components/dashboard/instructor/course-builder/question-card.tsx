"use client";

import { useState } from "react";
import {
  GripVertical,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { QuizQuestion } from "./quiz-types";
import { QTYPES } from "./quiz-types";

export default function QuestionCard({
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });

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
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-(--gray-100) bg-(--gray-50) rounded-t-xl">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical className="w-4 h-4 text-(--gray-400)" />
        </button>

        {/* Number badge */}
        <div className="w-6 h-6 rounded-full bg-(--primary-700) text-white text-[12px] font-bold flex items-center justify-center shrink-0">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Type dropdown */}
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
                  onClick={() => { onUpdate({ type: t }); setQtypeDropOpen(false); }}
                  className={`w-full text-left cursor-pointer px-4 py-2 text-[13px] transition-colors ${
                    t === question.type
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

        <div className="flex-1" />

        {/* Points stepper */}
        <div className="flex items-center h-8 border border-(--gray-200) rounded-md bg-white overflow-hidden">
          <input
            type="number"
            value={question.points}
            onChange={(e) => onUpdate({ points: Math.max(1, Number(e.target.value)) })}
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
              onClick={() => onUpdate({ points: Math.max(1, question.points - 1) })}
              className="flex-1 flex items-center justify-center px-1.5 hover:bg-(--gray-50) cursor-pointer"
            >
              <ChevronDown className="w-3 h-3 text-(--gray-400)" />
            </button>
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
              className="accent-(--primary-700) shrink-0 cursor-pointer"
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
