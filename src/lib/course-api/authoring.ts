import { apiGet, apiPost, apiPatch, apiDelete } from "../api";
import {
  type SectionItemType,
  type LectureType,
  type CodingLanguage,
  type WithMessage,
  withMessage,
} from "./shared";
import { type CodingRunDispatch } from "./learner-consumption";

// Sections

export interface CourseSection {
  id: number;
  title: string;
  description: string;
  position: number;
  unlocks_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SectionCreateInput {
  title: string;
  description?: string;
  position?: number;
  unlocks_at?: string | null;
}

export async function createSection(
  courseId: number,
  input: SectionCreateInput,
): Promise<WithMessage<CourseSection>> {
  const res = await apiPost<CourseSection>(
    `/courses/${courseId}/sections/create/`,
    input,
  );
  return withMessage(res);
}

export async function listSections(courseId: number): Promise<CourseSection[]> {
  const res = await apiGet<CourseSection[]>(`/courses/${courseId}/sections/`);
  return (res.data ?? []) as CourseSection[];
}

export async function updateSection(
  sectionId: number,
  input: Partial<SectionCreateInput>,
): Promise<WithMessage<CourseSection>> {
  const res = await apiPatch<CourseSection>(
    `/courses/sections/${sectionId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteSection(
  sectionId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/sections/${sectionId}/`);
}

// Section content (lectures, quizzes, coding exercises, assignments)

export interface VideoAsset {
  id: number;
  status: "uploading" | "processing" | "ready" | "failed";
  duration_seconds: number | null;
}

export interface LectureContent {
  id: number;
  title: string;
  lecture_type: LectureType;
  article_content?: string;
  is_preview?: boolean;
  active_video_asset?: VideoAsset | null;
  /** Step 1 of two-step authoring: the lecture exists but has no payload yet.
   *  Such a lecture is hidden from learners and blocks course submission. */
  is_awaiting_content?: boolean;
}

/** Fields every content type reports in the `/contents/` list.
 *
 *  `is_awaiting_content` means the row exists but nothing has been authored in
 *  it — a lecture with no video, a quiz or assignment with no questions, a
 *  coding exercise with no code. Such a row blocks course submission, and can
 *  be replaced without losing work. */
export interface ContentItemBase {
  id: number;
  title: string;
  is_awaiting_content?: boolean;
}

export interface SectionContentItem {
  id: number;
  section: number;
  item_type: SectionItemType;
  object_id: number;
  position: number;
  content: LectureContent | ContentItemBase | Record<string, unknown>;
}

export interface CreateArticleLectureInput {
  item_type: "lecture";
  title: string;
  lecture_type: "article";
  article_content: string;
  position?: number;
  is_preview?: boolean;
}

export interface CreateVideoLectureInput {
  item_type: "lecture";
  title: string;
  lecture_type: "video";
  video_file: File;
  position?: number;
  is_preview?: boolean;
}

export interface CreateLectureInput {
  title: string;
  position?: number;
  is_preview?: boolean;
}

/**
 * Step 1 of two-step lecture authoring: create the lesson from its details
 * alone. The backend defaults it to an empty video lecture; the payload
 * arrives later via `setLectureArticle` / `uploadLectureVideo`.
 */
export async function createLecture(
  sectionId: number,
  input: CreateLectureInput,
): Promise<WithMessage<SectionContentItem>> {
  const res = await apiPost<SectionContentItem>(
    `/courses/sections/${sectionId}/contents/`,
    { item_type: "lecture", ...input },
  );
  return withMessage(res);
}

/**
 * Create an article lecture in one shot (JSON body). Still supported by the
 * backend; the builder uses the two-step flow (`createLecture` then
 * `updateLecture`) instead.
 */
export async function createArticleLecture(
  sectionId: number,
  input: Omit<CreateArticleLectureInput, "item_type" | "lecture_type">,
): Promise<WithMessage<SectionContentItem>> {
  const res = await apiPost<SectionContentItem>(
    `/courses/sections/${sectionId}/contents/`,
    { item_type: "lecture", lecture_type: "article", ...input },
  );
  return withMessage(res);
}

/** Create a video lecture and upload its file in one shot. See the note on
 *  `createArticleLecture` — the builder uses the two-step flow. */
export async function createVideoLecture(
  sectionId: number,
  input: Omit<CreateVideoLectureInput, "item_type" | "lecture_type">,
): Promise<WithMessage<SectionContentItem>> {
  const form = new FormData();
  form.append("item_type", "lecture");
  form.append("title", input.title);
  form.append("lecture_type", "video");
  form.append("video_file", input.video_file);
  if (input.position !== undefined)
    form.append("position", String(input.position));
  if (input.is_preview !== undefined)
    form.append("is_preview", String(input.is_preview));
  const res = await apiPost<SectionContentItem>(
    `/courses/sections/${sectionId}/contents/`,
    form,
  );
  return withMessage(res);
}

export async function listSectionContents(
  sectionId: number,
): Promise<SectionContentItem[]> {
  const res = await apiGet<SectionContentItem[]>(
    `/courses/sections/${sectionId}/contents/`,
  );
  return (res.data ?? []) as SectionContentItem[];
}

/** Fetch a lecture by id — used to poll video transcode status. */
export async function getLecture(lectureId: number): Promise<LectureContent> {
  const res = await apiGet<LectureContent>(`/courses/lectures/${lectureId}/`);
  return res.data as LectureContent;
}

export interface LectureUpdateInput {
  title?: string;
  /** Set on step 2 to commit the lecture to a kind. Switching to "video"
   *  clears any article body server-side. */
  lecture_type?: LectureType;
  article_content?: string;
  is_preview?: boolean;
}

/** Partial update of an existing lecture (title / type / article content / preview flag). */
export async function updateLecture(
  lectureId: number,
  input: LectureUpdateInput,
): Promise<WithMessage<LectureContent>> {
  const res = await apiPatch<LectureContent>(
    `/courses/lectures/${lectureId}/`,
    input,
  );
  return withMessage(res);
}

/**
 * Step 2, video branch: attach (or replace) the lecture's video. Multipart
 * PATCH — the backend deactivates any previous asset and enqueues transcoding,
 * so poll `getLecture` until `active_video_asset.status` is "ready".
 */
export async function uploadLectureVideo(
  lectureId: number,
  file: File,
  extra: { title?: string; is_preview?: boolean } = {},
): Promise<WithMessage<LectureContent>> {
  const form = new FormData();
  form.append("lecture_type", "video");
  form.append("video_file", file);
  if (extra.title !== undefined) form.append("title", extra.title);
  if (extra.is_preview !== undefined)
    form.append("is_preview", String(extra.is_preview));
  const res = await apiPatch<LectureContent>(
    `/courses/lectures/${lectureId}/`,
    form,
  );
  return withMessage(res);
}

export async function deleteLecture(
  lectureId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/lectures/${lectureId}/`);
}

/** Move a section-content item (lecture, quiz, coding exercise, assignment) to a new position. */
export async function reorderSectionContent(
  contentId: number,
  position: number,
): Promise<WithMessage<SectionContentItem>> {
  const res = await apiPatch<SectionContentItem>(
    `/courses/contents/${contentId}/reorder/`,
    { position },
  );
  return withMessage(res);
}

// Quizzes

export interface Quiz {
  id: number;
  title: string;
  description: string;
}

export interface CreateQuizInput {
  item_type: "quiz";
  title: string;
  description?: string;
  position?: number;
}

/** Create a quiz (section-content). */
export async function createQuiz(
  sectionId: number,
  input: Omit<CreateQuizInput, "item_type">,
): Promise<WithMessage<SectionContentItem>> {
  const res = await apiPost<SectionContentItem>(
    `/courses/sections/${sectionId}/contents/`,
    { item_type: "quiz", ...input },
  );
  return withMessage(res);
}

export interface QuizUpdateInput {
  title?: string;
  description?: string;
}

export async function updateQuiz(
  quizId: number,
  input: QuizUpdateInput,
): Promise<WithMessage<Quiz>> {
  const res = await apiPatch<Quiz>(`/courses/quizzes/${quizId}/`, input);
  return withMessage(res);
}

export async function deleteQuiz(quizId: number): Promise<string | undefined> {
  return apiDelete(`/courses/quizzes/${quizId}/`);
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  position: number;
}

export async function createQuizQuestion(
  quizId: number,
  input: { question_text: string; position?: number },
): Promise<WithMessage<QuizQuestion>> {
  const res = await apiPost<QuizQuestion>(
    `/courses/quizzes/${quizId}/questions/`,
    input,
  );
  return withMessage(res);
}

export async function listQuizQuestions(
  quizId: number,
): Promise<QuizQuestion[]> {
  const res = await apiGet<QuizQuestion[]>(
    `/courses/quizzes/${quizId}/questions/`,
  );
  return (res.data ?? []) as QuizQuestion[];
}

export async function updateQuizQuestion(
  questionId: number,
  input: { question_text?: string },
): Promise<WithMessage<QuizQuestion>> {
  const res = await apiPatch<QuizQuestion>(
    `/courses/quiz-questions/${questionId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteQuizQuestion(
  questionId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/quiz-questions/${questionId}/`);
}

export interface QuizAnswer {
  id: number;
  answer_text: string;
  is_correct: boolean;
}

export async function createQuizAnswer(
  questionId: number,
  input: { answer_text: string; is_correct: boolean },
): Promise<WithMessage<QuizAnswer>> {
  const res = await apiPost<QuizAnswer>(
    `/courses/quiz-questions/${questionId}/answers/`,
    input,
  );
  return withMessage(res);
}

export async function listQuizAnswers(
  questionId: number,
): Promise<QuizAnswer[]> {
  const res = await apiGet<QuizAnswer[]>(
    `/courses/quiz-questions/${questionId}/answers/`,
  );
  return (res.data ?? []) as QuizAnswer[];
}

export async function updateQuizAnswer(
  answerId: number,
  input: { answer_text?: string; is_correct?: boolean },
): Promise<WithMessage<QuizAnswer>> {
  const res = await apiPatch<QuizAnswer>(
    `/courses/quiz-answers/${answerId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteQuizAnswer(
  answerId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/quiz-answers/${answerId}/`);
}

// Coding exercises (single-language, script-evaluated)

export interface CodingExercise {
  id: number;
  section_id: number;
  title: string;
  /** The problem text shown to learners. */
  description: string;
  language: CodingLanguage;
  starter_code: string;
  /** Instructor-only reference implementation. */
  solution_code: string;
  /** Instructor-only test script — the grading source of truth. */
  evaluation_script: string;
  time_limit_ms: number;
}

export interface CreateCodingExerciseInput {
  item_type: "coding";
  title: string;
  description?: string;
  language: CodingLanguage;
  starter_code?: string;
  solution_code?: string;
  evaluation_script?: string;
  time_limit_ms?: number;
  position?: number;
}

/** Create a coding exercise (section-content). */
export async function createCodingExercise(
  sectionId: number,
  input: Omit<CreateCodingExerciseInput, "item_type">,
): Promise<WithMessage<SectionContentItem>> {
  const res = await apiPost<SectionContentItem>(
    `/courses/sections/${sectionId}/contents/`,
    { item_type: "coding", ...input },
  );
  return withMessage(res);
}

export async function getCodingExercise(
  exerciseId: number,
): Promise<CodingExercise> {
  const res = await apiGet<CodingExercise>(
    `/courses/coding-exercises/${exerciseId}/`,
  );
  return res.data as CodingExercise;
}

export interface CodingExerciseUpdateInput {
  title?: string;
  description?: string;
  language?: CodingLanguage;
  starter_code?: string;
  solution_code?: string;
  evaluation_script?: string;
  time_limit_ms?: number;
}

export async function updateCodingExercise(
  exerciseId: number,
  input: CodingExerciseUpdateInput,
): Promise<WithMessage<CodingExercise>> {
  const res = await apiPatch<CodingExercise>(
    `/courses/coding-exercises/${exerciseId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteCodingExercise(
  exerciseId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/coding-exercises/${exerciseId}/`);
}

// Instructor-side transient run so the exercise can be tested while
// authoring. "tests" runs code against the evaluation script; "code" runs
// the code standalone (top-level output / compile check). Omitted fields
// default to the stored solution_code / evaluation_script. Poll the returned
// task_id with getCodingTaskStatus (same endpoint as the learner run).
export type InstructorCodingRunMode = "tests" | "code";

export interface InstructorCodingRunInput {
  code?: string;
  evaluation_script?: string;
  mode?: InstructorCodingRunMode;
}

export async function runInstructorCodingExercise(
  exerciseId: number,
  input: InstructorCodingRunInput = {},
): Promise<WithMessage<CodingRunDispatch>> {
  const res = await apiPost<CodingRunDispatch>(
    `/courses/coding-exercises/${exerciseId}/run/`,
    input,
  );
  return withMessage(res);
}

// Assignments

export type RubricCriterionType =
  | "keyword"
  | "regex"
  | "min_length"
  | "max_length"
  | "any_of"
  | "all_of";

export interface RubricCriterion {
  type: RubricCriterionType;
  value: string | number | string[];
  points: number;
  feedback_on_match?: string;
  feedback_on_miss?: string;
  case_sensitive?: boolean;
}

export interface AssignmentQuestion {
  id: number;
  question_text: string;
  model_answer: string;
  points: number;
  hint: string;
  rubric: RubricCriterion[];
  position: number;
}

export interface Assignment {
  id: number;
  section_id: number;
  title: string;
  description: string;
  instructions: string;
  total_score: number;
  passing_score: number;
  max_score: number;
  questions: AssignmentQuestion[];
}

export interface CreateAssignmentInput {
  item_type: "assignment";
  title: string;
  description?: string;
  instructions?: string;
  total_score: number;
  passing_score: number;
  position?: number;
}

/** Create an assignment (section-content). */
export async function createAssignment(
  sectionId: number,
  input: Omit<CreateAssignmentInput, "item_type">,
): Promise<WithMessage<SectionContentItem>> {
  const res = await apiPost<SectionContentItem>(
    `/courses/sections/${sectionId}/contents/`,
    { item_type: "assignment", ...input },
  );
  return withMessage(res);
}

export async function getAssignment(assignmentId: number): Promise<Assignment> {
  const res = await apiGet<Assignment>(`/courses/assignments/${assignmentId}/`);
  return res.data as Assignment;
}

export interface AssignmentUpdateInput {
  title?: string;
  description?: string;
  instructions?: string;
  total_score?: number;
  passing_score?: number;
}

export async function updateAssignment(
  assignmentId: number,
  input: AssignmentUpdateInput,
): Promise<WithMessage<Assignment>> {
  const res = await apiPatch<Assignment>(
    `/courses/assignments/${assignmentId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteAssignment(
  assignmentId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/assignments/${assignmentId}/`);
}

export async function createAssignmentQuestion(
  assignmentId: number,
  input: {
    question_text: string;
    model_answer?: string;
    points: number;
    hint?: string;
    rubric?: RubricCriterion[];
  },
): Promise<WithMessage<AssignmentQuestion>> {
  const res = await apiPost<AssignmentQuestion>(
    `/courses/assignments/${assignmentId}/questions/`,
    input,
  );
  return withMessage(res);
}

/**
 * Preview the rubric that Option B auto-generation would build from a model
 * answer. Stateless — does not save anything. The builder calls this so the
 * instructor can see and edit the generated keyword criteria before saving.
 * Mirrors the backend fallback: if a question is saved with a model answer but
 * an empty rubric, the same rubric is generated server-side.
 */
export async function previewRubricFromModelAnswer(input: {
  model_answer: string;
  points: number;
  max_terms?: number;
}): Promise<RubricCriterion[]> {
  const res = await apiPost<{ rubric: RubricCriterion[] }>(
    `/courses/assignments/rubric-preview/`,
    input,
  );
  return (res.data?.rubric ?? []) as RubricCriterion[];
}

export async function listAssignmentQuestions(
  assignmentId: number,
): Promise<AssignmentQuestion[]> {
  const res = await apiGet<AssignmentQuestion[]>(
    `/courses/assignments/${assignmentId}/questions/`,
  );
  return (res.data ?? []) as AssignmentQuestion[];
}

/** Rubric is not patchable — delete and recreate the question to change it. */
export async function updateAssignmentQuestion(
  questionId: number,
  input: {
    question_text?: string;
    model_answer?: string;
    points?: number;
    hint?: string;
  },
): Promise<WithMessage<AssignmentQuestion>> {
  const res = await apiPatch<AssignmentQuestion>(
    `/courses/assignment-questions/${questionId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteAssignmentQuestion(
  questionId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/assignment-questions/${questionId}/`);
}

export async function reorderAssignmentQuestions(
  assignmentId: number,
  orderedIds: number[],
): Promise<WithMessage<AssignmentQuestion[]>> {
  const res = await apiPatch<AssignmentQuestion[]>(
    `/courses/assignments/${assignmentId}/questions/reorder/`,
    { ordered_ids: orderedIds },
  );
  return withMessage(res);
}
