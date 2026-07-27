import { apiGet, apiPatch, apiPost } from "./api";

export type NotificationEventType =
  | "enrollment.created"
  | "lecture.completed"
  | "course.completed"
  | "course.submitted_for_review"
  | "course.approved"
  | "course.rejected"
  | "course.archived"
  | "video.transcoding_completed"
  | "video.transcoding_failed"
  | "invite.sent"
  | "invite.accepted"
  | "invite.declined"
  | "review.received"
  | "learner.enrolled"
  | "verification.submitted"
  | "verification.approved"
  | "verification.rejected"
  | "verification.action_required"
  | "institution_verification.submitted"
  | "institution_verification.approved"
  | "institution_verification.rejected"
  | "institution_verification.action_required"
  | "expert.onboarded"
  | "course.marked_finished"
  | "course.sent_back"
  | "message.received"
  | string;

export interface NotificationItem {
  id: number;
  event_type: NotificationEventType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListParams {
  is_read?: boolean;
  event_type?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function buildQuery(params: NotificationListParams = {}): string {
  const search = new URLSearchParams();
  if (params.is_read !== undefined) search.set("is_read", String(params.is_read));
  if (params.event_type) search.set("event_type", params.event_type);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchNotifications(
  params: NotificationListParams = {},
): Promise<PaginatedResult<NotificationItem>> {
  const res = await apiGet<PaginatedResult<NotificationItem>>(
    `/notifications/${buildQuery(params)}`,
  );
  return res.data as PaginatedResult<NotificationItem>;
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiGet<{ count: number }>("/notifications/unread-count/");
  return res.data?.count ?? 0;
}

export async function markNotificationsRead(ids: number[]): Promise<void> {
  await apiPost("/notifications/mark-read/", { ids });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiPost("/notifications/mark-read/", { all: true });
}

export type NotificationCategory =
  | "course_activity"
  | "assessments"
  | "course_management"
  | "collaboration"
  | "verification"
  | "messaging";

export interface NotificationPreference {
  category: NotificationCategory;
  email_enabled: boolean;
  push_enabled: boolean;
}

export async function fetchNotificationPreferences(): Promise<
  NotificationPreference[]
> {
  const res = await apiGet<NotificationPreference[]>(
    "/notifications/preferences/",
  );
  return res.data ?? [];
}

export async function updateNotificationPreferences(
  updates: Partial<
    Record<NotificationCategory, { email_enabled?: boolean; push_enabled?: boolean }>
  >,
): Promise<NotificationPreference[]> {
  const res = await apiPatch<NotificationPreference[]>(
    "/notifications/preferences/",
    updates,
  );
  return res.data ?? [];
}
