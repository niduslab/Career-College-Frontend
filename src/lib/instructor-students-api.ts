import { apiGet, type ApiEnvelope } from "./api";

// Instructor student roster — see backend
// docs/architecture/30-instructor-students.md.
//
// One row = one enrollment, NOT one learner. A learner in three of the
// instructor's courses is three rows with three progress values. That is why
// `total_students` (distinct people) and `status_breakdown` (enrollment rows)
// in the summary do not sum to the same number.

export type StudentStatus =
  | "active"
  | "inactive"
  | "completed"
  | "not_started"
  | "unenrolled";

export const STUDENT_STATUSES: StudentStatus[] = [
  "active",
  "inactive",
  "completed",
  "not_started",
  "unenrolled",
];

/** Human labels for the derived status. The rule that produces it lives in the
 *  backend service (`derive_status`) — never re-derive it here. */
export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  completed: "Completed",
  not_started: "Not started",
  unenrolled: "Unenrolled",
};

export type StudentSort =
  | "-last_active"
  | "last_active"
  | "-enrolled"
  | "enrolled"
  | "-progress"
  | "progress"
  | "name";

export interface StudentRowStudent {
  id: number;
  full_name: string;
  email: string;
  /** Null when the learner never uploaded a photo — render initials instead. */
  avatar: string | null;
}

export interface StudentRowCourse {
  id: number;
  title: string;
  slug: string;
}

export interface StudentRow {
  enrollment_id: number;
  student: StudentRowStudent;
  course: StudentRowCourse;
  /** Cohort label, or null for a self-paced enrollment. */
  cohort: string | null;
  progress_percent: number;
  status: StudentStatus;
  enrollment_type: "free" | "paid" | "admin_granted";
  enrolled_at: string;
  /** Null when the learner enrolled but never opened content — render "Never". */
  last_active_at: string | null;
  completed_at: string | null;
  has_certificate: boolean;
}

export interface PaginatedStudents {
  count: number;
  next: string | null;
  previous: string | null;
  results: StudentRow[];
}

export interface InstructorCourseOption {
  id: number;
  title: string;
  slug: string;
}

export interface StudentTopCourse extends InstructorCourseOption {
  students: number;
}

export interface InstructorStudentsSummary {
  /** Distinct learners, not enrollment rows. */
  total_students: number;
  active_students: number;
  avg_progress: number;
  new_this_period: number;
  /** Null when the previous window had no enrollments — show "no prior data",
   *  never a fabricated 0%. */
  new_growth_pct: number | null;
  window_days: number;
  /** Server-owned threshold for the "inactive" status. Do not hardcode 14. */
  inactive_after_days: number;
  /** Enrollment-row counts — intentionally not equal to total_students. */
  status_breakdown: Record<StudentStatus, number>;
  top_courses: StudentTopCourse[];
  courses: InstructorCourseOption[];
}

export interface ListStudentsParams {
  /** Backend rejects fewer than 2 characters with a 400. */
  search?: string;
  course_id?: number | "";
  status?: StudentStatus | "";
  sort?: StudentSort;
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

export async function listInstructorStudents(
  params: ListStudentsParams = {},
): Promise<PaginatedStudents> {
  const res = (await apiGet(
    `/analytics/instructor/students/${buildQuery({ ...params })}`,
  )) as ApiEnvelope<PaginatedStudents>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function getInstructorStudentsSummary(): Promise<InstructorStudentsSummary> {
  const res = await apiGet<InstructorStudentsSummary>(
    "/analytics/instructor/students/summary/",
  );
  return res.data as InstructorStudentsSummary;
}
