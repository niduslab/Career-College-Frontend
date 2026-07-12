"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { Lesson } from "./types";
import type {
  CodingDifficulty,
  CodingLanguage,
} from "@/lib/course-api";
import CodingExerciseBuilder from "./coding-exercise-builder";

const DIFFICULTIES: CodingDifficulty[] = ["easy", "medium", "hard"];

const LANGUAGE_OPTIONS: { value: CodingLanguage; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

export interface CreateCodingExercisePayload {
  title: string;
  description: string;
  problem_statement: string;
  difficulty: CodingDifficulty;
  default_language: CodingLanguage;
  supported_languages: CodingLanguage[];
  time_limit_ms?: number;
}

export default function CodingExerciseModal({
  initialLesson,
  initialExerciseId,
  onSave,
  onClose,
  onCreateCodingExercise,
  onCodingExerciseDeleted,
}: {
  initialLesson?: Omit<Lesson, "id">;
  /** For an existing coding exercise, its real backend id — skips shell creation and opens the builder directly. */
  initialExerciseId?: number;
  onSave: (lesson: Omit<Lesson, "id">) => void;
  onClose: () => void;
  /** Create the coding exercise shell and return its real id. Required to author a new exercise. */
  onCreateCodingExercise?: (
    input: CreateCodingExercisePayload,
  ) => Promise<number | null>;
  /** Called after the exercise is deleted from within the builder, so the caller can refresh/close. */
  onCodingExerciseDeleted?: () => void;
}) {
  const [exerciseId, setExerciseId] = useState<number | null>(
    initialLesson?.type === "Coding Exercise"
      ? (initialExerciseId ?? null)
      : null,
  );

  const [title, setTitle] = useState(initialLesson?.title ?? "");
  const [description, setDescription] = useState(
    initialLesson?.description ?? "",
  );
  const [problemStatement, setProblemStatement] = useState("");
  const [difficulty, setDifficulty] = useState<CodingDifficulty>("easy");
  const [supportedLanguages, setSupportedLanguages] = useState<
    CodingLanguage[]
  >([]);
  const [defaultLanguage, setDefaultLanguage] =
    useState<CodingLanguage | null>(null);
  const [timeLimitMs, setTimeLimitMs] = useState("");
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    problemStatement?: string;
    supportedLanguages?: string;
    defaultLanguage?: string;
  }>({});

  const toggleLanguage = (lang: CodingLanguage) => {
    setSupportedLanguages((prev) => {
      const next = prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang];
      if (!next.includes(lang) && defaultLanguage === lang) {
        setDefaultLanguage(next.length > 0 ? next[0] : null);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, supportedLanguages: undefined }));
  };

  const handleCreate = async () => {
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = "Lesson title is required.";
    if (!problemStatement.trim())
      nextErrors.problemStatement = "Problem statement is required.";
    if (supportedLanguages.length === 0)
      nextErrors.supportedLanguages = "Select at least one language.";
    if (!defaultLanguage || !supportedLanguages.includes(defaultLanguage))
      nextErrors.defaultLanguage = "Select a default language.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    if (!onCreateCodingExercise || !defaultLanguage) return;
    setCreating(true);
    try {
      const parsedTimeLimit = timeLimitMs.trim()
        ? Number(timeLimitMs)
        : undefined;
      const createdId = await onCreateCodingExercise({
        title: title.trim(),
        description: description.trim(),
        problem_statement: problemStatement.trim(),
        difficulty,
        default_language: defaultLanguage,
        supported_languages: supportedLanguages,
        time_limit_ms: parsedTimeLimit,
      });
      if (createdId !== null) setExerciseId(createdId);
    } finally {
      setCreating(false);
    }
  };

  if (exerciseId !== null) {
    return (
      <CodingExerciseBuilder
        exerciseId={exerciseId}
        onDone={() =>
          onSave({
            type: "Coding Exercise",
            title: title.trim(),
            videoType: "",
            duration: "",
            description: "",
            isFreePreview: false,
          })
        }
        onDelete={() => {
          setExerciseId(null);
          onCodingExerciseDeleted?.();
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
            Add Coding Exercise
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
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
              placeholder="New Coding Exercise"
              className={`w-full h-12 px-3 text-[14px] mt-1 border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow ${
                errors.title
                  ? "border-red-400 focus:ring-red-400"
                  : "border-(--gray-200) focus:ring-(--primary-700)"
              }`}
            />
            {errors.title && (
              <p className="text-[12px] text-red-500 mt-1">{errors.title}</p>
            )}
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
              placeholder="What will the student learn in this lesson"
              className="w-full px-3 py-3 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
            />
          </div>

          {/* Problem Statement */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Problem Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              value={problemStatement}
              onChange={(e) => {
                setProblemStatement(e.target.value);
                setErrors((prev) => ({ ...prev, problemStatement: undefined }));
              }}
              rows={6}
              placeholder="Describe the problem the student needs to solve..."
              className={`w-full px-3 py-3 mt-1 text-[14px] border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow resize-none ${
                errors.problemStatement
                  ? "border-red-400 focus:ring-red-400"
                  : "border-(--gray-200) focus:ring-(--primary-700)"
              }`}
            />
            {errors.problemStatement && (
              <p className="text-[12px] text-red-500 mt-1">
                {errors.problemStatement}
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-[14px] font-normal text-(--text-title)">
              Difficulty
            </label>
            <div className="flex gap-2 mt-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex items-center gap-2 px-4 h-9 rounded-md text-[13px] border transition-colors cursor-pointer capitalize ${
                    difficulty === d
                      ? "bg-(--primary-700) text-white border-(--primary-700) font-semibold"
                      : "border-(--gray-200) text-(--text-paragraph) hover:border-(--primary-300) hover:bg-(--primary-50)"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Supported Languages */}
          <div className="space-y-2">
            <label className="text-[14px] font-normal text-(--text-title)">
              Supported Languages <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3 mt-1">
              {LANGUAGE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-3 h-10 border border-(--gray-200) rounded-lg cursor-pointer hover:bg-(--gray-50) transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={supportedLanguages.includes(opt.value)}
                    onChange={() => toggleLanguage(opt.value)}
                    className="w-4 h-4 rounded border-(--gray-300) accent-(--primary-700) cursor-pointer"
                  />
                  <span className="text-[14px] text-(--text-title)">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.supportedLanguages && (
              <p className="text-[12px] text-red-500 mt-1">
                {errors.supportedLanguages}
              </p>
            )}
          </div>

          {/* Default Language */}
          <div className="space-y-2">
            <label className="text-[14px] font-normal text-(--text-title)">
              Default Language <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {LANGUAGE_OPTIONS.filter((opt) =>
                supportedLanguages.includes(opt.value),
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setDefaultLanguage(opt.value);
                    setErrors((prev) => ({ ...prev, defaultLanguage: undefined }));
                  }}
                  className={`px-4 h-9 rounded-md text-[13px] border transition-colors cursor-pointer ${
                    defaultLanguage === opt.value
                      ? "bg-(--primary-700) text-white border-(--primary-700) font-semibold"
                      : "border-(--gray-200) text-(--text-paragraph) hover:border-(--primary-300) hover:bg-(--primary-50)"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {supportedLanguages.length === 0 && (
                <p className="text-[12px] text-(--gray-500)">
                  Select supported languages first.
                </p>
              )}
            </div>
            {errors.defaultLanguage && (
              <p className="text-[12px] text-red-500 mt-1">
                {errors.defaultLanguage}
              </p>
            )}
          </div>

          {/* Time Limit */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Time Limit (ms)
            </label>
            <input
              type="number"
              min="0"
              value={timeLimitMs}
              onChange={(e) => setTimeLimitMs(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 px-6 py-4 border-t border-(--gray-100) sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 h-9 text-[13px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-4 h-9 text-[13px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors disabled:opacity-60"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              {creating ? "Creating…" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
