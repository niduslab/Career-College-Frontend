import { apiPost } from "../api";
import { type CourseStatus, type WithMessage, withMessage } from "./shared";

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

/**
 * Institution forwards a course out of `institution_review` — either onward
 * to the admin (`under_review`) or back to the expert (`rejected`, requires
 * `rejectionReason`). Institution-owned courses only.
 */
export async function institutionReviewCourse(
  courseId: number,
  action: "submit" | "send_back",
  rejectionReason?: string,
): Promise<WithMessage<CourseStatusResult>> {
  const res = await apiPost<CourseStatusResult>(
    `/courses/${courseId}/institution-review/`,
    action === "send_back"
      ? { action, rejection_reason: rejectionReason }
      : { action },
  );
  return withMessage(res);
}
