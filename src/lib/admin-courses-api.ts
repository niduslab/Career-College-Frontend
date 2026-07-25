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
