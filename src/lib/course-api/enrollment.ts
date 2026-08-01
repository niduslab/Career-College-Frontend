import { apiGet, apiPost } from "../api";
import {
  type CourseLevel,
  type CourseStatus,
  type CourseBrief,
  type PaginatedResponse,
  type WithMessage,
  withMessage,
} from "./shared";
import { type CatalogCourse } from "./catalog";

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
