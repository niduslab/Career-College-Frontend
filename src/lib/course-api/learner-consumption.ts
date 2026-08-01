import { apiGet, apiPost } from "../api";
import {
  type CurriculumItemType,
  type CodingLanguage,
  type LectureType,
  type WithMessage,
  withMessage,
} from "./shared";

// Learner consumption — curriculum outline

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
