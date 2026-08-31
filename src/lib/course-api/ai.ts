import { apiPost } from "../api";
import { type CourseLevel } from "./shared";

// AI-assisted authoring. Stateless helpers: the backend returns a draft and
// persists nothing, so the instructor edits it before anything is saved.
// Sibling of `previewRubricFromModelAnswer` in ./authoring.

/** The four content types a section can hold. Mirrors the AI service's
 *  `ContentItemType` literal and the backend's `SectionContent.ItemType`. */
export type PlannedItemType = "lecture" | "quiz" | "assignment" | "coding";

/** One content item the AI suggests for a module.
 *
 *  Applying the outline turns each kept item into a real but *empty* row — a
 *  lecture with no video, a quiz with no questions, a coding exercise with no
 *  evaluation script. Every one of those blocks course submission until the
 *  instructor fills it in.
 */
export interface PlannedItem {
  item_type: PlannedItemType;
  title: string;
  description: string;
  estimated_duration_minutes: number;
  /** Coding exercises only; null for every other type. */
  language: "python" | "javascript" | "cpp" | "java" | null;
}

export interface OutlineModule {
  title: string;
  summary: string;
  learning_outcomes: string[];
  topics: string[];
  estimated_duration_minutes: number;
  /** Suggested content items for this module, in the order a learner meets them. */
  content_plan: PlannedItem[];
}

export interface CourseOutlineDraft {
  /** Structured modules — one card per module in the preview UI. */
  modules: OutlineModule[];
  /** The same content flattened to plain text, ready for `course_outline`. */
  outline_text: string;
}

export interface CourseOutlineGenerateInput {
  title: string;
  description: string;
  audience: string;
  prerequisites?: string;
  level?: CourseLevel | "";
  language?: string;
  duration_minutes?: number | null;
  category?: string;
  /** Optional free-text steer, e.g. "focus on hands-on labs". */
  extra_instructions?: string;
}

/** Strip HTML down to its text.
 *
 *  The builder's course description comes out of the rich-text editor as HTML.
 *  Sending `<p>` markup into a prompt wastes tokens and degrades the result,
 *  so tags are dropped and entities decoded before the request goes out.
 */
export function toPlainText(html: string): string {
  if (!html) return "";
  if (typeof document !== "undefined") {
    const el = document.createElement("div");
    el.innerHTML = html;
    return (el.textContent ?? "").replace(/\s+/g, " ").trim();
  }
  // SSR fallback — no DOM available.
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Generate a course-outline suggestion. Nothing is saved — the caller decides
 *  whether to turn the modules into sections or keep the text. */
export async function generateCourseOutline(
  input: CourseOutlineGenerateInput,
): Promise<CourseOutlineDraft> {
  const res = await apiPost<CourseOutlineDraft>(
    "/courses/ai/outline-preview/",
    {
      ...input,
      description: toPlainText(input.description),
    },
  );
  return res.data as CourseOutlineDraft;
}
