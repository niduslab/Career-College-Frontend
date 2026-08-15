import { apiGet, apiPost, apiPatch, apiDelete } from "../api";
import { type CourseBrief, type WithMessage, withMessage } from "./shared";

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
