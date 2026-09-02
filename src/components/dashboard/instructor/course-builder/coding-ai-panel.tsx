"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { CodingLanguage, ExerciseDifficulty } from "@/lib/course-api";

const DIFFICULTIES: {
  value: ExerciseDifficulty;
  label: string;
  hint: string;
}[] = [
  { value: "intro", label: "Intro", hint: "One function, algorithm given" },
  { value: "core", label: "Core", hint: "One function, learner picks the approach" },
  {
    value: "challenge",
    label: "Challenge",
    hint: "Several functions, or a case the obvious approach handles badly",
  },
];

const LANGUAGE_LABEL: Record<CodingLanguage, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
};

export interface CodingAiSettings {
  difficulty: ExerciseDifficulty;
  topicHint: string;
}

export const DEFAULT_CODING_AI_SETTINGS: CodingAiSettings = {
  difficulty: "core",
  topicHint: "",
};

/**
 * Generate-exercise panel, rendered above the code editors.
 *
 * The language is not a control here — it is whatever the form above is set to,
 * and it decides the shape of the generated test script, so the panel names it
 * rather than letting it be changed in two places.
 */
export default function CodingAiPanel({
  language,
  settings,
  onChange,
  generating,
  disabled,
  disabledReason,
  onGenerate,
}: {
  language: CodingLanguage;
  settings: CodingAiSettings;
  onChange: (changes: Partial<CodingAiSettings>) => void;
  generating: boolean;
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
          Write this exercise with AI
        </p>
      </div>
      <p className="text-[12px] text-(--gray-500)">
        Drafts the problem, starter code, a reference solution and the test
        script in{" "}
        <strong className="text-(--text-title)">
          {LANGUAGE_LABEL[language]}
        </strong>
        , then runs it to check it works. You review everything before it is
        saved.
      </p>

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
        value={settings.topicHint}
        onChange={(e) => onChange({ topicHint: e.target.value })}
        disabled={generating}
        placeholder="Optional: what to practise, e.g. “dictionary lookups”"
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
          {generating ? "Writing exercise…" : "Generate exercise"}
        </button>
        {disabled && disabledReason && (
          <span className="text-[12px] text-(--gray-500)">{disabledReason}</span>
        )}
      </div>
    </div>
  );
}
