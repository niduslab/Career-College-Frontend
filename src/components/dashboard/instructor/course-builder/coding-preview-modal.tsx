"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import {
  getCodingTaskStatus,
  runInstructorCodingExercise,
  type CodingExerciseDraft,
  type CodingRunResult,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import CodeEditor from "@/components/common/code-editor";
import RunResultPanel from "./coding-run-result-panel";

const POLL_INTERVAL_MS = 750;
const POLL_MAX_ATTEMPTS = 80;

type Tab = "starter" | "solution" | "script";

const TABS: { value: Tab; label: string }[] = [
  { value: "starter", label: "Starter code" },
  { value: "solution", label: "Solution" },
  { value: "script", label: "Test script" },
];

export interface AcceptedExercise {
  description: string;
  starter_code: string;
  solution_code: string;
  evaluation_script: string;
}

/** Dispatch one sandbox run and wait for it. Throws on failure or timeout. */
async function runAndWait(
  exerciseId: number,
  code: string,
  evaluationScript: string,
  isCurrent: () => boolean,
): Promise<CodingRunResult> {
  const { data } = await runInstructorCodingExercise(exerciseId, {
    code,
    evaluation_script: evaluationScript,
    mode: "tests",
  });
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    if (!isCurrent()) throw new Error("superseded");
    const status = await getCodingTaskStatus(data.task_id);
    if (status.state === "SUCCESS" && status.result) return status.result;
    if (status.state === "FAILURE") throw new Error("The run failed.");
  }
  throw new Error("The run timed out.");
}

/**
 * Review-and-accept gate for a generated coding exercise.
 *
 * The draft is executed before the instructor is asked to keep it: the solution
 * must pass every test, which proves the exercise is solvable and that the
 * script runs at all. The starter code is not run — nothing checks that it
 * fails, or that it compiles. A broken script is non-empty, so nothing
 * downstream would catch it either: course submission checks only that the
 * field is filled in.
 */
export default function CodingPreviewModal({
  draft,
  exerciseId,
  hasExistingCode,
  generating,
  applying,
  error,
  onRegenerate,
  onApply,
  onClose,
}: {
  draft: CodingExerciseDraft;
  exerciseId: number;
  /** The exercise already has code, so accepting overwrites it. */
  hasExistingCode: boolean;
  generating: boolean;
  applying: boolean;
  error?: string | null;
  onRegenerate: (currentDescription: string) => void;
  onApply: (exercise: AcceptedExercise) => void;
  onClose: () => void;
}) {
  useLockBodyScroll();

  const [description, setDescription] = useState(draft.description);
  const [starterCode, setStarterCode] = useState(draft.starter_code);
  const [solutionCode, setSolutionCode] = useState(draft.solution_code);
  const [evaluationScript, setEvaluationScript] = useState(draft.evaluation_script);
  const [tab, setTab] = useState<Tab>("script");

  const [verifying, setVerifying] = useState(false);
  const [solutionRun, setSolutionRun] = useState<CodingRunResult | null>(null);
  /** Set when the sandbox could not be reached — the verdict is unknown, not bad. */
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const runGeneration = useRef(0);

  const verify = useCallback(
    async (code: string, script: string) => {
      const generation = ++runGeneration.current;
      const isCurrent = () => runGeneration.current === generation;

      setVerifying(true);
      setVerifyError(null);
      setSolutionRun(null);
      try {
        const solution = await runAndWait(exerciseId, code, script, isCurrent);
        if (!isCurrent()) return;
        setSolutionRun(solution);
        setStale(false);
      } catch (err) {
        if (!isCurrent()) return;
        setVerifyError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error && err.message !== "superseded"
              ? err.message
              : "Could not reach the code runner.",
        );
      } finally {
        if (isCurrent()) setVerifying(false);
      }
    },
    [exerciseId],
  );

  // Verify each new draft as it arrives, including after a regenerate.
  const [seenDraft, setSeenDraft] = useState<CodingExerciseDraft | null>(null);
  useEffect(() => {
    if (draft === seenDraft) return;
    setSeenDraft(draft);
    setDescription(draft.description);
    setStarterCode(draft.starter_code);
    setSolutionCode(draft.solution_code);
    setEvaluationScript(draft.evaluation_script);
    setStale(false);
    setConfirmAccept(false);
    setConfirmDiscard(false);
    void verify(draft.solution_code, draft.evaluation_script);
  }, [draft, seenDraft, verify]);

  const edit = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setStale(true);
    setConfirmAccept(false);
  };

  const busy = generating || applying || verifying;
  const verdict: "verified" | "failed" | "unknown" | "pending" = verifyError
    ? "unknown"
    : solutionRun === null
      ? "pending"
      : solutionRun.status === "passed"
        ? "verified"
        : "failed";

  const accept = () => {
    if (verdict !== "verified" && !confirmAccept) {
      setConfirmAccept(true);
      return;
    }
    onApply({
      description: description.trim(),
      starter_code: starterCode,
      solution_code: solutionCode,
      evaluation_script: evaluationScript,
    });
  };

  const close = () => {
    if (busy) return;
    if (!confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  const codeFor = (t: Tab) =>
    t === "starter" ? starterCode : t === "solution" ? solutionCode : evaluationScript;
  const setterFor = (t: Tab) =>
    t === "starter" ? setStarterCode : t === "solution" ? setSolutionCode : setEvaluationScript;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div>
            <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title) flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-(--primary-600)" />
              Generated exercise
            </h3>
            <p className="text-[13px] text-(--text-paragraph) mt-1">
              Run against the real sandbox before you keep it. Nothing is saved
              until you accept.
            </p>
          </div>
          <button
            onClick={close}
            disabled={busy}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {!generating && !draft.grounded && (
            <p className="text-[13px] text-(--text-paragraph) bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This module has no written lesson content, so the exercise was
              written from titles alone — check it against what you actually
              teach.
            </p>
          )}

          {!generating && hasExistingCode && (
            <p className="text-[13px] text-(--text-paragraph) bg-(--gray-50) border border-(--gray-200) rounded-lg px-3 py-2">
              This exercise already has code. Accepting <strong>replaces</strong>{" "}
              its description, starter code, solution and test script.
            </p>
          )}

          {generating ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-(--gray-500)">
              <Loader2 className="w-5 h-5 animate-spin" />
              Writing a new exercise…
            </div>
          ) : (
            <>
              <VerdictBanner
                verdict={verdict}
                verifying={verifying}
                stale={stale}
                verifyError={verifyError}
                onReverify={() => void verify(solutionCode, evaluationScript)}
              />

              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Problem statement
                </label>
                <textarea
                  value={description}
                  onChange={(e) => edit(setDescription)(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 text-[13px] border border-(--gray-200) rounded-lg bg-(--gray-50) text-(--text-paragraph) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {TABS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTab(t.value)}
                      className={`h-8 px-3 text-[12px] rounded-md border transition-colors cursor-pointer ${
                        tab === t.value
                          ? "border-(--primary-700) bg-(--primary-50) text-(--primary-700) font-medium"
                          : "border-(--gray-200) bg-white text-(--gray-600) hover:bg-(--gray-50)"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <CodeEditor
                  key={tab}
                  language={draft.language}
                  value={codeFor(tab)}
                  onChange={edit(setterFor(tab))}
                  minHeight="220px"
                />
              </div>

              {draft.test_names.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[12px] font-semibold text-(--text-title)">
                    What the tests check
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {draft.test_names.map((name, i) => (
                      <li key={i} className="text-[12px] text-(--gray-600)">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {solutionRun && (
                <div>
                  <p className="text-[12px] font-semibold text-(--text-title)">
                    Solution run — every test must pass
                  </p>
                  <RunResultPanel result={solutionRun} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-(--gray-100)">
          <button
            onClick={() => onRegenerate(description)}
            disabled={busy}
            className="text-[14px] text-(--primary-600) font-normal hover:text-(--primary-700) cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            Regenerate
          </button>

          <div className="flex items-center gap-3">
            {confirmDiscard && !busy && (
              <span className="text-[12px] text-(--gray-600)">
                Discard this exercise?
              </span>
            )}
            <button
              onClick={close}
              disabled={busy}
              className="px-4 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-500) hover:bg-(--gray-50) cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirmDiscard ? "Discard" : "Cancel"}
            </button>
            <button
              onClick={accept}
              disabled={busy}
              className="px-4 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {applying && <Loader2 className="w-4 h-4 animate-spin" />}
              {applying
                ? "Saving…"
                : confirmAccept
                  ? "Use it anyway"
                  : "Use this exercise"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerdictBanner({
  verdict,
  verifying,
  stale,
  verifyError,
  onReverify,
}: {
  verdict: "verified" | "failed" | "unknown" | "pending";
  verifying: boolean;
  stale: boolean;
  verifyError: string | null;
  onReverify: () => void;
}) {
  if (verifying) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-(--text-paragraph) bg-(--gray-50) border border-(--gray-200) rounded-lg px-3 py-2">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        Running the exercise in the sandbox…
      </div>
    );
  }

  const reverify = (
    <button
      type="button"
      onClick={onReverify}
      className="text-[12px] text-(--primary-600) hover:text-(--primary-700) cursor-pointer transition-colors underline underline-offset-2"
    >
      Run the checks again
    </button>
  );

  if (stale) {
    return (
      <div className="flex items-start gap-2 text-[13px] text-(--text-paragraph) bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
        <span>
          You have edited the exercise, so the last result no longer describes
          it. {reverify}
        </span>
      </div>
    );
  }

  if (verdict === "unknown") {
    return (
      <div className="flex items-start gap-2 text-[13px] text-(--text-paragraph) bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
        <span>
          Could not verify this exercise — {verifyError} Nothing is stopping you
          keeping it, but it has not been run. {reverify}
        </span>
      </div>
    );
  }

  if (verdict === "verified") {
    return (
      <div className="flex items-center gap-2 text-[13px] text-(--text-paragraph) bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
        Verified — the reference solution passes every test. The starter code is
        not run; check it yourself before you keep it.
      </div>
    );
  }

  if (verdict === "failed") {
    return (
      <div className="flex items-start gap-2 text-[13px] text-(--text-paragraph) bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
        <span>
          The reference solution does not pass its own tests — the script or the
          solution is wrong. Edit below and re-run, or regenerate. {reverify}
        </span>
      </div>
    );
  }

  return null;
}
