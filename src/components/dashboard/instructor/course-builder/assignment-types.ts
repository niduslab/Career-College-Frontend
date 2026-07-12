import type {
  AssignmentQuestion,
  RubricCriterion,
  RubricCriterionType,
} from "@/lib/course-api";

/** UI-level rubric criterion: keeps any_of/all_of values as a raw comma-separated string for editing. */
export interface UiRubricCriterion {
  type: RubricCriterionType;
  value: string;
  points: string;
  feedback_on_match: string;
  feedback_on_miss: string;
  case_sensitive: boolean;
}

/** UI-level question: the real question row plus local rubric-editing state and a saving flag. */
export interface UiAssignmentQuestion extends AssignmentQuestion {
  saving: boolean;
  rubricDraft: UiRubricCriterion[];
}

export function toUiRubricCriterion(c: RubricCriterion): UiRubricCriterion {
  return {
    type: c.type,
    value: Array.isArray(c.value) ? c.value.join(", ") : String(c.value),
    points: String(c.points),
    feedback_on_match: c.feedback_on_match ?? "",
    feedback_on_miss: c.feedback_on_miss ?? "",
    case_sensitive: c.case_sensitive ?? false,
  };
}

export function fromUiRubricCriterion(c: UiRubricCriterion): RubricCriterion {
  const base = {
    type: c.type,
    points: parseFloat(c.points) || 0,
    feedback_on_match: c.feedback_on_match || undefined,
    feedback_on_miss: c.feedback_on_miss || undefined,
    case_sensitive:
      c.type === "keyword" || c.type === "regex" ? c.case_sensitive : undefined,
  };
  if (c.type === "any_of" || c.type === "all_of") {
    return {
      ...base,
      value: c.value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }
  if (c.type === "min_length" || c.type === "max_length") {
    return { ...base, value: parseInt(c.value, 10) || 0 };
  }
  return { ...base, value: c.value };
}

export function emptyRubricCriterion(): UiRubricCriterion {
  return {
    type: "keyword",
    value: "",
    points: "0",
    feedback_on_match: "",
    feedback_on_miss: "",
    case_sensitive: false,
  };
}
