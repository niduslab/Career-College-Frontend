"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Code2,
  Copy,
  FileQuestion,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  TvMinimalPlay,
  X,
} from "lucide-react";
import type {
  CourseOutlineDraft,
  OutlineModule,
  PlannedItem,
  PlannedItemType,
} from "@/lib/course-api";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

/** Same icons the curriculum rows use, so a planned item looks like the row it
 *  will become. */
const ITEM_ICON: Record<PlannedItemType, typeof TvMinimalPlay> = {
  lecture: TvMinimalPlay,
  quiz: FileQuestion,
  assignment: ClipboardList,
  coding: Code2,
};

const ITEM_LABEL: Record<PlannedItemType, string> = {
  lecture: "Lesson",
  quiz: "Quiz",
  assignment: "Assignment",
  coding: "Coding",
};

interface PlannedRow extends PlannedItem {
  included: boolean;
}

/** One module plus the local editing state the instructor controls. */
interface DraftRow extends Omit<OutlineModule, "content_plan"> {
  /** Stable key — the AI response has no ids. */
  key: number;
  included: boolean;
  content_plan: PlannedRow[];
}

let rowSeq = 0;
function toRows(modules: OutlineModule[]): DraftRow[] {
  return modules.map((m) => ({
    ...m,
    key: ++rowSeq,
    included: true,
    // `content_plan` is optional in practice: an older AI service build, or a
    // cached response, may not carry one. Treat its absence as "no items".
    content_plan: (m.content_plan ?? []).map((item) => ({
      ...item,
      included: true,
    })),
  }));
}

/** What an apply does with sections the course already has.
 *  `append` — leave them, add these after. `update` — overwrite the first N
 *  in place. Only ever chosen by the user; nothing infers it. */
export type OutlineApplyMode = "append" | "update";

/**
 * Review-and-edit gate between "generate" and "create sections".
 *
 * The AI output is a draft, never auto-applied: the instructor retitles,
 * rewrites summaries, drops modules they don't want, or regenerates, and only
 * then turns what's left into real course sections.
 */
export default function OutlinePreviewModal({
  draft,
  generating,
  creating,
  error,
  reusableCount,
  existingSectionCount,
  onRegenerate,
  onApply,
  onClose,
}: {
  draft: CourseOutlineDraft;
  /** A regenerate is in flight — the module list is stale until it lands. */
  generating: boolean;
  /** Sections are being created. */
  creating: boolean;
  /** Failure text to show inline (field errors or a rejected apply). */
  error?: string | null;
  /** How many sections a previous apply left behind that this one will update
   *  in place instead of duplicating. 0 when there is no record. */
  reusableCount: number;
  /** Sections the course has right now, from any source. Only consulted when
   *  `reusableCount` is 0 — then the user is asked what to do with them. */
  existingSectionCount: number;
  onRegenerate: () => void;
  onApply: (modules: OutlineModule[], mode: OutlineApplyMode) => void;
  onClose: () => void;
}) {
  useLockBodyScroll();

  const [rows, setRows] = useState<DraftRow[]>(() => toRows(draft.modules));
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showText, setShowText] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset the editable rows when a new draft arrives — a regenerate, or the
  // narrowed remainder after a partial apply. Local edits are intentionally
  // discarded: the instructor asked for a different outline.
  //
  // Adjusted during render rather than in an effect (the React-recommended
  // shape for deriving state from a changed prop) so there is no extra commit
  // and no flash of the previous draft.
  const [seenDraft, setSeenDraft] = useState(draft);
  if (draft !== seenDraft) {
    setSeenDraft(draft);
    setRows(toRows(draft.modules));
    setExpanded(null);
  }

  const patch = (key: number, changes: Partial<DraftRow>) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...changes } : r)),
    );

  /** Toggle one planned item inside a module. Items are addressed by index —
   *  they have no id, and nothing reorders them here. */
  const patchItem = (key: number, index: number, included: boolean) =>
    setRows((prev) =>
      prev.map((r) =>
        r.key === key
          ? {
              ...r,
              content_plan: r.content_plan.map((item, i) =>
                i === index ? { ...item, included } : item,
              ),
            }
          : r,
      ),
    );

  const selected = rows.filter((r) => r.included && r.title.trim());
  const selectedItemCount = selected.reduce(
    (sum, r) => sum + r.content_plan.filter((i) => i.included).length,
    0,
  );
  const busy = generating || creating;

  // Tracked provenance answers this silently. Without it, the user does —
  // defaulting to `append`, the non-overwriting choice.
  const [mode, setMode] = useState<OutlineApplyMode>("append");
  const mustAsk = reusableCount === 0 && existingSectionCount > 0;
  const targetCount =
    reusableCount > 0
      ? reusableCount
      : mustAsk && mode === "update"
        ? existingSectionCount
        : 0;

  // Split of what this apply will do: overwrite that many rows, then add any
  // modules beyond them.
  const willUpdate = Math.min(targetCount, selected.length);
  const willCreate = selected.length - willUpdate;
  const willLeave = Math.max(0, targetCount - selected.length);

  const applyLabel = () => {
    if (creating) return "Saving…";
    const items =
      selectedItemCount > 0
        ? ` + ${selectedItemCount} item${selectedItemCount === 1 ? "" : "s"}`
        : "";
    if (willUpdate === 0) {
      return `Create ${willCreate} section${willCreate === 1 ? "" : "s"}${items}`;
    }
    if (willCreate === 0) {
      return `Update ${willUpdate} section${willUpdate === 1 ? "" : "s"}${items}`;
    }
    return `Update ${willUpdate}, add ${willCreate}${items}`;
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(draft.outline_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is permission-gated; the textarea below is the fallback.
    }
  };

  const apply = () => {
    onApply(
      selected.map(({ key, included, content_plan, ...module }) => ({
        ...module,
        title: module.title.trim(),
        summary: module.summary.trim(),
        // Drop the pruned items and the local `included` flag — the caller
        // receives exactly the items it should create.
        content_plan: content_plan
          .filter((item) => item.included)
          .map(({ included: _kept, ...item }) => item),
      })),
      mode,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div>
            <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title) flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-(--primary-600)" />
              Generated outline
            </h3>
            <p className="text-[13px] text-(--text-paragraph) mt-1">
              Edit anything below, then create the modules and lessons you want
              to keep. Lessons are created empty — you add the content
              afterwards. Nothing is saved until you apply.
            </p>
          </div>
          <button
            onClick={onClose}
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

          {!generating && reusableCount > 0 && (
            <p className="text-[13px] text-(--text-paragraph) bg-(--primary-50) border border-(--primary-100) rounded-lg px-3 py-2">
              This replaces the outline you applied earlier:{" "}
              <strong className="text-(--text-title)">
                {willUpdate} existing section{willUpdate === 1 ? "" : "s"}
              </strong>{" "}
              will be updated in place
              {willCreate > 0 && `, and ${willCreate} new one${willCreate === 1 ? "" : "s"} added`}
              . Nothing is deleted — lessons already inside those sections stay
              where they are
              {willLeave > 0 &&
                `, and ${willLeave} leftover section${willLeave === 1 ? "" : "s"} will be left for you to remove`}
              .
            </p>
          )}

          {!generating && mustAsk && (
            <div className="text-[13px] bg-(--gray-50) border border-(--gray-200) rounded-lg px-3 py-3 space-y-2">
              <p className="text-(--text-paragraph)">
                This course already has{" "}
                <strong className="text-(--text-title)">
                  {existingSectionCount} section
                  {existingSectionCount === 1 ? "" : "s"}
                </strong>
                , and there is no record here of an earlier AI outline (a
                different browser, or storage was cleared). What should happen to
                them?
              </p>
              {(
                [
                  {
                    value: "append" as const,
                    label: "Leave them, add these after",
                    hint: "Nothing existing changes.",
                  },
                  {
                    value: "update" as const,
                    label: `Overwrite the first ${Math.min(existingSectionCount, selected.length)} in place`,
                    hint: "Titles and summaries are replaced in current order — this can hit sections you wrote by hand. Lessons inside them are kept and nothing is deleted.",
                  },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-start gap-2.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="outline-apply-mode"
                    checked={mode === opt.value}
                    onChange={() => setMode(opt.value)}
                    className="mt-1 w-4 h-4 shrink-0 cursor-pointer accent-(--primary-600)"
                  />
                  <span>
                    <span className="text-(--text-title) font-medium">
                      {opt.label}
                    </span>
                    <span className="block text-[12px] text-(--gray-500)">
                      {opt.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {generating ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-(--gray-500)">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating a new outline…
            </div>
          ) : (
            rows.map((row, index) => {
              const isOpen = expanded === row.key;
              return (
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
                        patch(row.key, { included: e.target.checked })
                      }
                      aria-label={`Include module ${index + 1}`}
                      className="mt-3.5 w-4 h-4 shrink-0 cursor-pointer accent-(--primary-600)"
                    />

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-(--gray-400) shrink-0">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) =>
                            patch(row.key, { title: e.target.value })
                          }
                          className="w-full h-10 px-3 text-[14px] font-medium border border-(--gray-200) rounded-lg bg-(--gray-50) text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                        />
                      </div>

                      <textarea
                        value={row.summary}
                        onChange={(e) =>
                          patch(row.key, { summary: e.target.value })
                        }
                        rows={2}
                        className="w-full px-3 py-2 text-[13px] border border-(--gray-200) rounded-lg bg-(--gray-50) text-(--text-paragraph) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                      />

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[12px] text-(--gray-500) flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {row.estimated_duration_minutes} min
                        </span>
                        <button
                          onClick={() => setExpanded(isOpen ? null : row.key)}
                          className="text-[12px] text-(--primary-600) hover:text-(--primary-700) cursor-pointer transition-colors flex items-center gap-1"
                        >
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                          {row.learning_outcomes.length} outcomes ·{" "}
                          {row.topics.length} topics
                        </button>
                      </div>

                      {/* Planned content items. Each ticked one becomes a real
                          but empty row — the instructor adds the video, the
                          questions, the script. Untick anything unwanted. */}
                      {row.content_plan.length > 0 && (
                        <div className="pt-1 space-y-1.5">
                          <p className="text-[12px] font-semibold text-(--text-title)">
                            Lessons to create
                          </p>
                          {row.content_plan.map((item, itemIndex) => {
                            const Icon = ITEM_ICON[item.item_type];
                            return (
                              <label
                                key={itemIndex}
                                title={item.description}
                                className={`flex items-start gap-2 cursor-pointer rounded-lg border px-2.5 py-1.5 transition-colors ${
                                  item.included
                                    ? "border-(--gray-200) bg-(--gray-50)"
                                    : "border-(--gray-100) opacity-55"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={item.included}
                                  onChange={(e) =>
                                    patchItem(
                                      row.key,
                                      itemIndex,
                                      e.target.checked,
                                    )
                                  }
                                  className="mt-0.5 w-3.5 h-3.5 shrink-0 cursor-pointer accent-(--primary-600)"
                                />
                                <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-(--gray-500)" />
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[12px] text-(--text-title) truncate">
                                    {item.title}
                                  </span>
                                  <span className="block text-[11px] text-(--gray-500)">
                                    {ITEM_LABEL[item.item_type]}
                                    {item.language ? ` · ${item.language}` : ""}
                                    {" · "}
                                    {item.estimated_duration_minutes} min
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {isOpen && (
                        <div className="pt-1 space-y-2 text-[12px] text-(--gray-600)">
                          <div>
                            <p className="font-semibold text-(--text-title)">
                              Learning outcomes
                            </p>
                            <ul className="mt-1 space-y-1 list-disc pl-4">
                              {row.learning_outcomes.map((o, i) => (
                                <li key={i}>{o}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-(--text-title)">
                              Topics
                            </p>
                            <p className="mt-1">{row.topics.join(" · ")}</p>
                          </div>
                          <p className="text-(--gray-400)">
                            Outcomes and topics are guidance for authoring — a
                            section stores only a title and a summary. The
                            lessons above are created for real, but empty: you
                            add the video, questions or script afterwards.
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setRows((prev) => prev.filter((r) => r.key !== row.key))
                      }
                      aria-label={`Remove module ${index + 1}`}
                      className="mt-2.5 text-(--gray-400) hover:text-red-500 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {!generating && rows.length === 0 && (
            <p className="text-[14px] text-(--gray-500) text-center py-10">
              Every module was removed. Regenerate to start over.
            </p>
          )}

          {/* Plain-text form — what a scheduled course needs in Course Outline. */}
          {!generating && draft.outline_text && (
            <div className="border border-(--gray-200) rounded-xl">
              <button
                onClick={() => setShowText((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <span className="text-[13px] font-medium text-(--text-title)">
                  Plain-text outline
                </span>
                {showText ? (
                  <ChevronDown className="w-4 h-4 text-(--gray-400)" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-(--gray-400)" />
                )}
              </button>
              {showText && (
                <div className="px-4 pb-4 space-y-2">
                  <p className="text-[12px] text-(--gray-500)">
                    Paste this into <strong>Course Outline</strong> on the Setup
                    step — scheduled courses require it before submitting.
                  </p>
                  <textarea
                    readOnly
                    value={draft.outline_text}
                    rows={8}
                    className="w-full px-3 py-2 text-[12px] font-mono border border-(--gray-200) rounded-lg bg-(--gray-50) text-(--text-paragraph) outline-none"
                  />
                  <button
                    onClick={copyText}
                    className="text-[12px] text-(--primary-600) hover:text-(--primary-700) cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Copied" : "Copy outline"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-(--gray-100)">
          <button
            onClick={onRegenerate}
            disabled={busy}
            className="text-[14px] text-(--primary-600) font-normal hover:text-(--primary-700) cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${generating ? "animate-spin" : ""}`}
            />
            Regenerate
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={busy}
              className="px-4 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-500) hover:bg-(--gray-50) cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={apply}
              disabled={busy || selected.length === 0}
              className="px-4 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              {applyLabel()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
