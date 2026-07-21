"use client";

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Info,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  UiAssignmentQuestion,
  UiRubricCriterion,
} from "./assignment-types";
import {
  toUiRubricCriterion,
  fromUiRubricCriterion,
  emptyRubricCriterion,
} from "./assignment-types";
import {
  getAssignment,
  updateAssignment,
  deleteAssignment,
  createAssignmentQuestion,
  updateAssignmentQuestion,
  deleteAssignmentQuestion,
  reorderAssignmentQuestions,
  previewRubricFromModelAnswer,
  type RubricCriterionType,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { useDebouncedSave } from "@/lib/use-debounced-save";

const CRITERION_TYPES: RubricCriterionType[] = [
  "keyword",
  "regex",
  "min_length",
  "max_length",
  "any_of",
  "all_of",
];

function criterionTypeLabel(t: RubricCriterionType): string {
  switch (t) {
    case "keyword":
      return "Keyword";
    case "regex":
      return "Regex";
    case "min_length":
      return "Min Length";
    case "max_length":
      return "Max Length";
    case "any_of":
      return "Any Of";
    case "all_of":
      return "All Of";
  }
}

function rubricTotal(rubric: UiRubricCriterion[]): number {
  return rubric.reduce((sum, c) => sum + (parseFloat(c.points) || 0), 0);
}

function CriterionTypeDropdown({
  value,
  onChange,
}: {
  value: RubricCriterionType;
  onChange: (t: RubricCriterionType) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-2.5 min-w-32 flex items-center justify-between gap-1.5 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) cursor-pointer hover:bg-(--gray-50) focus:outline-none focus:ring-2 focus:ring-(--primary-700) transition-colors"
      >
        {criterionTypeLabel(value)}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-(--gray-500) shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-(--gray-500) shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-32 bg-white border border-(--gray-200) rounded-lg shadow-lg z-50 py-1">
          {CRITERION_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                onChange(t);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-[12px] cursor-pointer transition-colors ${
                t === value
                  ? "bg-(--primary-50) text-(--primary-700) font-medium"
                  : "text-(--gray-600) hover:bg-(--gray-50)"
              }`}
            >
              {criterionTypeLabel(t)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RubricHelpTooltip() {
  return (
    <span className="relative inline-flex group align-middle">
      <button
        type="button"
        tabIndex={0}
        aria-label="How to write a rubric"
        className="text-(--primary-700) hover:text-(--primary-900) cursor-help transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      <span className="absolute left-0 top-full mt-1.5 z-50 max-h-[60vh] w-96 overflow-y-auto overscroll-contain rounded-lg border border-(--gray-200) bg-white p-3.5 text-left text-[11px] leading-relaxed text-(--gray-600) shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity">
        <span className="block font-semibold text-(--text-title) mb-1">
          How grading works
        </span>
        Assignments are graded automatically — no manual marking. The rubric is
        the answer key: a list of checks run against each learner&apos;s answer.
        Each check that matches awards its points; the learner&apos;s score is
        the sum, capped at the question&apos;s points.

        <span className="mt-2 block font-semibold text-(--text-title)">
          Building the rubric
        </span>
        Break the Model Answer into its key ideas, add one criterion per idea,
        and give each a share of the points. The criteria points must add up to
        the question&apos;s points before you can save.

        <span className="mt-2 block font-semibold text-(--text-title)">
          Criterion types
        </span>
        <span className="mt-0.5 block space-y-0.5">
          <span className="block">
            <span className="font-medium text-(--text-title)">Keyword</span> —
            answer contains this exact word/phrase.
          </span>
          <span className="block">
            <span className="font-medium text-(--text-title)">Any Of</span> —
            answer contains at least one word from a list (good for synonyms).
          </span>
          <span className="block">
            <span className="font-medium text-(--text-title)">All Of</span> —
            answer contains every word in the list.
          </span>
          <span className="block">
            <span className="font-medium text-(--text-title)">
              Min / Max Length
            </span>{" "}
            — answer is at least / at most N characters.
          </span>
          <span className="block">
            <span className="font-medium text-(--text-title)">Regex</span> —
            answer matches a pattern (advanced).
          </span>
        </span>
        <span className="mt-1 block text-(--gray-500)">
          Prefer <span className="font-medium">Any Of</span> /{" "}
          <span className="font-medium">All Of</span> over a single{" "}
          <span className="font-medium">Keyword</span> so paraphrases and
          synonyms still match.
        </span>

        <span className="mt-2 block font-semibold text-(--text-title)">
          Generate from Model Answer
        </span>
        The button pulls the most significant words from your Model Answer and
        splits them into All Of groups for you. It leaves the points at 0 — you
        set them. Review and edit the groups, then Save.

        <span className="mt-2 block font-semibold text-(--text-title)">
          Example — question worth 2 pts
        </span>
        <span className="block mt-0.5 italic">
          Model Answer: &ldquo;Django middleware is a plugin that intercepts the
          request/response cycle.&rdquo;
        </span>
        <span className="mt-1.5 block rounded-md bg-(--gray-50) p-2 font-mono text-[10.5px] text-(--text-title)">
          All Of [request, response] → 1 pt
          <br />
          Any Of [middleware, plugin, hook] → 1 pt
        </span>
        <span className="mt-1.5 block text-(--gray-500)">
          Keep it coarse when points are low: grade only the ideas that
          separate a right answer from a wrong one.
        </span>
      </span>
    </span>
  );
}

function QuestionCard({
  question,
  index,
  onUpdateField,
  onUpdatePointsBlur,
  onDeleteQuestion,
  onRubricDraftChange,
  onSaveRubric,
  savingRubric,
}: {
  question: UiAssignmentQuestion;
  index: number;
  onUpdateField: (
    field: "question_text" | "model_answer" | "hint",
    value: string,
  ) => void;
  onUpdatePointsBlur: (value: string) => void;
  onDeleteQuestion: () => void;
  onRubricDraftChange: (rubric: UiRubricCriterion[]) => void;
  onSaveRubric: () => void;
  savingRubric: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });
  const [pointsInput, setPointsInput] = useState(String(question.points));
  const [generating, setGenerating] = useState(false);

  const total = rubricTotal(question.rubricDraft);
  const rubricMismatch = total !== question.points;

  // Ask the backend to build a keyword rubric from the model answer, then load
  // it into the local draft so the instructor can review/edit before saving.
  // This is the visible twin of the server-side Option B fallback: saving a
  // question with a model answer but no rubric generates the same criteria.
  const generateFromModelAnswer = async () => {
    if (!question.model_answer.trim()) {
      notify.error("Write a Model Answer first to generate a rubric.");
      return;
    }
    setGenerating(true);
    try {
      const rubric = await previewRubricFromModelAnswer({
        model_answer: question.model_answer,
        points: question.points,
      });
      if (rubric.length === 0) {
        notify.error(
          "Could not extract keywords from the Model Answer. Add criteria manually.",
        );
        return;
      }
      onRubricDraftChange(rubric.map(toUiRubricCriterion));
      notify.success(
        `Generated ${rubric.length} criteria. Now assign points to each (must sum to ${question.points}), then Save Rubric Changes.`,
      );
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to generate rubric.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const setCriterion = (idx: number, patch: Partial<UiRubricCriterion>) => {
    onRubricDraftChange(
      question.rubricDraft.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    );
  };

  const addCriterion = () => {
    onRubricDraftChange([...question.rubricDraft, emptyRubricCriterion()]);
  };

  const removeCriterion = (idx: number) => {
    onRubricDraftChange(question.rubricDraft.filter((_, i) => i !== idx));
  };

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
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-(--gray-100) bg-(--gray-50) rounded-t-xl">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical className="w-4 h-4 text-(--gray-400)" />
        </button>
        <div className="w-6 h-6 rounded-full bg-(--primary-700) text-white text-[12px] font-bold flex items-center justify-center shrink-0">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onDeleteQuestion}
          className="p-1 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-normal text-(--text-title)">
            Question Text
          </label>
          <textarea
            value={question.question_text}
            onChange={(e) => onUpdateField("question_text", e.target.value)}
            rows={2}
            placeholder="Write the question..."
            className="w-full px-3 py-2 mt-1 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-normal text-(--text-title)">
            Model Answer
          </label>
          <textarea
            value={question.model_answer}
            onChange={(e) => onUpdateField("model_answer", e.target.value)}
            rows={2}
            placeholder="Write the ideal answer..."
            className="w-full px-3 py-2 mt-1 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-normal text-(--text-title)">
              Points
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={pointsInput}
              onChange={(e) => setPointsInput(e.target.value)}
              onBlur={() => onUpdatePointsBlur(pointsInput)}
              className="w-full h-10 px-3 text-[13px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-normal text-(--text-title)">
              Hint
            </label>
            <input
              type="text"
              value={question.hint}
              onChange={(e) => onUpdateField("hint", e.target.value)}
              placeholder="Optional hint"
              className="w-full h-10 px-3 text-[13px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>
        </div>

        {/* Rubric */}
        <div className="border border-(--gray-200) rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-(--text-title)">
              Rubric Criteria
              <RubricHelpTooltip />
            </span>
            <span
              className={`text-[12px] font-medium ${
                rubricMismatch ? "text-red-500" : "text-(--gray-500)"
              }`}
            >
              Rubric total: {total} / {question.points} points
            </span>
          </div>

          {question.rubricDraft.length === 0 ? (
            <p className="text-[12px] text-(--gray-500)">
              No criteria yet. Add one manually, or click{" "}
              <span className="font-medium text-(--primary-700)">
                Generate from Model Answer
              </span>{" "}
              below. If you leave this empty, the Model Answer&apos;s keywords
              are split into <span className="font-medium">All Of</span> groups
              (points divided across them) when the question is saved.
            </p>
          ) : (
            <div className="space-y-3">
              {question.rubricDraft.map((c, idx) => (
                <div
                  key={idx}
                  className="border border-(--gray-100) rounded-lg p-3 space-y-2 bg-(--gray-50)"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <CriterionTypeDropdown
                      value={c.type}
                      onChange={(t) => setCriterion(idx, { type: t })}
                    />

                    {c.type === "min_length" || c.type === "max_length" ? (
                      <input
                        type="number"
                        min="0"
                        value={c.value}
                        onChange={(e) =>
                          setCriterion(idx, { value: e.target.value })
                        }
                        placeholder="Length"
                        className="h-9 px-2 w-24 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700)"
                      />
                    ) : c.type === "any_of" || c.type === "all_of" ? (
                      <input
                        type="text"
                        value={c.value}
                        onChange={(e) =>
                          setCriterion(idx, { value: e.target.value })
                        }
                        placeholder="comma, separated, values"
                        className="h-9 px-2 flex-1 min-w-35 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700)"
                      />
                    ) : (
                      <input
                        type="text"
                        value={c.value}
                        onChange={(e) =>
                          setCriterion(idx, { value: e.target.value })
                        }
                        placeholder={c.type === "regex" ? "Pattern" : "Keyword"}
                        className="h-9 px-2 flex-1 min-w-35 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700)"
                      />
                    )}

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={c.points}
                      onChange={(e) =>
                        setCriterion(idx, { points: e.target.value })
                      }
                      placeholder="Points"
                      className="h-9 px-2 w-20 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700)"
                    />

                    {(c.type === "keyword" || c.type === "regex") && (
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={c.case_sensitive}
                          onChange={(e) =>
                            setCriterion(idx, {
                              case_sensitive: e.target.checked,
                            })
                          }
                          className="w-3.5 h-3.5 rounded border-(--gray-300) accent-(--primary-700) cursor-pointer"
                        />
                        <span className="text-[12px] text-(--text-title)">
                          Case sensitive
                        </span>
                      </label>
                    )}

                    <button
                      type="button"
                      onClick={() => removeCriterion(idx)}
                      className="ml-auto text-(--gray-400) hover:text-red-500 cursor-pointer transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={c.feedback_on_match}
                      onChange={(e) =>
                        setCriterion(idx, { feedback_on_match: e.target.value })
                      }
                      placeholder="Feedback on match"
                      className="h-9 px-2 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700)"
                    />
                    <input
                      type="text"
                      value={c.feedback_on_miss}
                      onChange={(e) =>
                        setCriterion(idx, { feedback_on_miss: e.target.value })
                      }
                      placeholder="Feedback on miss"
                      className="h-9 px-2 text-[12px] border border-(--gray-200) rounded-md bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700)"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={addCriterion}
                className="flex items-center gap-1.5 text-[12px] font-medium text-(--primary-700) hover:text-(--primary-900) cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Criterion
              </button>
              <button
                type="button"
                onClick={generateFromModelAnswer}
                disabled={generating}
                title="Split the Model Answer's keywords into All Of groups"
                className="flex items-center gap-1.5 text-[12px] font-medium text-(--primary-700) hover:text-(--primary-900) cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generate from Model Answer
              </button>
            </div>
            <button
              type="button"
              onClick={onSaveRubric}
              disabled={savingRubric || rubricMismatch}
              className="flex items-center gap-2 px-3 h-8 text-[12px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingRubric && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Rubric Changes
            </button>
          </div>
          {rubricMismatch && (
            <p className="text-[12px] text-red-500">
              Rubric points must sum to exactly {question.points} before saving.
            </p>
          )}
          <div className="space-y-1 rounded-md bg-(--gray-50) p-2.5 text-[11px] leading-relaxed text-(--gray-500)">
            <p className="font-medium text-(--gray-600)">Good to know</p>
            <p>
              •{" "}
              <span className="font-medium">Rubric is not autosaved.</span>{" "}
              Click <span className="font-medium">Save Rubric Changes</span> to
              keep your edits — the question is recreated on the backend when
              you do. (Question text, Model Answer, points, and hint autosave on
              their own.)
            </p>
            <p>
              • <span className="font-medium">Leave the rubric empty</span> and
              the backend builds one for you on save: it takes the key words
              from your Model Answer, splits them into All Of groups, and
              divides the question&apos;s points evenly across the groups.
            </p>
            <p>
              • A question with{" "}
              <span className="font-medium">
                no rubric and no Model Answer
              </span>{" "}
              can&apos;t be graded, so every answer scores 0. Add a rubric or a
              Model Answer to grade it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssignmentBuilder({
  assignmentId,
  onDone,
  onDelete,
  onClose,
}: {
  assignmentId: number;
  onDone: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [totalScore, setTotalScore] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [questions, setQuestions] = useState<UiAssignmentQuestion[]>([]);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(false);
  const [savingRubricId, setSavingRubricId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const debounceSave = useDebouncedSave();

  const passingScoreError =
    passingScore !== "" &&
    totalScore !== "" &&
    parseFloat(passingScore) > parseFloat(totalScore);

  // Live sum of every question's points (local, always current — unlike the
  // backend-provided maxScore, which isn't refreshed on each points edit).
  const questionPointsSum = questions.reduce((sum, q) => sum + q.points, 0);

  // Done is only valid when the question points add up to the declared Total
  // Score, so the assignment can actually award its full worth.
  const handleDone = () => {
    if (passingScoreError) {
      notify.error("Passing score cannot exceed total score.");
      return;
    }
    const total = parseFloat(totalScore);
    if (totalScore === "" || Number.isNaN(total)) {
      notify.error("Set a Total Score before finishing.");
      return;
    }
    if (questionPointsSum !== total) {
      notify.error(
        `Question points add up to ${questionPointsSum}, but Total Score is ${total}. Make them match before finishing.`,
      );
      return;
    }
    onDone();
  };

  useEffect(() => {
    let active = true;
    getAssignment(assignmentId)
      .then((assignment) => {
        if (!active) return;
        setTitle(assignment.title);
        setDescription(assignment.description ?? "");
        setInstructions(assignment.instructions ?? "");
        setTotalScore(String(assignment.total_score));
        setPassingScore(String(assignment.passing_score));
        setQuestions(
          assignment.questions.map((q) => ({
            ...q,
            saving: false,
            rubricDraft: q.rubric.map(toUiRubricCriterion),
          })),
        );
      })
      .catch((err) => {
        if (!active) return;
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load assignment.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [assignmentId]);

  const handleTitleBlur = async () => {
    if (!title.trim()) return;
    try {
      await updateAssignment(assignmentId, { title: title.trim() });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update title.",
      );
    }
  };

  const handleDescriptionBlur = async () => {
    try {
      await updateAssignment(assignmentId, { description });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update description.",
      );
    }
  };

  const handleInstructionsBlur = async () => {
    try {
      await updateAssignment(assignmentId, { instructions });
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update instructions.",
      );
    }
  };

  const handleScoresBlur = async () => {
    if (passingScoreError || totalScore === "" || passingScore === "") return;
    try {
      await updateAssignment(assignmentId, {
        total_score: parseFloat(totalScore),
        passing_score: parseFloat(passingScore),
      });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update scores.",
      );
    }
  };

  const addQuestion = async () => {
    setAddingQuestion(true);
    try {
      const { data: question } = await createAssignmentQuestion(
        assignmentId,
        {
          question_text: "New question",
          model_answer: "",
          points: 0,
          hint: "",
          rubric: [],
        },
      );
      setQuestions((prev) => [
        ...prev,
        { ...question, saving: false, rubricDraft: [] },
      ]);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to add question.",
      );
    } finally {
      setAddingQuestion(false);
    }
  };

  const updateQuestionField = (
    questionId: number,
    field: "question_text" | "model_answer" | "hint",
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)),
    );
    if (field === "question_text" && !value.trim()) return;
    debounceSave(`question-${questionId}-${field}`, async () => {
      try {
        const { data } = await updateAssignmentQuestion(questionId, {
          [field]: value,
        });
        // The backend auto-generates a keyword rubric from the model answer
        // when the saved rubric is empty. Surface it in the draft — but only
        // when the local draft is still empty, so we never clobber unsaved
        // criteria the instructor is editing (mirrors the server precondition).
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId &&
            q.rubricDraft.length === 0 &&
            data.rubric.length > 0
              ? { ...q, rubricDraft: data.rubric.map(toUiRubricCriterion) }
              : q,
          ),
        );
      } catch (err) {
        notify.error(
          err instanceof ApiError ? err.message : "Failed to save question.",
        );
      }
    });
  };

  const updateQuestionPoints = async (questionId: number, value: string) => {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, points: parsed } : q)),
    );
    try {
      const { data } = await updateAssignmentQuestion(questionId, {
        points: parsed,
      });
      // Changing points re-distributes the auto-generated rubric server-side
      // (when the saved rubric is empty). Adopt the fresh points + rubric so
      // the criteria and the "total / points" indicator stay in sync — but
      // don't overwrite an unsaved manual draft the instructor is editing.
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                points: data.points,
                rubricDraft:
                  q.rubricDraft.length === 0 && data.rubric.length > 0
                    ? data.rubric.map(toUiRubricCriterion)
                    : q.rubricDraft,
              }
            : q,
        ),
      );
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save points.",
      );
    }
  };

  const updateRubricDraft = (
    questionId: number,
    rubric: UiRubricCriterion[],
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, rubricDraft: rubric } : q,
      ),
    );
  };

  const saveRubric = async (questionId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    const total = rubricTotal(question.rubricDraft);
    if (total !== question.points) {
      notify.error(
        `Rubric points (${total}) must equal question points (${question.points}).`,
      );
      return;
    }
    setSavingRubricId(questionId);
    try {
      await deleteAssignmentQuestion(questionId);
      const { data: created, message } = await createAssignmentQuestion(
        assignmentId,
        {
          question_text: question.question_text,
          model_answer: question.model_answer,
          points: question.points,
          hint: question.hint,
          rubric: question.rubricDraft.map(fromUiRubricCriterion),
        },
      );
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...created,
                saving: false,
                rubricDraft: created.rubric.map(toUiRubricCriterion),
              }
            : q,
        ),
      );
      notify.success(message ?? "Rubric saved.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save rubric.",
      );
    } finally {
      setSavingRubricId(null);
    }
  };

  const removeQuestion = async (questionId: number) => {
    try {
      const message = await deleteAssignmentQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      notify.success(message ?? "Question deleted.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete question.",
      );
    }
  };

  const handleDeleteAssignment = async () => {
    setDeletingAssignment(true);
    try {
      const message = await deleteAssignment(assignmentId);
      notify.success(message ?? "Assignment deleted.");
      onDelete();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete assignment.",
      );
    } finally {
      setDeletingAssignment(false);
    }
  };

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = questions.findIndex((q) => q.id === active.id);
    const newIdx = questions.findIndex((q) => q.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(questions, oldIdx, newIdx);
    setQuestions(reordered);
    reorderAssignmentQuestions(
      assignmentId,
      reordered.map((q) => q.id),
    ).catch((err) => {
      setQuestions(questions);
      notify.error(
        err instanceof ApiError ? err.message : "Failed to reorder questions.",
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            Assignment Builder
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
            Loading assignment…
          </div>
        ) : (
          <div className="overflow-y-auto px-6 py-5 pb-6 space-y-5 flex-1">
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Lesson Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Enter assignment title"
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                rows={3}
                placeholder="Write assignment description"
                className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                onBlur={handleInstructionsBlur}
                rows={4}
                placeholder="Write step-by-step instructions for the assignment"
                className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Total Score{" "}
                  <span
                    className={`text-[12px] font-normal ${
                      totalScore !== "" &&
                      questionPointsSum !== parseFloat(totalScore)
                        ? "text-red-500"
                        : "text-(--gray-400)"
                    }`}
                  >
                    (sum of question points: {questionPointsSum})
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalScore}
                  onChange={(e) => setTotalScore(e.target.value)}
                  onBlur={handleScoresBlur}
                  placeholder="e.g. 100"
                  className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Passing Score
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  onBlur={handleScoresBlur}
                  placeholder="e.g. 70"
                  className={`w-full h-12 px-3 text-[14px] mt-1 border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow ${
                    passingScoreError
                      ? "border-red-400 focus:ring-red-400"
                      : "border-(--gray-200) focus:ring-(--primary-700)"
                  }`}
                />
                {passingScoreError && (
                  <p className="text-[12px] text-red-500 mt-1">
                    Passing score must be ≤ total score ({totalScore})
                  </p>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-2">
              <label className="text-[14px] font-normal text-(--text-title)">
                Questions
              </label>
              {questions.length === 0 ? (
                <div className="w-full mt-1 rounded-lg border border-dashed border-(--gray-200) bg-(--gray-50) flex items-center justify-center gap-2 py-5">
                  <p className="text-[13px] text-(--gray-500)">
                    No questions yet.
                  </p>
                </div>
              ) : (
                <div className="mt-1 space-y-3">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleQuestionDragEnd}
                  >
                    <SortableContext
                      items={questions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {questions.map((q, idx) => (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          index={idx}
                          onUpdateField={(field, value) =>
                            updateQuestionField(q.id, field, value)
                          }
                          onUpdatePointsBlur={(value) =>
                            updateQuestionPoints(q.id, value)
                          }
                          onDeleteQuestion={() => removeQuestion(q.id)}
                          onRubricDraftChange={(rubric) =>
                            updateRubricDraft(q.id, rubric)
                          }
                          onSaveRubric={() => saveRubric(q.id)}
                          savingRubric={savingRubricId === q.id}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )}
              <button
                type="button"
                onClick={addQuestion}
                disabled={addingQuestion}
                className="flex items-center gap-2 px-5 h-10 bg-(--primary-700) hover:bg-(--primary-900) text-white text-[14px] font-semibold rounded-md cursor-pointer transition-colors disabled:opacity-60"
              >
                {addingQuestion ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Question
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-(--gray-200) bg-(--gray-100) rounded-b-2xl">
          <button
            onClick={handleDeleteAssignment}
            disabled={deletingAssignment}
            className="flex items-center gap-2 text-[14px] font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors self-start sm:self-auto order-last sm:order-first disabled:opacity-60"
          >
            {deletingAssignment ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deletingAssignment ? "Deleting…" : "Delete Assignment"}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDone}
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
