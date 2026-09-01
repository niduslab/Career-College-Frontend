"use client";

import { useState } from "react";
import { Loader2, Plus, RefreshCw, Sparkles, Trash2, X } from "lucide-react";
import type {
  BulkQuizQuestionInput,
  QuestionDifficulty,
  QuizQuestionsDraft,
} from "@/lib/course-api";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

const DIFFICULTY_LABEL: Record<QuestionDifficulty, string> = {
  recall: "Recall",
  understanding: "Understanding",
  application: "Application",
};

/** Strip case, punctuation and spacing — what a model varies when it repeats
 *  itself. Mirrors the same normalisation on the server. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface OptionRow {
  /** Stable key — the AI response has no ids. */
  key: number;
  answer_text: string;
  is_correct: boolean;
}

interface DraftRow {
  key: number;
  question_text: string;
  /** Shown to the instructor while reviewing, then dropped: `QuizQuestion` has
   *  no column for it. */
  explanation: string;
  difficulty: QuestionDifficulty;
  included: boolean;
  /** Closely matches a question the quiz already has. */
  duplicate: boolean;
  options: OptionRow[];
}

let rowSeq = 0;

function toRows(draft: QuizQuestionsDraft, existing: string[]): DraftRow[] {
  const seen = new Set(existing.map(normalize));
  return draft.questions.map((question) => {
    const duplicate = seen.has(normalize(question.question_text));
    return {
      key: ++rowSeq,
      question_text: question.question_text,
      explanation: question.explanation ?? "",
      difficulty: question.difficulty,
      // A duplicate is offered, not hidden — the instructor may prefer this
      // wording — but it is never ticked by default.
      included: !duplicate,
      duplicate,
      options: question.options.map((option) => ({
        key: ++rowSeq,
        answer_text: option.answer_text,
        is_correct: option.is_correct,
      })),
    };
  });
}

/** First problem that would make the batch unsavable, or null. */
function validate(rows: DraftRow[]): string | null {
  for (const [index, row] of rows.entries()) {
    const position = index + 1;
    if (!row.question_text.trim()) {
      return `Question ${position} has no text.`;
    }
    if (row.options.length < MIN_OPTIONS) {
      return `Question ${position} needs at least ${MIN_OPTIONS} options.`;
    }
    if (row.options.some((option) => !option.answer_text.trim())) {
      return `Question ${position} has an empty answer option.`;
    }
    const texts = row.options.map((option) =>
      option.answer_text.trim().toLowerCase(),
    );
    if (new Set(texts).size !== texts.length) {
      return `Question ${position} repeats an answer option.`;
    }
    if (row.options.filter((option) => option.is_correct).length !== 1) {
      return `Question ${position} needs exactly one correct answer.`;
    }
  }
  return null;
}

/**
 * Review-and-edit gate between "generate" and "add to the quiz".
 *
 * Never auto-applied: a generated question nobody read is what
 * course-submission validation cannot catch, because it is complete — just
 * possibly wrong. Applying appends; it never replaces or reorders.
 */
export default function QuizPreviewModal({
  draft,
  existingQuestions,
  generating,
  applying,
  error,
  onRegenerate,
  onApply,
  onClose,
}: {
  draft: QuizQuestionsDraft;
  /** Question texts already on the quiz, for duplicate detection. */
  existingQuestions: string[];
  /** A regenerate is in flight — the list below is stale until it lands. */
  generating: boolean;
  /** The accepted questions are being written. */
  applying: boolean;
  /** Failure text to show inline. Never a toast: the draft must stay on screen. */
  error?: string | null;
  /** Called with the questions currently on screen, so a second run avoids
   *  them as well as the ones already saved. */
  onRegenerate: (onScreen: string[]) => void;
  onApply: (questions: BulkQuizQuestionInput[]) => void;
  onClose: () => void;
}) {
  useLockBodyScroll();

  const [rows, setRows] = useState<DraftRow[]>(() =>
    toRows(draft, existingQuestions),
  );
  const [localError, setLocalError] = useState<string | null>(null);
  /** Set on the first close click: the draft is not saved anywhere, so the
   *  second click is the confirmation. */
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Reset the editable rows when a new draft arrives — a regenerate. Local
  // edits are intentionally discarded: the instructor asked for new questions.
  //
  // Adjusted during render rather than in an effect (the React-recommended
  // shape for deriving state from a changed prop) so there is no extra commit
  // and no flash of the previous draft.
  const [seenDraft, setSeenDraft] = useState(draft);
  if (draft !== seenDraft) {
    setSeenDraft(draft);
    setRows(toRows(draft, existingQuestions));
    setLocalError(null);
    setConfirmDiscard(false);
  }

  const busy = generating || applying;
  const selected = rows.filter((row) => row.included);
  const shortfall = draft.requested_count - draft.questions.length;

  const patchRow = (key: number, changes: Partial<DraftRow>) =>
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...changes } : row)),
    );

  const patchOption = (
    rowKey: number,
    optionKey: number,
    changes: Partial<OptionRow>,
  ) =>
    setRows((prev) =>
      prev.map((row) =>
        row.key === rowKey
          ? {
              ...row,
              options: row.options.map((option) =>
                option.key === optionKey ? { ...option, ...changes } : option,
              ),
            }
          : row,
      ),
    );

  /** Single-correct: marking one option correct clears the rest, so the UI
   *  cannot express the state the database refuses to store. */
  const setCorrect = (rowKey: number, optionKey: number) =>
    setRows((prev) =>
      prev.map((row) =>
        row.key === rowKey
          ? {
              ...row,
              options: row.options.map((option) => ({
                ...option,
                is_correct: option.key === optionKey,
              })),
            }
          : row,
      ),
    );

  const addOption = (rowKey: number) =>
    setRows((prev) =>
      prev.map((row) =>
        row.key === rowKey && row.options.length < MAX_OPTIONS
          ? {
              ...row,
              options: [
                ...row.options,
                { key: ++rowSeq, answer_text: "", is_correct: false },
              ],
            }
          : row,
      ),
    );

  /** Removing the correct option promotes the first survivor, so a question
   *  never ends up with no answer. */
  const removeOption = (rowKey: number, optionKey: number) =>
    setRows((prev) =>
      prev.map((row) => {
        if (row.key !== rowKey || row.options.length <= MIN_OPTIONS) return row;
        const options = row.options.filter((option) => option.key !== optionKey);
        if (!options.some((option) => option.is_correct)) {
          options[0] = { ...options[0], is_correct: true };
        }
        return { ...row, options };
      }),
    );

  const apply = () => {
    const problem = validate(selected);
    if (problem) {
      setLocalError(problem);
      return;
    }
    setLocalError(null);
    onApply(
      selected.map((row) => ({
        question_text: row.question_text.trim(),
        options: row.options.map((option) => ({
          answer_text: option.answer_text.trim(),
          is_correct: option.is_correct,
        })),
      })),
    );
  };

  const close = () => {
    if (busy) return;
    if (!confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  const shown = error ?? localError;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div>
            <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title) flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-(--primary-600)" />
              Generated questions
            </h3>
            <p className="text-[13px] text-(--text-paragraph) mt-1">
              Edit anything below and untick what you don&apos;t want. Nothing is
              added to the quiz until you accept it.
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
          {shown && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {shown}
            </p>
          )}

          {!generating && !draft.grounded && (
            <p className="text-[13px] text-(--text-paragraph) bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This module has no written lesson content, so these questions are
              generated from titles alone — check every one against what you
              actually teach.
            </p>
          )}

          {!generating && shortfall > 0 && (
            <p className="text-[13px] text-(--text-paragraph) bg-(--gray-50) border border-(--gray-200) rounded-lg px-3 py-2">
              Asked for {draft.requested_count}, generated{" "}
              {draft.questions.length}. The rest repeated questions this quiz
              already has — regenerate for different ones.
            </p>
          )}

          {generating ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-(--gray-500)">
              <Loader2 className="w-5 h-5 animate-spin" />
              Writing new questions…
            </div>
          ) : (
            rows.map((row, index) => (
              <div
                key={row.key}
                className={`border rounded-xl transition-colors ${
                  row.included
                    ? "border-(--gray-200)"
                    : "border-(--gray-100) opacity-55"
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={row.included}
                    onChange={(e) =>
                      patchRow(row.key, { included: e.target.checked })
                    }
                    aria-label={`Include question ${index + 1}`}
                    className="mt-3.5 w-4 h-4 shrink-0 cursor-pointer accent-(--primary-600)"
                  />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-(--gray-400) shrink-0">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={row.question_text}
                        onChange={(e) =>
                          patchRow(row.key, { question_text: e.target.value })
                        }
                        className="w-full h-10 px-3 text-[14px] font-medium border border-(--gray-200) rounded-lg bg-(--gray-50) text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-(--gray-100) text-(--gray-600)">
                        {DIFFICULTY_LABEL[row.difficulty] ?? row.difficulty}
                      </span>
                      {row.duplicate && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Close to a question this quiz already asks
                        </span>
                      )}
                    </div>

                    {/* Options. The radio is the whole single-correct rule: one
                        is always selected, and no second one can be. */}
                    <div className="space-y-1.5 pt-0.5">
                      {row.options.map((option) => (
                        <div
                          key={option.key}
                          className={`flex items-center gap-3 h-11 px-3 border rounded-lg transition-colors ${
                            option.is_correct
                              ? "border-(--primary-300) bg-(--primary-50)"
                              : "border-(--gray-200) bg-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`gen-correct-${row.key}`}
                            checked={option.is_correct}
                            onChange={() => setCorrect(row.key, option.key)}
                            aria-label="Mark as the correct answer"
                            className="accent-(--primary-700) shrink-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={option.answer_text}
                            onChange={(e) =>
                              patchOption(row.key, option.key, {
                                answer_text: e.target.value,
                              })
                            }
                            placeholder="Answer option"
                            className="flex-1 text-[14px] text-(--text-title) bg-transparent placeholder:text-(--gray-400) outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(row.key, option.key)}
                            disabled={row.options.length <= MIN_OPTIONS}
                            aria-label="Remove this option"
                            className="text-(--gray-400) hover:text-red-500 cursor-pointer transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {row.options.length < MAX_OPTIONS && (
                        <button
                          type="button"
                          onClick={() => addOption(row.key)}
                          className="flex items-center gap-1 text-[12px] text-(--primary-600) hover:text-(--primary-700) cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add option
                        </button>
                      )}
                    </div>

                    {row.explanation && (
                      <p className="text-[12px] text-(--gray-500)">
                        <span className="text-(--gray-400)">Not saved — </span>
                        {row.explanation}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setRows((prev) => prev.filter((r) => r.key !== row.key))
                    }
                    aria-label={`Remove question ${index + 1}`}
                    className="mt-2.5 text-(--gray-400) hover:text-red-500 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {!generating && rows.length === 0 && (
            <p className="text-[14px] text-(--gray-500) text-center py-10">
              No questions left. Regenerate to try again.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-(--gray-100)">
          <button
            onClick={() => onRegenerate(rows.map((row) => row.question_text))}
            disabled={busy}
            className="text-[14px] text-(--primary-600) font-normal hover:text-(--primary-700) cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${generating ? "animate-spin" : ""}`}
            />
            Regenerate
          </button>

          <div className="flex items-center gap-3">
            {confirmDiscard && !busy && (
              <span className="text-[12px] text-(--gray-600)">
                Discard these questions?
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
              onClick={apply}
              disabled={busy || selected.length === 0}
              className="px-4 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {applying && <Loader2 className="w-4 h-4 animate-spin" />}
              {applying
                ? "Adding…"
                : `Add ${selected.length} question${selected.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
