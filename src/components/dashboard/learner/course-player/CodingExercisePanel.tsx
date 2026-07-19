"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, RotateCcw, Play } from "lucide-react";
import {
  useLearnerCodingExercise,
  useRunCodingExercise,
  useCodingTaskStatus,
  useSubmitCodingExercise,
  useCodingSubmission,
  useRetryCodingSubmission,
} from "@/hooks/use-learner-consumption";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import CodeEditor from "@/components/common/code-editor";
import type {
  CodingTestResult,
  CodingSubmissionTestResult,
} from "@/lib/course-api";

function TestResultRow({
  result,
}: {
  result: CodingTestResult | CodingSubmissionTestResult;
}) {
  const passed = result.status === "passed";
  return (
    <div
      className={`rounded-lg border p-3 text-[13px] ${
        passed
          ? "border-emerald-200 bg-emerald-50"
          : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {passed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
        )}
        <span className="font-medium font-mono text-(--text-title) truncate">
          {result.test_name || `Test ${result.position}`}
        </span>
        <span className="text-(--gray-400) ml-auto shrink-0">
          {result.runtime_ms}ms
        </span>
      </div>
      <div className="space-y-1.5 font-mono text-[12px] text-(--gray-600)">
        {result.stdout && (
          <pre className="whitespace-pre-wrap bg-white/60 rounded-md px-2.5 py-1.5 overflow-x-auto">
            {result.stdout}
          </pre>
        )}
        {!passed && result.stderr && (
          <pre className="whitespace-pre-wrap text-rose-600 bg-white/60 rounded-md px-2.5 py-1.5 overflow-x-auto">
            {result.stderr}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function CodingExercisePanel({
  exerciseId,
  courseSlug,
  onCompleted,
  onNextLesson,
  isInstructorPreview,
}: {
  exerciseId: number;
  courseSlug?: string;
  /** Fired when a submission reaches "passed" — the item counts as completed. */
  onCompleted?: () => void;
  /** Navigate to the next curriculum item; omit to hide the button. */
  onNextLesson?: () => void;
  /** The course's own instructor previewing — run/submit are learner-only . */
  isInstructorPreview?: boolean;
}) {
  const { data: exercise, isLoading } = useLearnerCodingExercise(exerciseId);
  const runMutation = useRunCodingExercise();
  const submitMutation = useSubmitCodingExercise();
  const retryMutation = useRetryCodingSubmission();

  const [code, setCode] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const [submissionId, setSubmissionId] = useState<number | undefined>(
    undefined,
  );

  const { data: taskStatus } = useCodingTaskStatus(taskId);
  const activeSubmissionId = submissionId ?? exercise?.latest_submission?.id;
  const { data: submission } = useCodingSubmission(activeSubmissionId);

  // A passed submission counts toward course completion
  const queryClient = useQueryClient();
  const passed = submission?.status === "passed";
  useEffect(() => {
    if (passed) {
      onCompleted?.();
      queryClient.invalidateQueries({
        queryKey: ["learner-curriculum", courseSlug],
      });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    }
  }, [passed, courseSlug, queryClient, onCompleted]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-(--gray-400) text-[14px] p-6">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading exercise...
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-6 text-[14px] text-rose-500">
        Coding exercise not found.
      </div>
    );
  }

  const activeLanguage = exercise.language;
  const activeCode = code ?? exercise.starter_code ?? "";

  const handleRun = () => {
    if (!activeCode.trim()) {
      notify.error("Code cannot be empty.");
      return;
    }
    runMutation.mutate(
      { exerciseId, input: { language: activeLanguage, code: activeCode } },
      {
        onSuccess: (res) => setTaskId(res.data.task_id),
        onError: (err) =>
          notify.error(err instanceof ApiError ? err.message : "Run failed."),
      },
    );
  };

  const handleSubmit = () => {
    if (!activeCode.trim()) {
      notify.error("Code cannot be empty.");
      return;
    }
    submitMutation.mutate(
      { exerciseId, input: { language: activeLanguage, code: activeCode } },
      {
        onSuccess: (res) => setSubmissionId(res.data.id),
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Submit failed.",
          ),
      },
    );
  };

  const handleRetry = () => {
    if (!activeSubmissionId) return;
    retryMutation.mutate(activeSubmissionId, {
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.message : "Retry failed."),
    });
  };

  const runResult = taskStatus?.state === "SUCCESS" ? taskStatus.result : null;
  const runPending =
    taskId &&
    taskStatus?.state !== "SUCCESS" &&
    taskStatus?.state !== "FAILURE";

  const isSubmissionPending =
    submission?.status === "queued" || submission?.status === "grading";
  const isSubmissionError = submission?.status === "error";

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 max-h-[70vh] overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-(--text-title)">
              {exercise.title}
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-(--gray-100) text-(--gray-600) capitalize">
              {activeLanguage}
            </span>
          </div>
        </div>

        <div className="bg-(--gray-50) rounded-xl p-4">
          <p className="text-[13px] font-semibold text-(--text-title) mb-1.5">
            Problem
          </p>
          <p className="text-[13px] text-(--gray-600) whitespace-pre-wrap">
            {exercise.description}
          </p>
        </div>

        <CodeEditor
          language={activeLanguage}
          value={activeCode}
          onChange={setCode}
          minHeight="280px"
          dark
        />

        {isInstructorPreview ? (
          <p className="text-[13px] text-(--gray-400) italic">
            Preview only — running and submitting code is available to enrolled
            learners.
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={!!runPending || runMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-600) text-[14px] font-semibold transition-colors cursor-pointer border border-(--primary-100) disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {runPending || runMutation.isPending ? "Running..." : "Run"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmissionPending || submitMutation.isPending}
              className="px-4 py-2 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmissionPending || submitMutation.isPending
                ? "Submitting..."
                : "Submit"}
            </button>
          </div>
        )}

        {/* Run results (transient) */}
        {taskId && (
          <div>
            <p className="text-[13px] font-semibold text-(--text-title) mb-2">
              Run results
            </p>
            {runPending ? (
              <div className="flex items-center gap-2 text-(--gray-400) text-[13px]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing...
              </div>
            ) : runResult ? (
              <div className="space-y-2">
                <p
                  className={`text-[13px] font-medium ${
                    runResult.status === "passed"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {runResult.passed_tests}/{runResult.total_tests} tests passed
                </p>
                {runResult.error_message && (
                  <p className="text-[12px] font-mono text-rose-600 whitespace-pre-wrap bg-rose-50 rounded-lg p-2.5">
                    {runResult.error_message}
                  </p>
                )}
                {runResult.test_results.map((r) => (
                  <TestResultRow key={r.position} result={r} />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-rose-500">Run failed.</p>
            )}
          </div>
        )}

        {/* Submission results (persisted, all tests) */}
        {activeSubmissionId && (
          <div>
            <p className="text-[13px] font-semibold text-(--text-title) mb-2">
              Submission results
            </p>
            {!submission || isSubmissionPending ? (
              <div className="flex items-center gap-2 text-(--gray-400) text-[13px]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Grading...
              </div>
            ) : isSubmissionError ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <p className="text-[13px] font-medium text-rose-700 mb-1">
                  Execution error
                </p>
                {submission.error_message && (
                  <p className="text-[12px] font-mono text-rose-600 whitespace-pre-wrap mb-3">
                    {submission.error_message}
                  </p>
                )}
                <button
                  onClick={handleRetry}
                  disabled={retryMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {retryMutation.isPending ? "Retrying..." : "Retry"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-[13px] font-medium ${
                      submission.status === "passed"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {submission.passed_tests}/{submission.total_tests} tests
                    passed — score {submission.score}
                  </p>
                  {submission.status === "passed" && onNextLesson && (
                    <button
                      onClick={onNextLesson}
                      className="px-3 py-1.5 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Next lesson →
                    </button>
                  )}
                </div>
                {submission.test_results.map((r) => (
                  <TestResultRow key={r.id} result={r} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
