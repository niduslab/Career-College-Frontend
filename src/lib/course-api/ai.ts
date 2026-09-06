import { apiPost } from "../api";
import { type CodingLanguage, type CourseLevel } from "./shared";

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

// --------------------------------------------------------------------------
// Article lectures
// --------------------------------------------------------------------------

/** Languages the AI service will tag a code sample with. Only used as a
 *  `language-*` class on the rendered `<code>` element. */
export type ArticleCodeLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "java"
  | "cpp"
  | "csharp"
  | "go"
  | "rust"
  | "php"
  | "ruby"
  | "sql"
  | "bash"
  | "html"
  | "css"
  | "json"
  | "yaml"
  | "text";

export interface ArticleCode {
  language: ArticleCodeLanguage;
  caption: string;
  code: string;
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets: string[];
  /** Null unless `include_code_examples` was set on the request. */
  code: ArticleCode | null;
}

export interface ArticleLectureDraft {
  /** Opening paragraph — what the lesson covers. */
  summary: string;
  sections: ArticleSection[];
  /** "Key takeaways", in the article's own language. */
  takeaways_heading: string;
  key_takeaways: string[];
  /** The same content as HTML, using only the tags the rich-text editor
   *  parses. This is what goes into `article_content`; the structured fields
   *  above are for preview and are never saved. */
  article_html: string;
  word_count: number;
  estimated_reading_minutes: number;
}

export interface ArticleLectureGenerateInput {
  /** The lesson's own title — the only required field. */
  lecture_title: string;
  course_title?: string;
  section_title?: string;
  /** What the lesson should cover, in the instructor's words. */
  description?: string;
  /** Points the article must cover, one per entry. At most 12. */
  key_points?: string[];
  audience?: string;
  level?: CourseLevel | "";
  language?: string;
  /** Target *reading* time in minutes; a hint, not a constraint. */
  target_duration_minutes?: number | null;
  /** Off by default — a code block in a non-programming lesson is worse than
   *  none, and the model volunteers them freely. */
  include_code_examples?: boolean;
  /** Optional free-text steer, e.g. "open with a worked example". */
  extra_instructions?: string;
}

/** Draft the body of one article lecture.
 *
 *  Nothing is saved. The returned `article_html` is loaded into the editor for
 *  the instructor to read and edit; it only reaches the lecture when they save
 *  it through the normal `updateLecture` PATCH.
 */
export async function generateArticleLecture(
  input: ArticleLectureGenerateInput,
): Promise<ArticleLectureDraft> {
  const res = await apiPost<ArticleLectureDraft>(
    "/courses/ai/article-lecture-preview/",
    {
      ...input,
      description: toPlainText(input.description ?? ""),
    },
  );
  return res.data as ArticleLectureDraft;
}

// --------------------------------------------------------------------------
// Coding exercises
// --------------------------------------------------------------------------

/** How much the learner has to work out. */
export type ExerciseDifficulty = "intro" | "core" | "challenge";

export interface CodingExerciseDraft {
  description: string;
  starter_code: string;
  solution_code: string;
  evaluation_script: string;
  /** One plain-English line per test, in the script's order. Preview only. */
  test_names: string[];
  language: CodingLanguage;
  difficulty: ExerciseDifficulty;
  /** False when the module has no written lecture content. */
  grounded: boolean;
}

export interface CodingExerciseGenerateInput {
  /** The exercise to write. Its language, title and the module's lecture text
   *  are all resolved from this id server-side. */
  exercise_id: number;
  difficulty?: ExerciseDifficulty;
  /** Optional steer, e.g. "binary search". */
  topic_hint?: string;
  /** Other exercises in the module, so a regenerate is a different problem. */
  avoid_titles?: string[];
  extra_instructions?: string;
}

/** Draft one coding exercise.
 *
 *  Nothing is saved and nothing is executed by this call. The caller runs the
 *  draft through `runInstructorCodingExercise` before the instructor accepts it.
 */
export async function generateCodingExercise(
  input: CodingExerciseGenerateInput,
): Promise<CodingExerciseDraft> {
  const res = await apiPost<CodingExerciseDraft>(
    "/courses/ai/coding-exercise-preview/",
    input,
  );
  return res.data as CodingExerciseDraft;
}
