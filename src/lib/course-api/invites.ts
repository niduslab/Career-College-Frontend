import { apiGet, apiPost, apiDelete } from "../api";
import {
  type PaginatedResponse,
  type WithMessage,
  withMessage,
} from "./shared";

// Co-instructor invitations

export type InviteStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "revoked";

/** Owner-facing shape — never includes `token`. */
export interface CourseInstructorInvite {
  id: number;
  course: number;
  course_title: string;
  invited_by: number;
  invited_by_name: string;
  invited_user: number;
  invited_user_name: string;
  invited_user_email: string;
  status: InviteStatus;
  expires_at: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Invitee-facing shape — same fields plus the accept/decline `token`. */
export interface MyCourseInstructorInvite extends CourseInstructorInvite {
  token: string;
}

/** Owner sends an invite by email. Course must be draft/rejected. */
export async function sendInstructorInvite(
  courseId: number,
  email: string,
): Promise<WithMessage<CourseInstructorInvite>> {
  const res = await apiPost<CourseInstructorInvite>(
    `/courses/${courseId}/instructors/invite/`,
    { email },
  );
  return withMessage(res);
}

/** Owner-only. `status` omitted lists all invites for the course. */
export async function listInstructorInvites(
  courseId: number,
  status?: InviteStatus,
): Promise<PaginatedResponse<CourseInstructorInvite>> {
  const query = status ? `?status=${status}` : "";
  const res = await apiGet<PaginatedResponse<CourseInstructorInvite>>(
    `/courses/${courseId}/instructors/invites/${query}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Owner-only. Only a pending invite can be revoked. */
export async function revokeInstructorInvite(
  courseId: number,
  inviteId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/${courseId}/instructors/invites/${inviteId}/`);
}

/** The caller's own received invites. `status` defaults to pending on the backend. */
export async function getMyInstructorInvites(
  status?: InviteStatus,
): Promise<PaginatedResponse<MyCourseInstructorInvite>> {
  const query = status ? `?status=${status}` : "";
  const res = await apiGet<PaginatedResponse<MyCourseInstructorInvite>>(
    `/courses/invites/my/${query}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Atomically joins the course as a co-instructor. */
export async function acceptInstructorInvite(
  token: string,
): Promise<WithMessage<MyCourseInstructorInvite>> {
  const res = await apiPost<MyCourseInstructorInvite>(
    `/courses/invites/${token}/accept/`,
    {},
  );
  return withMessage(res);
}

export async function declineInstructorInvite(
  token: string,
): Promise<WithMessage<MyCourseInstructorInvite>> {
  const res = await apiPost<MyCourseInstructorInvite>(
    `/courses/invites/${token}/decline/`,
    {},
  );
  return withMessage(res);
}
