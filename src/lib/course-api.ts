import { apiGet, apiPost, apiPatch, apiDelete, type ApiEnvelope } from "./api";

/** An entity plus the backend's own success message, so callers can show it verbatim. */
export interface WithMessage<T> {
  data: T;
  message?: string;
}

function withMessage<T>(res: ApiEnvelope<T>): WithMessage<T> {
  return {
    data: res.data as T,
    message: typeof res.message === "string" ? res.message : undefined,
  };
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseStatus =
  | "draft"
  | "under_review"
  | "institution_review"
  | "published"
  | "rejected"
  | "archived";
export type DeliveryMode = "self_paced" | "scheduled";

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  children: CourseCategory[];
}

export interface CourseBrief {
  id: number;
  full_name: string;
  email: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: string;
  language: string;
  level: CourseLevel;
  duration_minutes: number | null;
  status: CourseStatus;
  is_published: boolean;
  rejection_reason: string;
  published_at: string | null;
  created_by: CourseBrief;
  instructors: CourseBrief[];
  partner_institution: { id: number; institution_name: string } | null;
  category: { id: number; name: string; slug: string } | null;
  learning_objectives: string;
  prerequisites: string;
  audiences: string;
  delivery_mode: DeliveryMode;
  course_outline: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCreateInput {
  title: string;
  description: string;
  category: number;
  price?: string;
  language?: string;
  level?: CourseLevel;
  duration_minutes?: number;
  learning_objectives?: string;
  prerequisites?: string;
  audiences?: string;
  thumbnail?: File | null;
  /** Immutable after creation — cannot be changed via PATCH. */
  delivery_mode?: DeliveryMode;
  /** Required before submission when delivery_mode is "scheduled". */
  course_outline?: string;
}

export type CourseUpdateInput = Partial<
  Omit<CourseCreateInput, "delivery_mode">
>;

function buildCourseFormData(
  data: CourseCreateInput | CourseUpdateInput,
): FormData {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === "thumbnail") {
      if (value instanceof File) form.append("thumbnail", value);
      return;
    }
    form.append(key, String(value));
  });
  return form;
}

/** Fetch active course categories (public, no auth required). */
export async function getCourseCategories(): Promise<CourseCategory[]> {
  const res = await apiGet<{ results: CourseCategory[] }>(
    "/courses/categories/",
  );
  const data = res.data as unknown as { results?: CourseCategory[] };
  return data?.results ?? [];
}

/** Create a new course. Uses multipart/form-data only when a thumbnail file is present. */
export async function createCourse(
  input: CourseCreateInput,
): Promise<WithMessage<Course>> {
  const body = input.thumbnail
    ? buildCourseFormData(input)
    : {
        title: input.title,
        description: input.description,
        category: input.category,
        price: input.price,
        language: input.language,
        level: input.level,
        duration_minutes: input.duration_minutes,
        learning_objectives: input.learning_objectives,
        prerequisites: input.prerequisites,
        audiences: input.audiences,
      };
  const res = await apiPost<Course>("/courses/create/", body);
  return withMessage(res);
}

export async function getCourse(courseId: number): Promise<Course> {
  const res = await apiGet<Course>(`/courses/${courseId}/`);
  return res.data as Course;
}

/** Partial update. Uses multipart/form-data only when a thumbnail file is present. */
export async function updateCourse(
  courseId: number,
  input: CourseUpdateInput,
): Promise<WithMessage<Course>> {
  const body = input.thumbnail
    ? buildCourseFormData(input)
    : Object.fromEntries(
        Object.entries(input).filter(([k]) => k !== "thumbnail"),
      );
  const res = await apiPatch<Course>(`/courses/${courseId}/`, body);
  return withMessage(res);
}

// Sections

export interface CourseSection {
  id: number;
  title: string;
  description: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface SectionCreateInput {
  title: string;
  description?: string;
  position?: number;
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

export async function listSections(
  courseId: number,
): Promise<CourseSection[]> {
  const res = await apiGet<CourseSection[]>(
    `/courses/${courseId}/sections/`,
  );
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

export type SectionItemType = "lecture" | "quiz" | "coding" | "assignment";
export type LectureType = "video" | "article";

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
}

export interface SectionContentItem {
  id: number;
  section: number;
  item_type: SectionItemType;
  object_id: number;
  position: number;
  content: LectureContent | Record<string, unknown>;
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

/** Create an article lecture (JSON body). */
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

/** Create a video lecture (multipart/form-data — required for the file upload). */
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
  article_content?: string;
  is_preview?: boolean;
}

/** Partial update of an existing lecture (title / article content / preview flag). */
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

// Coding exercises

export type CodingDifficulty = "easy" | "medium" | "hard";
export type CodingLanguage = "python" | "javascript" | "cpp" | "java";

export interface CodingExercise {
  id: number;
  title: string;
  description: string;
  problem_statement: string;
  difficulty: CodingDifficulty;
  default_language: CodingLanguage;
  supported_languages: CodingLanguage[];
  time_limit_ms: number;
}

export interface CreateCodingExerciseInput {
  item_type: "coding";
  title: string;
  description?: string;
  problem_statement: string;
  difficulty: CodingDifficulty;
  default_language: CodingLanguage;
  supported_languages: CodingLanguage[];
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
  problem_statement?: string;
  difficulty?: CodingDifficulty;
  default_language?: CodingLanguage;
  supported_languages?: CodingLanguage[];
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

export interface CodingLanguageConfig {
  id: number;
  language: CodingLanguage;
  starter_code: string;
  solution_code: string;
}

export async function createCodingLanguageConfig(
  exerciseId: number,
  input: { language: CodingLanguage; starter_code: string; solution_code: string },
): Promise<WithMessage<CodingLanguageConfig>> {
  const res = await apiPost<CodingLanguageConfig>(
    `/courses/coding-exercises/${exerciseId}/language-configs/`,
    input,
  );
  return withMessage(res);
}

export async function listCodingLanguageConfigs(
  exerciseId: number,
): Promise<CodingLanguageConfig[]> {
  const res = await apiGet<CodingLanguageConfig[]>(
    `/courses/coding-exercises/${exerciseId}/language-configs/`,
  );
  return (res.data ?? []) as CodingLanguageConfig[];
}

export async function updateCodingLanguageConfig(
  exerciseId: number,
  configId: number,
  input: { starter_code?: string; solution_code?: string },
): Promise<WithMessage<CodingLanguageConfig>> {
  const res = await apiPatch<CodingLanguageConfig>(
    `/courses/coding-exercises/${exerciseId}/language-configs/${configId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteCodingLanguageConfig(
  exerciseId: number,
  configId: number,
): Promise<string | undefined> {
  return apiDelete(
    `/courses/coding-exercises/${exerciseId}/language-configs/${configId}/`,
  );
}

export interface CodingTestCase {
  id: number;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
  explanation: string;
  position: number;
}

export async function createCodingTestCase(
  exerciseId: number,
  input: {
    input_data: string;
    expected_output: string;
    is_hidden: boolean;
    explanation?: string;
    position?: number;
  },
): Promise<WithMessage<CodingTestCase>> {
  const res = await apiPost<CodingTestCase>(
    `/courses/coding-exercises/${exerciseId}/testcases/`,
    input,
  );
  return withMessage(res);
}

export async function listCodingTestCases(
  exerciseId: number,
): Promise<CodingTestCase[]> {
  const res = await apiGet<CodingTestCase[]>(
    `/courses/coding-exercises/${exerciseId}/testcases/`,
  );
  return (res.data ?? []) as CodingTestCase[];
}

export async function updateCodingTestCase(
  exerciseId: number,
  tcId: number,
  input: {
    input_data?: string;
    expected_output?: string;
    is_hidden?: boolean;
    explanation?: string;
    position?: number;
  },
): Promise<WithMessage<CodingTestCase>> {
  const res = await apiPatch<CodingTestCase>(
    `/courses/coding-exercises/${exerciseId}/testcases/${tcId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteCodingTestCase(
  exerciseId: number,
  tcId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/coding-exercises/${exerciseId}/testcases/${tcId}/`);
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

export async function getAssignment(
  assignmentId: number,
): Promise<Assignment> {
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

// Course status transitions

export interface CourseStatusResult {
  id: number;
  status: CourseStatus;
}

/** Submit a draft course for admin review. Fails with field errors if the course is incomplete. */
export async function submitCourseForReview(
  courseId: number,
): Promise<WithMessage<CourseStatusResult>> {
  const res = await apiPost<CourseStatusResult>(
    `/courses/${courseId}/submit/`,
    {},
  );
  return withMessage(res);
}

/** Move a rejected course back to draft so it can be edited and resubmitted. */
export async function reworkCourse(
  courseId: number,
): Promise<WithMessage<CourseStatusResult>> {
  const res = await apiPost<CourseStatusResult>(
    `/courses/${courseId}/rework/`,
    {},
  );
  return withMessage(res);
}

/** Archive a published course. */
export async function archiveCourse(
  courseId: number,
): Promise<WithMessage<CourseStatusResult>> {
  const res = await apiPost<CourseStatusResult>(
    `/courses/${courseId}/archive/`,
    {},
  );
  return withMessage(res);
}
