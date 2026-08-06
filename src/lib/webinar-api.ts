import { apiGet, apiPost, apiPatch, apiDelete, type ApiEnvelope } from "./api";
import type { CourseBrief, PaginatedResponse } from "./course-api";

export interface WithMessage<T> {
  data: T;
  message?: string;
}

function withMessage<T>(res: ApiEnvelope<T>): WithMessage<T> {
  return {
    data: res.data as T,
    message: typeof res.message === "string" ? res.message : undefined,
  };
}

export type WebinarStatus = "draft" | "published" | "archived";
export type MeetingProvider = "zoom" | "meet" | "jitsi" | "other";

export interface GuestSpeaker {
  full_name: string;
  title?: string;
  bio?: string;
}

export interface WebinarBrief {
  id: number;
  title: string;
  slug: string;
}

export interface Webinar {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  scheduled_at: string;
  timezone: string;
  duration_minutes: number;
  max_capacity: number | null;
  price: string;
  meeting_provider: MeetingProvider;
  /** Only present on the authoring detail / registrant-facing payloads — never in the catalog. */
  meeting_url?: string;
  status: WebinarStatus;
  is_published: boolean;
  published_at: string | null;
  host_expert: CourseBrief | null;
  institutional_speakers: CourseBrief[];
  guest_speakers: GuestSpeaker[];
  partner_institution: {
    id: number;
    institution_name: string;
    slug: string;
  } | null;
  category: { id: number; name: string; slug: string } | null;
  created_by: CourseBrief;
  last_edited_by: CourseBrief;
  created_at: string;
  updated_at: string;
}

export interface WebinarCreateInput {
  title: string;
  description: string;
  scheduled_at?: string;
  timezone?: string;
  duration_minutes?: number;
  max_capacity?: number | null;
  price?: string;
  meeting_provider?: MeetingProvider;
  meeting_url?: string;
  /** Full replace: omit to leave untouched, [] to clear. Values are experts' User PKs. */
  institutional_speaker_ids?: number[];
  guest_speakers?: GuestSpeaker[];
}

export type WebinarUpdateInput = Partial<WebinarCreateInput>;

/** List the caller's institution's webinars (or, for a host, webinars they're assigned to). */
export async function listWebinars(
  page = 1,
  pageSize = 10,
): Promise<PaginatedResponse<Webinar>> {
  const res = await apiGet<PaginatedResponse<Webinar>>(
    `/webinars/?page=${page}&page_size=${pageSize}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function createWebinar(
  input: WebinarCreateInput,
): Promise<WithMessage<Webinar>> {
  const res = await apiPost<Webinar>("/webinars/create/", input);
  return withMessage(res);
}

export async function getWebinar(webinarPk: number): Promise<Webinar> {
  const res = await apiGet<Webinar>(`/webinars/${webinarPk}/`);
  return res.data as Webinar;
}

/** Institution-only; only while draft/archived (422 on a published webinar). */
export async function updateWebinar(
  webinarPk: number,
  input: WebinarUpdateInput,
): Promise<WithMessage<Webinar>> {
  const res = await apiPatch<Webinar>(`/webinars/${webinarPk}/`, input);
  return withMessage(res);
}

/** Assign an active affiliated expert (by User PK) as host. */
export async function assignWebinarHost(
  webinarPk: number,
  expertUserId: number,
): Promise<WithMessage<Webinar>> {
  const res = await apiPost<Webinar>(`/webinars/${webinarPk}/host/`, {
    expert_user_id: expertUserId,
  });
  return withMessage(res);
}

/** Clear the assigned host. 422 if none is set. */
export async function clearWebinarHost(
  webinarPk: number,
): Promise<string | undefined> {
  return apiDelete(`/webinars/${webinarPk}/host/`);
}

export interface WebinarStatusResult {
  id: number;
  status: WebinarStatus;
  is_published: boolean;
}

/** Host-only (scoped to host_expert=caller) — institution attempting this gets 404. */
export async function publishWebinar(
  webinarPk: number,
): Promise<WithMessage<WebinarStatusResult>> {
  const res = await apiPost<WebinarStatusResult>(
    `/webinars/${webinarPk}/publish/`,
    {},
  );
  return withMessage(res);
}

/** Institution, host, or admin. */
export async function archiveWebinar(
  webinarPk: number,
): Promise<WithMessage<WebinarStatusResult>> {
  const res = await apiPost<WebinarStatusResult>(
    `/webinars/${webinarPk}/archive/`,
    {},
  );
  return withMessage(res);
}

/** archived -> draft, editable again. */
export async function reworkWebinar(
  webinarPk: number,
): Promise<WithMessage<WebinarStatusResult>> {
  const res = await apiPost<WebinarStatusResult>(
    `/webinars/${webinarPk}/rework/`,
    {},
  );
  return withMessage(res);
}

// Public catalog (no auth)

export interface CatalogWebinar {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  scheduled_at: string;
  timezone: string;
  duration_minutes: number;
  max_capacity: number | null;
  price: string;
  partner_institution: {
    id: number;
    institution_name: string;
    slug: string;
  } | null;
  category: { id: number; name: string; slug: string } | null;
  host_expert: CourseBrief | null;
  institutional_speakers: CourseBrief[];
  guest_speakers: GuestSpeaker[];
  published_at: string | null;
}

export async function getWebinarCatalog(
  params: {
    category?: string;
    upcoming?: boolean;
    page?: number;
    page_size?: number;
  } = {},
): Promise<PaginatedResponse<CatalogWebinar>> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.upcoming) qs.set("upcoming", "true");
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  const res = await apiGet<PaginatedResponse<CatalogWebinar>>(
    `/webinars/catalog/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function getCatalogWebinarDetail(
  slug: string,
): Promise<CatalogWebinar> {
  const res = await apiGet<CatalogWebinar>(`/webinars/catalog/${slug}/`);
  return res.data as CatalogWebinar;
}

// Learner registration

export interface WebinarRegistration {
  id: number;
  is_active: boolean;
  attended: boolean;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  webinar: Webinar;
}

/** Free webinars only — paid webinars must go through /payments/checkout/. */
export async function registerForWebinar(
  webinarSlug: string,
): Promise<WithMessage<WebinarRegistration>> {
  const res = await apiPost<WebinarRegistration>(
    `/webinars/${webinarSlug}/register/`,
    {},
  );
  return withMessage(res);
}

export async function getMyWebinars(
  page = 1,
  pageSize = 10,
): Promise<PaginatedResponse<WebinarRegistration>> {
  const res = await apiGet<PaginatedResponse<WebinarRegistration>>(
    `/webinars/my-webinars/?page=${page}&page_size=${pageSize}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}
