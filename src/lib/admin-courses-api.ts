import { apiGet, apiPost, type ApiEnvelope } from "./api";
import type { PaginatedResult } from "./admin-console-api";

export type CourseStatus =
  | "draft"
  | "institution_review"
  | "under_review"
  | "published"
  | "rejected"
  | "archived";

export type DeliveryMode = "self_paced" | "scheduled";

interface Brief {
  id: number;
  full_name: string;
  email: string;
}

interface CategoryBrief {
  id: number;
  name: string;
  slug: string;
}

interface InstitutionBrief {
  id: number;
  institution_name: string;
  slug: string;
}

export interface AdminCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: string;
  language: string;
  level: string;
  duration_minutes: number;
  delivery_mode: DeliveryMode;
  status: CourseStatus;
  is_published: boolean;
  rejection_reason: string;
  published_at: string | null;
  created_by: Brief | null;
  instructors: Brief[];
  partner_institution: InstitutionBrief | null;
  category: CategoryBrief | null;
  learning_objectives: string;
  prerequisites: string;
  audiences: string;
  course_outline: string;
  created_at: string;
  updated_at: string;
}

export interface CourseScheduleBrief {
  id: number;
  cohort_label: string;
  timezone: string;
  enrollment_opens_at: string | null;
  enrollment_closes_at: string | null;
  start_date: string | null;
  end_date: string | null;
  max_seats: number | null;
  status: string;
}

export interface OutlineStats {
  total_sections: number;
  sections_with_content: number;
  empty_section_titles: string[];
}

export interface AdminCourseDetail extends AdminCourse {
  schedules: CourseScheduleBrief[];
  outline_stats: OutlineStats;
}

interface AdminVideoAsset {
  id: number;
  video_file: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  duration_seconds: number | null;
  master_playlist: string | null;
  renditions: unknown[];
  is_active: boolean;
  status: string;
}

export interface AdminLecture {
  id: number;
  section_id: number;
  title: string;
  lecture_type: "video" | "article";
  article_content: string;
  is_preview: boolean;
  stream_master_playlist: string | null;
  stream_renditions: unknown[];
  transcoding_error: string;
  active_video_asset: AdminVideoAsset | null;
}

export interface AdminQuizAnswer {
  id: number;
  answer_text: string;
  is_correct: boolean;
}

export interface AdminQuizQuestion {
  id: number;
  question_text: string;
  position: number;
  answers: AdminQuizAnswer[];
}

export interface AdminQuiz {
  id: number;
  title: string;
  description: string;
  questions: AdminQuizQuestion[];
}

export interface AdminCodingExercise {
  id: number;
  section_id: number;
  title: string;
  description: string;
  language: string;
  starter_code: string;
  solution_code: string;
  evaluation_script: string;
  time_limit_ms: number;
}

export interface AdminAssignmentQuestion {
  id: number;
  question_text: string;
  model_answer: string;
  rubric: unknown[];
  points: number;
  hint: string;
  position: number;
}

export interface AdminAssignment {
  id: number;
  title: string;
  description: string;
  instructions: string;
  total_score: number;
  passing_score: number;
  max_score: number;
  questions: AdminAssignmentQuestion[];
}

export interface AdminSectionContent {
  id: number;
  item_type: "lecture" | "quiz" | "assignment" | "coding";
  position: number;
  lecture?: AdminLecture | null;
  quiz?: AdminQuiz | null;
  coding_exercise?: AdminCodingExercise | null;
  assignment?: AdminAssignment | null;
}

export interface AdminCourseSection {
  id: number;
  title: string;
  description: string;
  position: number;
  unlocks_at: string | null;
  contents: AdminSectionContent[];
}

export interface AdminCourseCurriculum {
  sections: AdminCourseSection[];
}

export interface ListPendingReviewParams {
  delivery_mode?: DeliveryMode;
  page?: number;
  page_size?: number;
}

function buildQuery(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export async function listPendingReviewCourses(
  params: ListPendingReviewParams = {},
): Promise<PaginatedResult<AdminCourse>> {
  const res = (await apiGet(
    `/courses/admin/pending-review/${buildQuery({ ...params })}`,
  )) as ApiEnvelope<PaginatedResult<AdminCourse>>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function getCourseReviewDetail(id: number): Promise<AdminCourseDetail> {
  const res = (await apiGet(`/courses/${id}/review/`)) as ApiEnvelope<AdminCourseDetail>;
  if (!res.data) throw new Error("Course not found.");
  return res.data;
}

export async function getCourseAdminCurriculum(id: number): Promise<AdminCourseCurriculum> {
  const res = (await apiGet(
    `/courses/${id}/review/curriculum/`,
  )) as ApiEnvelope<AdminCourseCurriculum>;
  return res.data ?? { sections: [] };
}

export async function reviewCourse(
  id: number,
  action: "approve" | "reject",
  rejectionReason?: string,
): Promise<AdminCourse> {
  const res = await apiPost<AdminCourse>(`/courses/${id}/review/`, {
    action,
    ...(rejectionReason ? { rejection_reason: rejectionReason } : {}),
  });
  return res.data as AdminCourse;
}

export async function archiveCourse(id: number): Promise<AdminCourse> {
  const res = await apiPost<AdminCourse>(`/courses/${id}/archive/`, {});
  return res.data as AdminCourse;
}

export async function restoreCourse(id: number): Promise<AdminCourse> {
  const res = await apiPost<AdminCourse>(`/courses/${id}/restore/`, {});
  return res.data as AdminCourse;
}
