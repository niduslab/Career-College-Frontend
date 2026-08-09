import { apiGet } from "./api";
import type { PaginatedResponse } from "./course-api";

/** Course card stub shared by every dashboard payload. */
export interface DashboardCourseRef {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
}

// Summary

/**
 * KPI tiles.
 *
 * Deliberately has no `total_xp` — there is no XP ledger to compute one from.
 * `total_learning_seconds` sums furthest-watched cursor positions, not
 * accumulated playback, and `day_streak` is derived from distinct activity
 * dates in `day_streak_timezone`; both are approximations the UI should
 * qualify rather than present as exact.
 */
export interface LearnerSummary {
  courses_enrolled: number;
  courses_in_progress: number;
  courses_completed: number;
  certificates_earned: number;
  average_progress_percent: number;
  total_learning_seconds: number;
  total_learning_hours: number;
  lectures_completed: number;
  day_streak: number;
  day_streak_is_approximate: boolean;
  day_streak_timezone: string;
}

export async function getLearnerSummary(): Promise<LearnerSummary> {
  const res = await apiGet<LearnerSummary>(
    "/courses/learner/dashboard/summary/",
  );
  return res.data as LearnerSummary;
}

// Activity feed

export type ActivityType =
  | "lecture_completed"
  | "quiz_submitted"
  | "assignment_submitted"
  | "coding_submitted"
  | "course_enrolled"
  | "certificate_earned";

/** `id` is a `"<source>:<pk>"` composite — stable React key across a
 *  heterogeneous list. `meta` shape varies by `type`. */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  occurred_at: string;
  title: string;
  course: DashboardCourseRef | null;
  meta: Record<string, unknown>;
}

export interface ActivityParams {
  type?: ActivityType[];
  page?: number;
  page_size?: number;
}

function buildActivityQuery(params: ActivityParams): string {
  const qs = new URLSearchParams();
  if (params.type && params.type.length > 0) qs.set("type", params.type.join(","));
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/** Recent-activity feed. `count` is the size of the capped 200-item window,
 *  not lifetime activity. */
export async function getLearnerActivity(
  params: ActivityParams = {},
): Promise<PaginatedResponse<ActivityItem>> {
  const res = await apiGet<PaginatedResponse<ActivityItem>>(
    `/courses/learner/activity/${buildActivityQuery(params)}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

// Upcoming

export type UpcomingType =
  | "course_starts"
  | "course_ends"
  | "section_unlocks"
  | "webinar_starts";

export interface UpcomingItem {
  type: UpcomingType;
  occurs_at: string;
  title: string;
  subtitle: string | null;
  course: DashboardCourseRef | null;
  webinar: { id: number; title: string; slug: string } | null;
  meta: Record<string, unknown>;
}

export interface UpcomingResponse {
  horizon_days: number;
  count: number;
  items: UpcomingItem[];
}

export interface UpcomingParams {
  days?: number;
  limit?: number;
}

/** Upcoming cohort, drip-release and webinar dates. Not paginated — bounded
 *  by `days` (max 365) and `limit` (max 50). */
export async function getLearnerUpcoming(
  params: UpcomingParams = {},
): Promise<UpcomingResponse> {
  const qs = new URLSearchParams();
  if (params.days !== undefined) qs.set("days", String(params.days));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  const s = qs.toString();
  const res = await apiGet<UpcomingResponse>(
    `/courses/learner/upcoming/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { horizon_days: 0, count: 0, items: [] };
}

// Continue learning

export interface NextLecture {
  lecture_id: number;
  content_id: number;
  title: string;
  lecture_type: string;
  duration_seconds: number | null;
  section: { id: number; title: string; position: number };
}

export interface ContinueLearning {
  enrollment: {
    id: number;
    progress_percent: number;
    last_accessed_at: string | null;
    completed_at: string | null;
  };
  course: DashboardCourseRef;
  /** Null when the course is finished or when everything left is still
   *  locked — `locked_until` distinguishes the two. */
  next_lecture: NextLecture | null;
  is_course_complete: boolean;
  locked_until: string | null;
}

/** Resume target. Resolves to null when the learner has no active enrollment
 *  (the endpoint returns 200 with `data: null`, not a 404). */
export async function getContinueLearning(): Promise<ContinueLearning | null> {
  const res = await apiGet<ContinueLearning | null>(
    "/courses/learner/continue/",
  );
  return (res.data as ContinueLearning | null) ?? null;
}
