"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Trash2,
  Loader2,
  Play,
  FlaskConical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  getCodingExercise,
  updateCodingExercise,
  deleteCodingExercise,
  runInstructorCodingExercise,
  getCodingTaskStatus,
  type CodingLanguage,
  type CodingRunResult,
  type CodingTestResult,
  type InstructorCodingRunMode,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { useDebouncedSave } from "@/lib/use-debounced-save";
import CodeEditor from "@/components/common/code-editor";

const LANGUAGE_OPTIONS: { value: CodingLanguage; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

const POLL_INTERVAL_MS = 750;
const POLL_MAX_ATTEMPTS = 80; // ~60s

function StatusIcon({ status }: { status: CodingTestResult["status"] }) {
  if (status === "passed")
    return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
  if (status === "failed")
    return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
  return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
}

function RunResultPanel({ result }: { result: CodingRunResult }) {
  return (
    <div className="border border-(--gray-200) rounded-xl overflow-hidden mt-2">
      <div className="flex items-center justify-between px-4 py-2.5 bg-(--gray-50) border-b border-(--gray-200)">
        <div className="flex items-center gap-2">
          <StatusIcon status={result.status} />
          <span className="text-[13px] font-semibold text-(--text-title) capitalize">
            {result.status}
          </span>
        </div>
        <span className="text-[12px] text-(--gray-500)">
          {result.passed_tests}/{result.total_tests} passed ·{" "}
          {result.runtime_ms} ms
        </span>
      </div>
      {result.error_message && (
        <pre className="px-4 py-3 text-[12px] font-mono text-red-600 whitespace-pre-wrap border-b border-(--gray-100)">
          {result.error_message}
        </pre>
      )}
      <div className="divide-y divide-(--gray-100)">
        {result.test_results.map((t) => (
          <div key={t.position} className="px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <StatusIcon status={t.status} />
                <span className="text-[13px] font-mono text-(--text-title) truncate">
                  {t.test_name}
                </span>
              </div>
              <span className="text-[12px] text-(--gray-500) shrink-0">
                {t.runtime_ms} ms
              </span>
            </div>
            {t.stdout && (
              <pre className="text-[12px] font-mono text-(--text-paragraph) bg-(--gray-50) rounded-md px-3 py-2 whitespace-pre-wrap overflow-x-auto">
                {t.stdout}
              </pre>
            )}
            {t.status !== "passed" && t.stderr && (
              <pre className="text-[12px] font-mono text-red-600 bg-red-50 rounded-md px-3 py-2 whitespace-pre-wrap overflow-x-auto">
                {t.stderr}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
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
  const [language, setLanguage] = useState<CodingLanguage>("python");
  const [starterCode, setStarterCode] = useState("");
  const [solutionCode, setSolutionCode] = useState("");
  const [evaluationScript, setEvaluationScript] = useState("");
  const [timeLimitMs, setTimeLimitMs] = useState("");

  const [deletingExercise, setDeletingExercise] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);

  const [runningMode, setRunningMode] = useState<InstructorCodingRunMode | null>(
    null,
  );
  const [runResult, setRunResult] = useState<CodingRunResult | null>(null);
  const [runLabel, setRunLabel] = useState<string>("");
  const pollGeneration = useRef(0);
  const runPanelRef = useRef<HTMLDivElement | null>(null);

  const debounceSave = useDebouncedSave();

  // Bring the run panel into view when a run starts (spinner) and again
  // when the result lands — the modal body is long and the panel sits at
  // the bottom, so without this the user has to scroll manually.
  useEffect(() => {
    if (runningMode !== null || runResult !== null) {
      runPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: runResult !== null ? "start" : "nearest",
      });
    }
  }, [runningMode, runResult]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const exercise = await getCodingExercise(exerciseId);
        if (!active) return;
        setTitle(exercise.title);
        setDescription(exercise.description ?? "");
        setLanguage(exercise.language);
        setStarterCode(exercise.starter_code ?? "");
        setSolutionCode(exercise.solution_code ?? "");
        setEvaluationScript(exercise.evaluation_script ?? "");
        setTimeLimitMs(
          exercise.time_limit_ms != null ? String(exercise.time_limit_ms) : "",
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
      pollGeneration.current += 1; // cancel any in-flight poll loop
    };
  }, [exerciseId]);

  const handleTitleBlur = async () => {
    if (!title.trim()) return;
    setSavingTitle(true);
    try {
      await updateCodingExercise(exerciseId, { title: title.trim() });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update title.",
      );
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDescriptionBlur = async () => {
    if (!description.trim()) return;
    try {
      await updateCodingExercise(exerciseId, {
        description: description.trim(),
      });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update description.",
      );
    }
  };

  const handleLanguageChange = async (lang: CodingLanguage) => {
    const prev = language;
    setLanguage(lang);
    try {
      await updateCodingExercise(exerciseId, { language: lang });
    } catch (err) {
      setLanguage(prev);
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update language.",
      );
    }
  };

  const handleTimeLimitBlur = async () => {
    const parsed = timeLimitMs.trim() ? Number(timeLimitMs) : undefined;
    try {
      await updateCodingExercise(exerciseId, { time_limit_ms: parsed });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update time limit.",
      );
    }
  };

  const handleCodeChange = (
    field: "starter_code" | "solution_code" | "evaluation_script",
    value: string,
  ) => {
    if (field === "starter_code") setStarterCode(value);
    else if (field === "solution_code") setSolutionCode(value);
    else setEvaluationScript(value);
    debounceSave(`coding-exercise-${exerciseId}-${field}`, async () => {
      try {
        await updateCodingExercise(exerciseId, { [field]: value });
      } catch (err) {
        notify.error(
          err instanceof ApiError ? err.message : "Failed to save code.",
        );
      }
    });
  };

  const handleRun = async (mode: InstructorCodingRunMode) => {
    if (!solutionCode.trim()) {
      notify.error("Write a solution first — the run executes your solution code.");
      return;
    }
    if (mode === "tests" && !evaluationScript.trim()) {
      notify.error("Write a test script first.");
      return;
    }
    setRunningMode(mode);
    setRunResult(null);
    setRunLabel(mode === "tests" ? "Running tests…" : "Running code…");
    const generation = ++pollGeneration.current;
    try {
      // Send the current editor contents so unsaved edits run too.
      const { data } = await runInstructorCodingExercise(exerciseId, {
        code: solutionCode,
        ...(mode === "tests" ? { evaluation_script: evaluationScript } : {}),
        mode,
      });
      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (pollGeneration.current !== generation) return; // superseded
        const status = await getCodingTaskStatus(data.task_id);
        if (status.state === "SUCCESS" && status.result) {
          setRunResult(status.result);
          setRunLabel("");
          setRunningMode(null);
          return;
        }
        if (status.state === "FAILURE") {
          throw new Error("Run failed. Please try again.");
        }
      }
      throw new Error("Run timed out. Please try again.");
    } catch (err) {
      if (pollGeneration.current !== generation) return;
      setRunLabel("");
      setRunningMode(null);
      notify.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Run failed.",
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
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[94vh]">
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

            {/* Problem Description */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Problem Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                rows={5}
                placeholder="Describe the problem and the function(s) the student must implement..."
                className="w-full px-3 py-3 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-[14px] font-normal text-(--text-title)">
                Language
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleLanguageChange(opt.value)}
                    className={`px-4 h-9 rounded-md text-[13px] border transition-colors cursor-pointer ${
                      language === opt.value
                        ? "bg-(--primary-700) text-white border-(--primary-700) font-semibold"
                        : "border-(--gray-200) text-(--text-paragraph) hover:border-(--primary-300) hover:bg-(--primary-50)"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
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
              <p className="text-[12px] text-(--gray-500)">
                Wall-clock budget for the whole test suite.
              </p>
            </div>

            {/* Starter Code */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Starter Code
              </label>
              <p className="text-[12px] text-(--gray-500)">
                Shown to the learner as their starting point — declare the
                function signature(s) your test script will call.
              </p>
              <CodeEditor
                language={language}
                value={starterCode}
                onChange={(v) => handleCodeChange("starter_code", v)}
                placeholder={"def add(a, b):\n    pass"}
                minHeight="140px"
              />
            </div>

            {/* Solution Code */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Solution Code
              </label>
              <p className="text-[12px] text-(--gray-500)">
                Your reference implementation. Never shown to learners. Used by
                Run Code / Run Tests below.
              </p>
              <CodeEditor
                language={language}
                value={solutionCode}
                onChange={(v) => handleCodeChange("solution_code", v)}
                placeholder={"def add(a, b):\n    return a + b"}
                minHeight="180px"
              />
            </div>

            {/* Evaluation Script */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Test Script (evaluate)
              </label>
              <p className="text-[12px] text-(--gray-500)">
                Grades submissions by importing the learner&apos;s code and
                asserting on it. Never shown to learners.
                {language === "python" &&
                  " Python: a unittest module — `from exercise import ...`."}
                {language === "javascript" &&
                  " JavaScript: `const ex = require('./exercise')` + node assert, register with test(name, fn)."}
                {language === "java" &&
                  " Java: public class Evaluate with public test*() methods; throw AssertionError to fail."}
                {language === "cpp" &&
                  ' C++: #include "exercise.h" + "testkit.h"; TEST(name) { ASSERT_EQ(...); }'}
              </p>
              <CodeEditor
                language={language}
                value={evaluationScript}
                onChange={(v) => handleCodeChange("evaluation_script", v)}
                placeholder={
                  "import unittest\nfrom exercise import add\n\nclass AddTests(unittest.TestCase):\n    def test_small(self):\n        self.assertEqual(add(1, 2), 3)"
                }
                minHeight="220px"
              />
            </div>

            {/* Run panel */}
            <div ref={runPanelRef} className="space-y-2 scroll-mt-4">
              <label className="text-[14px] font-normal text-(--text-title)">
                Try It
              </label>
              <p className="text-[12px] text-(--gray-500)">
                Runs your solution code in the sandbox. Run Code executes it
                standalone (shows output); Run Tests grades it with your test
                script — make sure everything passes before publishing.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleRun("code")}
                  disabled={runningMode !== null}
                  className="flex items-center gap-2 px-4 h-9 text-[13px] font-medium border border-(--gray-200) rounded-md text-(--text-title) hover:bg-(--gray-50) cursor-pointer transition-colors disabled:opacity-60"
                >
                  {runningMode === "code" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run Code
                </button>
                <button
                  type="button"
                  onClick={() => handleRun("tests")}
                  disabled={runningMode !== null}
                  className="flex items-center gap-2 px-4 h-9 text-[13px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors disabled:opacity-60"
                >
                  {runningMode === "tests" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FlaskConical className="w-4 h-4" />
                  )}
                  Run Tests
                </button>
                {runLabel && (
                  <span className="text-[13px] text-(--gray-500)">
                    {runLabel}
                  </span>
                )}
              </div>
              {runResult && <RunResultPanel result={runResult} />}
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
