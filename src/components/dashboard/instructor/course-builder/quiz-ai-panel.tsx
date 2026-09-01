"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { QuestionDifficulty } from "@/lib/course-api";

/** What each level asks of the learner. The label is what the instructor picks;
 *  the hint is why they would. */
const DIFFICULTIES: {
  value: QuestionDifficulty;
  label: string;
  hint: string;
}[] = [
  { value: "recall", label: "Recall", hint: "State a fact from the lesson" },
  {
    value: "understanding",
    label: "Understanding",
    hint: "Explain or tell two ideas apart",
  },
  {
    value: "application",
    label: "Application",
    hint: "Pick the right outcome for a case",
  },
];

export interface QuizAiSettings {
  questionCount: number;
  optionsPerQuestion: number;
  difficulty: QuestionDifficulty;
  focus: string;
}

export const DEFAULT_QUIZ_AI_SETTINGS: QuizAiSettings = {
  questionCount: 5,
  optionsPerQuestion: 4,
  difficulty: "understanding",
  focus: "",
};

/**
 * Generate-questions panel, rendered above the question list in Quiz Builder.
 *
 * Only asks for what the instructor decides. The course, the module and the
 * lecture text the questions are written from are all resolved server-side from
 * the quiz id — the browser never chooses what the model is grounded in.
 */
export default function QuizAiPanel({
  settings,
  onChange,
  generating,
  disabled,
  disabledReason,
  onGenerate,
}: {
  settings: QuizAiSettings;
  onChange: (changes: Partial<QuizAiSettings>) => void;
  /** A generation is in flight. */
  generating: boolean;
  /** Nothing can be generated yet — see `disabledReason`. */
  disabled: boolean;
  disabledReason?: string;
  onGenerate: () => void;
}) {
  const busy = generating || disabled;

  return (
    <div className="rounded-lg border border-(--primary-200) bg-(--primary-50) px-3 py-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-(--primary-700) shrink-0" />
        <p className="text-[13px] font-semibold text-(--text-title)">
          Write questions with AI
        </p>
      </div>
      <p className="text-[12px] text-(--gray-500)">
        Drafts questions from the lessons in this module. You review and edit
        every one before anything is added — nothing is saved until you accept
        them.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[12px] text-(--text-paragraph)">
          Questions
          <input
            type="number"
            min="1"
            max="15"
            value={settings.questionCount}
            onChange={(e) =>
              onChange({ questionCount: Number(e.target.value) })
            }
            disabled={generating}
            className="w-16 h-9 px-2 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:opacity-60"
          />
        </label>

        <label className="flex items-center gap-2 text-[12px] text-(--text-paragraph)">
          Options each
          <select
            value={settings.optionsPerQuestion}
            onChange={(e) =>
              onChange({ optionsPerQuestion: Number(e.target.value) })
            }
            disabled={generating}
            className="h-9 px-2 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:opacity-60 cursor-pointer"
          >
            {[2, 3, 4, 5].map((count) => (
              <option key={count} value={count}>
                {count}
                {count === 2 ? " (true/false)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Difficulty is what the question asks of the learner, not how obscure
          the subject is — the course's own level is separate. */}
      <div className="flex flex-wrap items-center gap-1.5">
        {DIFFICULTIES.map((option) => {
          const active = settings.difficulty === option.value;
          return (
            <button
              key={option.value}
              type="button"
              title={option.hint}
              onClick={() => onChange({ difficulty: option.value })}
              disabled={generating}
              className={`h-8 px-3 text-[12px] rounded-full border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                active
                  ? "border-(--primary-700) bg-(--primary-700) text-white font-medium cursor-pointer"
                  : "border-(--gray-200) bg-white text-(--gray-600) hover:bg-(--gray-50) cursor-pointer"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={settings.focus}
        onChange={(e) => onChange({ focus: e.target.value })}
        disabled={generating}
        placeholder="Optional: what to focus on, e.g. “the learning rate”"
        className="w-full h-10 px-3 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:opacity-60"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={busy}
          className={`flex items-center gap-2 px-4 h-9 text-[13px] font-semibold rounded-md transition-colors ${
            busy
              ? "bg-(--gray-200) text-(--gray-400) cursor-not-allowed"
              : "bg-(--primary-700) hover:bg-(--primary-900) text-white cursor-pointer"
          }`}
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generating ? "Writing questions…" : "Generate questions"}
        </button>
        {disabled && disabledReason && (
          <span className="text-[12px] text-(--gray-500)">{disabledReason}</span>
        )}
      </div>
    </div>
  );
}
