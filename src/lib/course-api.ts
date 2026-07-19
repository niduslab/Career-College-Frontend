import { apiGet, apiPost, apiPatch, apiDelete, type ApiEnvelope } from "./api";
import { config } from "./config";

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
  delivery_mode?: DeliveryMode;
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

/** Fetch active course categories (public, no auth required). Follows
 *  pagination so every category is returned, not just the first page. */
export async function getCourseCategories(): Promise<CourseCategory[]> {
  const all: CourseCategory[] = [];
  let path: string | null = "/courses/categories/";
  while (path) {
    const res = await apiGet<{
      results: CourseCategory[];
      next: string | null;
    }>(path);
    const data = res.data as unknown as {
      results?: CourseCategory[];
      next?: string | null;
    };
    all.push(...(data?.results ?? []));
    // `next` is an absolute URL from DRF; reduce it to a path relative to the
    // API base so apiGet can re-prepend the base. Null = no more pages.
    const next = data?.next ?? null;
    if (next) {
      const nextUrl = new URL(next);
      const basePath = new URL(config.apiBaseUrl).pathname;
      path = nextUrl.pathname.replace(basePath, "") + nextUrl.search;
    } else {
      path = null;
    }
  }
  return all;
}

// Public catalog

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** A course as returned by the public catalog (list view). */
export interface CatalogCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: string;
  language: string;
  level: CourseLevel;
  duration_minutes: number | null;
  instructors: CourseBrief[];
  category: { id: number; name: string; slug: string } | null;
  published_at: string | null;
}

/** Extra fields present only on the single-course catalog detail endpoint. */
export interface CatalogCourseDetail extends CatalogCourse {
  partner_institution: { id: number; institution_name: string } | null;
  learning_objectives: string;
  prerequisites: string;
  audiences: string;
  total_sections: number;
  total_content_items: number;
}

export type CatalogSort =
  | "relevance"
  | "newest"
  | "popularity"
  | "price_asc"
  | "price_desc"
  | "rating";

export interface CatalogFilterParams {
  category?: string;
  subcategory?: string;
  level?: CourseLevel[];
  language?: string[];
  price_type?: "free" | "paid";
  price_min?: number;
  price_max?: number;
  duration_min?: number;
  duration_max?: number;
  search?: string;
  rating_min?: number;
  min_reviews?: number;
  sort?: CatalogSort;
  page?: number;
  page_size?: number;
}

function buildCatalogQuery(params: CatalogFilterParams): string {
  const qs = new URLSearchParams();
  const setCsv = (key: string, values?: string[]) => {
    if (values && values.length > 0) qs.set(key, values.join(","));
  };
  if (params.category) qs.set("category", params.category);
  if (params.subcategory) qs.set("subcategory", params.subcategory);
  setCsv("level", params.level);
  setCsv("language", params.language);
  if (params.price_type) qs.set("price_type", params.price_type);
  if (params.price_min !== undefined)
    qs.set("price_min", String(params.price_min));
  if (params.price_max !== undefined)
    qs.set("price_max", String(params.price_max));
  if (params.duration_min !== undefined)
    qs.set("duration_min", String(params.duration_min));
  if (params.duration_max !== undefined)
    qs.set("duration_max", String(params.duration_max));
  if (params.search) qs.set("search", params.search);
  if (params.rating_min !== undefined)
    qs.set("rating_min", String(params.rating_min));
  if (params.min_reviews !== undefined)
    qs.set("min_reviews", String(params.min_reviews));
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/** Browse the public course catalog (no auth required). */
export async function getCourseCatalog(
  params: CatalogFilterParams = {},
): Promise<PaginatedResponse<CatalogCourse>> {
  const res = await apiGet<PaginatedResponse<CatalogCourse>>(
    `/courses/catalog/${buildCatalogQuery(params)}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Fetch a single published course's public catalog detail (no auth required). */
export async function getCatalogCourseDetail(
  slug: string,
): Promise<CatalogCourseDetail> {
  const res = await apiGet<CatalogCourseDetail>(`/courses/catalog/${slug}/`);
  return res.data as CatalogCourseDetail;
}

// Enrollment

export type EnrollmentType = "free" | "paid";

export interface Enrollment {
  id: number;
  course: CatalogCourse;
  enrollment_type: EnrollmentType;
  is_active: boolean;
  progress_percent: number;
  completed_at: string | null;
  last_accessed_at: string | null;
  created_at: string;
}

/** Enroll in a free course.*/
export async function enrollInCourse(
  courseSlug: string,
): Promise<WithMessage<Enrollment>> {
  const res = await apiPost<Enrollment>(`/courses/${courseSlug}/enroll/`, {});
  return withMessage(res);
}

/** Deactivate the caller's enrollment; progress is preserved for re-enrollment. */
export async function unenrollFromCourse(
  courseSlug: string,
): Promise<WithMessage<Enrollment>> {
  const res = await apiPost<Enrollment>(`/courses/${courseSlug}/unenroll/`, {});
  return withMessage(res);
}

/** List the caller's own active enrollments, most recently accessed first. */
export async function getMyCourses(): Promise<PaginatedResponse<Enrollment>> {
  const res = await apiGet<PaginatedResponse<Enrollment>>(
    "/courses/my-courses/",
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Slim enrollment summary embedded in the my-course detail payload. */
export interface MyCourseEnrollment {
  id: number;
  enrollment_type: EnrollmentType;
  is_active: boolean;
  progress_percent: number;
  completed_at: string | null;
  last_accessed_at: string | null;
  created_at: string;
}

/** Full course metadata as returned by the my-course detail (player header) endpoint. */
export interface MyCourseDetailCourse {
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
  published_at: string | null;
  instructors: CourseBrief[];
  partner_institution: { id: number; institution_name: string } | null;
  category: { id: number; name: string; slug: string } | null;
  learning_objectives: string;
  prerequisites: string;
  audiences: string;
  total_sections: number;
  total_content_items: number;
}

export interface MyCourseDetail {
  is_instructor: boolean;
  enrollment: MyCourseEnrollment | null;
  course: MyCourseDetailCourse;
}

/**
 * Player-header detail for one course — enrolled learner OR the course's own
 * instructor (preview, `enrollment: null`). Each call bumps the learner's
 * `last_accessed_at`. No curriculum tree here — see `/learn/{slug}/curriculum/`.
 */
export async function getMyCourseDetail(
  courseSlug: string,
): Promise<MyCourseDetail> {
  const res = await apiGet<MyCourseDetail>(
    `/courses/my-courses/${courseSlug}/`,
  );
  return res.data as MyCourseDetail;
}

// Learner consumption — curriculum outline

export type CurriculumItemType = "lecture" | "quiz" | "coding" | "assignment";

export interface CurriculumItem {
  content_id: number;
  object_id: number;
  item_type: CurriculumItemType;
  position: number;
  title: string;
  /** Only present when item_type === "lecture". */
  lecture_type?: LectureType;
  duration_seconds?: number | null;
  /** Only present when item_type === "coding". */
  language?: CodingLanguage;
  /** Absent for instructor preview. */
  is_completed?: boolean;
}

export interface CurriculumSection {
  id: number;
  title: string;
  position: number;
  is_locked: boolean;
  unlocks_at: string | null;
  items: CurriculumItem[];
}

export interface LearnerCurriculum {
  course: { id: number; slug: string; title: string };
  sections: CurriculumSection[];
}

export async function getLearnerCurriculum(
  courseSlug: string,
): Promise<LearnerCurriculum> {
  const res = await apiGet<LearnerCurriculum>(
    `/courses/learn/${courseSlug}/curriculum/`,
  );
  return res.data as LearnerCurriculum;
}

export interface WatchProgress {
  watched_seconds: number;
  is_completed: boolean;
  last_watched_at: string | null;
}

export interface StreamRendition {
  name: string;
  playlist: string;
  bandwidth: number;
  resolution: string;
}

export interface LearnerLecture {
  id: number;
  section_id: number;
  title: string;
  lecture_type: LectureType;
  article_content: string;
  stream_master_playlist: string;
  stream_renditions: StreamRendition[];
  duration_seconds: number | null;
  /** null for the instructor-preview caller. */
  progress: WatchProgress | null;
}

export async function getLearnerLecture(
  lectureId: number,
): Promise<LearnerLecture> {
  const res = await apiGet<LearnerLecture>(
    `/courses/learn/lectures/${lectureId}/`,
  );
  return res.data as LearnerLecture;
}

export function hlsAssetUrl(path: string): string {
  const origin = config.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return `${origin}/media/${path}`;
}

export interface WatchProgressInput {
  watched_seconds: number;
  is_completed: boolean;
}

export interface WatchProgressResult {
  lecture_id: number;
  watched_seconds: number;
  is_completed: boolean;
  last_watched_at: string;
}

export async function saveWatchProgress(
  lectureId: number,
  input: WatchProgressInput,
): Promise<WithMessage<WatchProgressResult>> {
  const res = await apiPost<WatchProgressResult>(
    `/courses/learn/lectures/${lectureId}/progress/`,
    input,
  );
  return withMessage(res);
}

export interface LearnerQuizAnswerOption {
  id: number;
  answer_text: string;
}

export interface LearnerQuizQuestion {
  id: number;
  question_text: string;
  position: number;
  answers: LearnerQuizAnswerOption[];
}

export interface LatestQuizAttempt {
  attempt_id: number;
  score: number;
  max_score: number;
  submitted_at: string;
}

export interface LearnerQuiz {
  id: number;
  section_id: number;
  title: string;
  description: string;
  question_count: number;
  questions: LearnerQuizQuestion[];
  latest_attempt: LatestQuizAttempt | null;
}

export async function getLearnerQuiz(quizId: number): Promise<LearnerQuiz> {
  const res = await apiGet<LearnerQuiz>(`/courses/learn/quizzes/${quizId}/`);
  return res.data as LearnerQuiz;
}

export interface QuizAnswerInput {
  question_id: number;
  selected_answer_id: number | null;
}

export interface QuizSubmitInput {
  answers: QuizAnswerInput[];
}

export interface QuizQuestionResult {
  question_id: number;
  question_text: string;
  selected_answer_id: number | null;
  selected_answer_text: string | null;
  is_correct: boolean;
  /** Present only when is_correct === false. */
  correct_answer_id?: number;
  correct_answer_text?: string;
}

export interface QuizSubmitResult {
  attempt_id: number;
  score: number;
  max_score: number;
  submitted_at: string;
  questions: QuizQuestionResult[];
}

export async function submitQuizAttempt(
  quizId: number,
  input: QuizSubmitInput,
): Promise<WithMessage<QuizSubmitResult>> {
  const res = await apiPost<QuizSubmitResult>(
    `/courses/learn/quizzes/${quizId}/submit/`,
    input,
  );
  return withMessage(res);
}

export type AssignmentSubmissionStatus =
  | "submitted"
  | "grading"
  | "passed"
  | "failed"
  | "grading_failed";

export interface LearnerAssignmentQuestion {
  id: number;
  question_text: string;
  points: number;
  hint: string;
  position: number;
}

export interface LatestAssignmentSubmission {
  submission_id: number;
  status: AssignmentSubmissionStatus;
  total_score: number;
  max_score: number;
  submitted_at: string;
}

export interface LearnerAssignment {
  id: number;
  section_id: number;
  title: string;
  description: string;
  instructions: string;
  passing_score: number;
  max_score: number;
  question_count: number;
  questions: LearnerAssignmentQuestion[];
  latest_submission: LatestAssignmentSubmission | null;
}

export async function getLearnerAssignment(
  assignmentId: number,
): Promise<LearnerAssignment> {
  const res = await apiGet<LearnerAssignment>(
    `/courses/learn/assignments/${assignmentId}/`,
  );
  return res.data as LearnerAssignment;
}

export interface AssignmentAnswerInput {
  question_id: number;
  answer_text: string;
}

export interface AssignmentSubmitInput {
  answers: AssignmentAnswerInput[];
}

export interface AssignmentSubmitResult {
  submission_id: number;
  assignment_id: number;
  status: AssignmentSubmissionStatus;
  submitted_at: string;
  max_score: number;
}

export async function submitAssignment(
  assignmentId: number,
  input: AssignmentSubmitInput,
): Promise<WithMessage<AssignmentSubmitResult>> {
  const res = await apiPost<AssignmentSubmitResult>(
    `/courses/learn/assignments/${assignmentId}/submit/`,
    input,
  );
  return withMessage(res);
}

export interface AssignmentCriterionResult {
  index: number;
  type: string;
  matched: boolean;
  points_awarded: number;
  feedback: string;
}

export interface AssignmentAnswerResult {
  question_id: number;
  question_text: string;
  answer_text: string;
  score: number;
  max_score: number;
  criterion_results: AssignmentCriterionResult[];
  feedback: string;
  model_answer?: string;
}

export interface AssignmentSubmission {
  submission_id: number;
  assignment_id: number;
  status: AssignmentSubmissionStatus;
  total_score: number;
  max_score: number;
  submitted_at: string;
  graded_at: string | null;
  grading_error: string;
  answers: AssignmentAnswerResult[];
}

export async function getAssignmentSubmission(
  submissionId: number,
): Promise<AssignmentSubmission> {
  const res = await apiGet<AssignmentSubmission>(
    `/courses/learn/assignments/submissions/${submissionId}/`,
  );
  return res.data as AssignmentSubmission;
}

export interface AssignmentRetryResult {
  submission_id: number;
  status: AssignmentSubmissionStatus;
}

export async function retryAssignmentGrading(
  submissionId: number,
): Promise<WithMessage<AssignmentRetryResult>> {
  const res = await apiPost<AssignmentRetryResult>(
    `/courses/learn/assignments/submissions/${submissionId}/retry/`,
    {},
  );
  return withMessage(res);
}

export type CodingSubmissionStatus =
  | "queued"
  | "grading"
  | "passed"
  | "failed"
  | "error";

export interface LatestCodingSubmission {
  id: number;
  status: CodingSubmissionStatus;
  score: string;
  submitted_at: string;
}

export interface LearnerCodingExercise {
  id: number;
  section_id: number;
  title: string;
  /** The problem text (states the function contract to implement). */
  description: string;
  language: CodingLanguage;
  starter_code: string;
  time_limit_ms: number;
  latest_submission: LatestCodingSubmission | null;
}

export async function getLearnerCodingExercise(
  exerciseId: number,
): Promise<LearnerCodingExercise> {
  const res = await apiGet<LearnerCodingExercise>(
    `/courses/learn/coding-exercises/${exerciseId}/`,
  );
  return res.data as LearnerCodingExercise;
}

export interface CodingRunInput {
  language: CodingLanguage;
  code: string;
}

export interface CodingRunDispatch {
  task_id: string;
}

export async function runCodingExercise(
  exerciseId: number,
  input: CodingRunInput,
): Promise<WithMessage<CodingRunDispatch>> {
  const res = await apiPost<CodingRunDispatch>(
    `/courses/learn/coding-exercises/${exerciseId}/run/`,
    input,
  );
  return withMessage(res);
}

export type CeleryTaskState = "PENDING" | "STARTED" | "SUCCESS" | "FAILURE";

export interface CodingTestResult {
  position: number;
  /** Name reported by the evaluation script (e.g. "evaluate.AddTests.test_small"). */
  test_name: string;
  status: "passed" | "failed" | "error";
  stdout: string;
  /** Assertion failure message / traceback — the learner-facing feedback. */
  stderr: string;
  runtime_ms: number;
  exit_code: number;
}

export interface CodingRunResult {
  exercise_id: number;
  language: CodingLanguage;
  status: "passed" | "failed" | "error";
  total_tests: number;
  passed_tests: number;
  score: number;
  runtime_ms: number;
  error_message: string;
  test_results: CodingTestResult[];
}

export interface CodingTaskStatus {
  state: CeleryTaskState;
  result: CodingRunResult | null;
}

export async function getCodingTaskStatus(
  taskId: string,
): Promise<CodingTaskStatus> {
  const res = await apiGet<CodingTaskStatus>(
    `/courses/learn/coding-exercises/tasks/${taskId}/`,
  );
  return res.data as CodingTaskStatus;
}

export interface CodingSubmissionQueued {
  id: number;
  exercise_id: number;
  language: CodingLanguage;
  code: string;
  status: CodingSubmissionStatus;
  total_tests: number;
  passed_tests: number;
  score: string;
  runtime_ms: number;
  error_message: string;
  stdout: string;
  stderr: string;
  submitted_at: string;
  completed_at: string | null;
  test_results: CodingSubmissionTestResult[];
}

export async function submitCodingExercise(
  exerciseId: number,
  input: CodingRunInput,
): Promise<WithMessage<CodingSubmissionQueued>> {
  const res = await apiPost<CodingSubmissionQueued>(
    `/courses/learn/coding-exercises/${exerciseId}/submit/`,
    input,
  );
  return withMessage(res);
}

export interface CodingSubmissionTestResult {
  id: number;
  position: number;
  test_name: string;
  status: "passed" | "failed" | "error";
  runtime_ms: number;
  exit_code: number;
  stdout: string;
  stderr: string;
}

export interface CodingSubmission {
  id: number;
  exercise_id: number;
  language: CodingLanguage;
  status: CodingSubmissionStatus;
  total_tests: number;
  passed_tests: number;
  score: string;
  runtime_ms: number;
  error_message: string;
  stdout: string;
  stderr: string;
  submitted_at: string;
  completed_at: string | null;
  test_results: CodingSubmissionTestResult[];
}

export async function getCodingSubmission(
  submissionId: number,
): Promise<CodingSubmission> {
  const res = await apiGet<CodingSubmission>(
    `/courses/learn/coding-exercises/submissions/${submissionId}/`,
  );
  return res.data as CodingSubmission;
}

export interface CodingRetryResult {
  submission_id: number;
  status: CodingSubmissionStatus;
}

export async function retryCodingSubmission(
  submissionId: number,
): Promise<WithMessage<CodingRetryResult>> {
  const res = await apiPost<CodingRetryResult>(
    `/courses/learn/coding-exercises/submissions/${submissionId}/retry/`,
    {},
  );
  return withMessage(res);
}

/** Create a new course. Uses multipart/form-data only when a thumbnail file is present. */
/** List courses where the caller is the owner or an assigned instructor. */
export async function listCourses(
  page = 1,
  pageSize = 8,
): Promise<PaginatedResponse<Course>> {
  const res = await apiGet<PaginatedResponse<Course>>(
    `/courses/?page=${page}&page_size=${pageSize}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

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
        delivery_mode: input.delivery_mode,
        course_outline: input.course_outline,
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

// Coding exercises (single-language, script-evaluated)

export type CodingLanguage = "python" | "javascript" | "cpp" | "java";

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

// Course schedules (cohorts) — only valid on delivery_mode: "scheduled" courses.

export type ScheduleStatus =
  | "draft"
  | "scheduled"
  | "ongoing"
  | "completed"
  | "archived";

export interface CourseSchedule {
  id: number;
  course: number;
  cohort_label: string;
  timezone: string;
  enrollment_opens_at: string;
  enrollment_closes_at: string;
  start_date: string;
  end_date: string | null;
  max_seats: number | null;
  status: ScheduleStatus;
  created_by: CourseBrief;
  last_edited_by: CourseBrief;
  created_at: string;
  updated_at: string;
}

export interface ScheduleCreateInput {
  cohort_label?: string;
  timezone?: string;
  enrollment_opens_at: string;
  enrollment_closes_at: string;
  start_date: string;
  end_date?: string | null;
  max_seats?: number | null;
}

export type ScheduleUpdateInput = Partial<ScheduleCreateInput>;

/** List a course's schedules (cohorts), newest first. */
export async function listSchedules(
  courseId: number,
): Promise<CourseSchedule[]> {
  const res = await apiGet<{ results: CourseSchedule[] }>(
    `/courses/${courseId}/schedules/`,
  );
  const data = res.data as unknown as { results?: CourseSchedule[] };
  return data?.results ?? [];
}

export async function getSchedule(
  courseId: number,
  scheduleId: number,
): Promise<CourseSchedule> {
  const res = await apiGet<CourseSchedule>(
    `/courses/${courseId}/schedules/${scheduleId}/`,
  );
  return res.data as CourseSchedule;
}

export async function createSchedule(
  courseId: number,
  input: ScheduleCreateInput,
): Promise<WithMessage<CourseSchedule>> {
  const res = await apiPost<CourseSchedule>(
    `/courses/${courseId}/schedules/`,
    input,
  );
  return withMessage(res);
}

/** Editable only while the schedule is draft or scheduled. */
export async function updateSchedule(
  courseId: number,
  scheduleId: number,
  input: ScheduleUpdateInput,
): Promise<WithMessage<CourseSchedule>> {
  const res = await apiPatch<CourseSchedule>(
    `/courses/${courseId}/schedules/${scheduleId}/`,
    input,
  );
  return withMessage(res);
}

/** Deletable only while the schedule is draft. */
export async function deleteSchedule(
  courseId: number,
  scheduleId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/${courseId}/schedules/${scheduleId}/`);
}

/** draft -> scheduled. */
export async function activateSchedule(
  courseId: number,
  scheduleId: number,
): Promise<WithMessage<CourseSchedule>> {
  const res = await apiPost<CourseSchedule>(
    `/courses/${courseId}/schedules/${scheduleId}/activate/`,
    {},
  );
  return withMessage(res);
}

/** scheduled|archived -> draft. */
export async function reworkSchedule(
  courseId: number,
  scheduleId: number,
): Promise<WithMessage<CourseSchedule>> {
  const res = await apiPost<CourseSchedule>(
    `/courses/${courseId}/schedules/${scheduleId}/rework/`,
    {},
  );
  return withMessage(res);
}

/** completed -> archived. */
export async function archiveSchedule(
  courseId: number,
  scheduleId: number,
): Promise<WithMessage<CourseSchedule>> {
  const res = await apiPost<CourseSchedule>(
    `/courses/${courseId}/schedules/${scheduleId}/archive/`,
    {},
  );
  return withMessage(res);
}
