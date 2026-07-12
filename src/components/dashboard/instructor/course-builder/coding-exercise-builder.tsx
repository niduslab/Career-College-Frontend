"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import type { UiLanguageConfig, UiTestCase } from "./coding-exercise-types";
import {
  getCodingExercise,
  updateCodingExercise,
  deleteCodingExercise,
  createCodingLanguageConfig,
  listCodingLanguageConfigs,
  updateCodingLanguageConfig,
  deleteCodingLanguageConfig,
  createCodingTestCase,
  listCodingTestCases,
  updateCodingTestCase,
  deleteCodingTestCase,
  type CodingDifficulty,
  type CodingLanguage,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const DIFFICULTIES: CodingDifficulty[] = ["easy", "medium", "hard"];

const LANGUAGE_OPTIONS: { value: CodingLanguage; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

function languageLabel(lang: CodingLanguage): string {
  return LANGUAGE_OPTIONS.find((o) => o.value === lang)?.label ?? lang;
}

export default function CodingExerciseBuilder({
  exerciseId,
  onDone,
  onDelete,
  onClose,
}: {
  exerciseId: number;
  onDone: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [difficulty, setDifficulty] = useState<CodingDifficulty>("easy");
  const [supportedLanguages, setSupportedLanguages] = useState<
    CodingLanguage[]
  >([]);
  const [defaultLanguage, setDefaultLanguage] =
    useState<CodingLanguage | null>(null);
  const [timeLimitMs, setTimeLimitMs] = useState("");

  const [languageConfigs, setLanguageConfigs] = useState<UiLanguageConfig[]>(
    [],
  );
  const [activeLanguage, setActiveLanguage] = useState<CodingLanguage | null>(
    null,
  );
  const [draftCode, setDraftCode] = useState<
    Record<CodingLanguage, { starter_code: string; solution_code: string }>
  >({} as Record<CodingLanguage, { starter_code: string; solution_code: string }>);

  const [testCases, setTestCases] = useState<UiTestCase[]>([]);
  const [addingTestCase, setAddingTestCase] = useState(false);
  const [deletingExercise, setDeletingExercise] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [exercise, configs, cases] = await Promise.all([
          getCodingExercise(exerciseId),
          listCodingLanguageConfigs(exerciseId),
          listCodingTestCases(exerciseId),
        ]);
        if (!active) return;
        setTitle(exercise.title);
        setDescription(exercise.description ?? "");
        setProblemStatement(exercise.problem_statement);
        setDifficulty(exercise.difficulty);
        setSupportedLanguages(exercise.supported_languages);
        setDefaultLanguage(exercise.default_language);
        setTimeLimitMs(
          exercise.time_limit_ms != null ? String(exercise.time_limit_ms) : "",
        );
        setLanguageConfigs(
          configs.map((c) => ({ ...c, saving: false })),
        );
        setTestCases(cases.map((c) => ({ ...c, saving: false })));
        setActiveLanguage(exercise.supported_languages[0] ?? null);
        setDraftCode(
          Object.fromEntries(
            exercise.supported_languages.map((lang) => [
              lang,
              { starter_code: "", solution_code: "" },
            ]),
          ) as Record<
            CodingLanguage,
            { starter_code: string; solution_code: string }
          >,
        );
      } catch (err) {
        if (!active) return;
        notify.error(
          err instanceof ApiError
            ? err.message
            : "Failed to load coding exercise.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [exerciseId]);

  const handleTitleBlur = async () => {
    if (!title.trim()) return;
    setSavingTitle(true);
    try {
      const { message } = await updateCodingExercise(exerciseId, {
        title: title.trim(),
      });
      notify.success(message ?? "Exercise updated.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update title.",
      );
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDescriptionBlur = async () => {
    try {
      const { message } = await updateCodingExercise(exerciseId, {
        description,
      });
      notify.success(message ?? "Exercise updated.");
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update description.",
      );
    }
  };

  const handleProblemStatementBlur = async () => {
    if (!problemStatement.trim()) return;
    try {
      const { message } = await updateCodingExercise(exerciseId, {
        problem_statement: problemStatement.trim(),
      });
      notify.success(message ?? "Exercise updated.");
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update problem statement.",
      );
    }
  };

  const handleDifficultyChange = async (d: CodingDifficulty) => {
    const prev = difficulty;
    setDifficulty(d);
    try {
      const { message } = await updateCodingExercise(exerciseId, {
        difficulty: d,
      });
      notify.success(message ?? "Exercise updated.");
    } catch (err) {
      setDifficulty(prev);
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update difficulty.",
      );
    }
  };

  const handleTimeLimitBlur = async () => {
    const parsed = timeLimitMs.trim() ? Number(timeLimitMs) : undefined;
    try {
      const { message } = await updateCodingExercise(exerciseId, {
        time_limit_ms: parsed,
      });
      notify.success(message ?? "Exercise updated.");
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update time limit.",
      );
    }
  };

  const toggleSupportedLanguage = async (lang: CodingLanguage) => {
    const prevSupported = supportedLanguages;
    const prevDefault = defaultLanguage;
    const isRemoving = supportedLanguages.includes(lang);
    const nextSupported = isRemoving
      ? supportedLanguages.filter((l) => l !== lang)
      : [...supportedLanguages, lang];
    const nextDefault =
      isRemoving && defaultLanguage === lang
        ? (nextSupported[0] ?? null)
        : defaultLanguage;

    setSupportedLanguages(nextSupported);
    setDefaultLanguage(nextDefault);
    if (isRemoving && activeLanguage === lang) {
      setActiveLanguage(nextSupported[0] ?? null);
    } else if (!isRemoving) {
      setDraftCode((prev) => ({
        ...prev,
        [lang]: prev[lang] ?? { starter_code: "", solution_code: "" },
      }));
      setActiveLanguage(lang);
    }

    try {
      const { message } = await updateCodingExercise(exerciseId, {
        supported_languages: nextSupported,
        default_language: nextDefault ?? undefined,
      });
      notify.success(message ?? "Exercise updated.");
    } catch (err) {
      setSupportedLanguages(prevSupported);
      setDefaultLanguage(prevDefault);
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update supported languages.",
      );
    }
  };

  const handleDefaultLanguageChange = async (lang: CodingLanguage) => {
    const prev = defaultLanguage;
    setDefaultLanguage(lang);
    try {
      const { message } = await updateCodingExercise(exerciseId, {
        default_language: lang,
      });
      notify.success(message ?? "Exercise updated.");
    } catch (err) {
      setDefaultLanguage(prev);
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update default language.",
      );
    }
  };

  const configFor = (lang: CodingLanguage) =>
    languageConfigs.find((c) => c.language === lang);

  const handleDraftChange = (
    lang: CodingLanguage,
    field: "starter_code" | "solution_code",
    value: string,
  ) => {
    setDraftCode((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const saveNewLanguageConfig = async (lang: CodingLanguage) => {
    const draft = draftCode[lang] ?? { starter_code: "", solution_code: "" };
    try {
      const { data: config, message } = await createCodingLanguageConfig(
        exerciseId,
        {
          language: lang,
          starter_code: draft.starter_code,
          solution_code: draft.solution_code,
        },
      );
      setLanguageConfigs((prev) => [...prev, { ...config, saving: false }]);
      notify.success(message ?? "Language config added.");
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to save language config.",
      );
    }
  };

  const updateExistingLanguageConfig = async (
    configId: number,
    field: "starter_code" | "solution_code",
    value: string,
  ) => {
    setLanguageConfigs((prev) =>
      prev.map((c) => (c.id === configId ? { ...c, [field]: value } : c)),
    );
    try {
      await updateCodingLanguageConfig(exerciseId, configId, {
        [field]: value,
      });
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to save language config.",
      );
    }
  };

  const removeLanguageConfig = async (configId: number) => {
    try {
      const message = await deleteCodingLanguageConfig(exerciseId, configId);
      setLanguageConfigs((prev) => prev.filter((c) => c.id !== configId));
      notify.success(message ?? "Language config deleted.");
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to delete language config.",
      );
    }
  };

  const addTestCase = async () => {
    setAddingTestCase(true);
    try {
      const { data: testCase, message } = await createCodingTestCase(
        exerciseId,
        {
          input_data: "New input",
          expected_output: "New output",
          is_hidden: false,
          position: testCases.length + 1,
        },
      );
      setTestCases((prev) => [...prev, { ...testCase, saving: false }]);
      notify.success(message ?? "Test case added.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to add test case.",
      );
    } finally {
      setAddingTestCase(false);
    }
  };

  const updateTestCaseField = async (
    tcId: number,
    field: "input_data" | "expected_output" | "explanation" | "is_hidden",
    value: string | boolean,
  ) => {
    setTestCases((prev) =>
      prev.map((c) => (c.id === tcId ? { ...c, [field]: value } : c)),
    );
    try {
      await updateCodingTestCase(exerciseId, tcId, { [field]: value });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save test case.",
      );
    }
  };

  const removeTestCase = async (tcId: number) => {
    try {
      const message = await deleteCodingTestCase(exerciseId, tcId);
      setTestCases((prev) => prev.filter((c) => c.id !== tcId));
      notify.success(message ?? "Test case deleted.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete test case.",
      );
    }
  };

  const handleDeleteExercise = async () => {
    setDeletingExercise(true);
    try {
      const message = await deleteCodingExercise(exerciseId);
      notify.success(message ?? "Exercise deleted.");
      onDelete();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete exercise.",
      );
    } finally {
      setDeletingExercise(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            Coding Exercise Builder
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-(--gray-500)">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading exercise…
          </div>
        ) : (
          <div className="overflow-y-auto px-6 py-5 pb-6 space-y-5 flex-1">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Lesson Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  placeholder="Enter exercise title"
                  className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
                {savingTitle && (
                  <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400)" />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                rows={3}
                placeholder="What will the student learn in this lesson"
                className="w-full px-3 py-3 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
              />
            </div>

            {/* Problem Statement */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Problem Statement
              </label>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                onBlur={handleProblemStatementBlur}
                rows={6}
                placeholder="Describe the problem the student needs to solve..."
                className="w-full px-3 py-3 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
              />
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
                    onClick={() => handleDifficultyChange(d)}
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
                Supported Languages
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
                      onChange={() => toggleSupportedLanguage(opt.value)}
                      className="w-4 h-4 rounded border-(--gray-300) accent-(--primary-700) cursor-pointer"
                    />
                    <span className="text-[14px] text-(--text-title)">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Default Language */}
            <div className="space-y-2">
              <label className="text-[14px] font-normal text-(--text-title)">
                Default Language
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUAGE_OPTIONS.filter((opt) =>
                  supportedLanguages.includes(opt.value),
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleDefaultLanguageChange(opt.value)}
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
                onBlur={handleTimeLimitBlur}
                placeholder="e.g. 2000"
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>

            {/* Per-language code */}
            <div className="space-y-2">
              <label className="text-[14px] font-normal text-(--text-title)">
                Language Code
              </label>
              {supportedLanguages.length === 0 ? (
                <p className="text-[13px] text-(--gray-500)">
                  Select supported languages to add starter/solution code.
                </p>
              ) : (
                <>
                  <div className="flex gap-2 mt-1 overflow-x-auto pb-1 scrollbar-none">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLanguage(lang)}
                        className={`px-4 h-9 rounded-md text-[13px] border transition-colors cursor-pointer shrink-0 ${
                          activeLanguage === lang
                            ? "bg-(--primary-700) text-white border-(--primary-700) font-semibold"
                            : "border-(--gray-200) text-(--text-paragraph) hover:border-(--primary-300) hover:bg-(--primary-50)"
                        }`}
                      >
                        {languageLabel(lang)}
                      </button>
                    ))}
                  </div>

                  {activeLanguage &&
                    (() => {
                      const existing = configFor(activeLanguage);
                      const draft = draftCode[activeLanguage] ?? {
                        starter_code: "",
                        solution_code: "",
                      };
                      return (
                        <div className="border border-(--gray-200) rounded-xl p-4 space-y-3 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-(--text-title)">
                              {languageLabel(activeLanguage)}
                            </span>
                            {existing && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeLanguageConfig(existing.id)
                                }
                                className="text-red-400 hover:text-red-500 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[13px] font-normal text-(--text-title)">
                              Starter Code
                            </label>
                            <textarea
                              value={
                                existing
                                  ? existing.starter_code
                                  : draft.starter_code
                              }
                              onChange={(e) =>
                                existing
                                  ? updateExistingLanguageConfig(
                                      existing.id,
                                      "starter_code",
                                      e.target.value,
                                    )
                                  : handleDraftChange(
                                      activeLanguage,
                                      "starter_code",
                                      e.target.value,
                                    )
                              }
                              rows={5}
                              spellCheck={false}
                              className="w-full px-3 py-2 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[13px] font-normal text-(--text-title)">
                              Solution Code
                            </label>
                            <textarea
                              value={
                                existing
                                  ? existing.solution_code
                                  : draft.solution_code
                              }
                              onChange={(e) =>
                                existing
                                  ? updateExistingLanguageConfig(
                                      existing.id,
                                      "solution_code",
                                      e.target.value,
                                    )
                                  : handleDraftChange(
                                      activeLanguage,
                                      "solution_code",
                                      e.target.value,
                                    )
                              }
                              rows={5}
                              spellCheck={false}
                              className="w-full px-3 py-2 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
                            />
                          </div>

                          {!existing && (
                            <button
                              type="button"
                              onClick={() =>
                                saveNewLanguageConfig(activeLanguage)
                              }
                              className="px-4 h-9 text-[13px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors"
                            >
                              Save
                            </button>
                          )}
                        </div>
                      );
                    })()}
                </>
              )}
            </div>

            {/* Test Cases */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Test Cases
                </label>
                <button
                  type="button"
                  onClick={addTestCase}
                  disabled={addingTestCase}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-(--primary-700) hover:text-(--primary-900) cursor-pointer transition-colors disabled:opacity-60"
                >
                  {addingTestCase ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add Test Case
                </button>
              </div>

              {testCases.length === 0 ? (
                <div className="w-full mt-1 rounded-lg border border-dashed border-(--gray-200) bg-(--gray-50) flex items-center justify-center gap-2 py-5">
                  <p className="text-[13px] text-(--gray-500)">
                    No test cases yet.
                  </p>
                </div>
              ) : (
                <div className="mt-1 space-y-3">
                  {testCases.map((c, i) => (
                    <div
                      key={c.id}
                      className="border border-(--gray-200) rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-(--text-title)">
                          Test Case {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTestCase(c.id)}
                          className="text-red-400 hover:text-red-500 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-normal text-(--text-title)">
                          Input Data
                        </label>
                        <textarea
                          value={c.input_data}
                          onChange={(e) =>
                            updateTestCaseField(
                              c.id,
                              "input_data",
                              e.target.value,
                            )
                          }
                          rows={2}
                          placeholder="e.g. [1, 2, 3]"
                          spellCheck={false}
                          className="w-full px-3 py-2 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-normal text-(--text-title)">
                          Expected Output
                        </label>
                        <textarea
                          value={c.expected_output}
                          onChange={(e) =>
                            updateTestCaseField(
                              c.id,
                              "expected_output",
                              e.target.value,
                            )
                          }
                          rows={2}
                          placeholder="e.g. 6"
                          spellCheck={false}
                          className="w-full px-3 py-2 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-normal text-(--text-title)">
                          Explanation
                        </label>
                        <input
                          type="text"
                          value={c.explanation}
                          onChange={(e) =>
                            updateTestCaseField(
                              c.id,
                              "explanation",
                              e.target.value,
                            )
                          }
                          placeholder="Optional explanation for this test case"
                          className="w-full h-10 px-3 mt-1 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={c.is_hidden}
                          onChange={(e) =>
                            updateTestCaseField(
                              c.id,
                              "is_hidden",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 rounded border-(--gray-300) accent-(--primary-700) cursor-pointer"
                        />
                        <span className="text-[13px] text-(--text-title)">
                          Hidden (grading only)
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-(--gray-200) bg-(--gray-100) rounded-b-2xl">
          <button
            onClick={handleDeleteExercise}
            disabled={deletingExercise}
            className="flex items-center gap-2 text-[14px] font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors self-start sm:self-auto order-last sm:order-first disabled:opacity-60"
          >
            {deletingExercise ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deletingExercise ? "Deleting…" : "Delete Exercise"}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onDone}
              className="flex-1 sm:flex-none px-5 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors whitespace-nowrap"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
