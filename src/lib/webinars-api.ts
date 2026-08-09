import { apiGet, apiPost } from "./api";
import type { CourseBrief, PaginatedResponse } from "./course-api";

export interface WebinarInstitutionBrief {
  id: number;
  institution_name: string;
}

/**
 * Public catalog shape.
 *
 * Deliberately carries no `meeting_url` — the join link is registrant-only,
 * and no registered-attendee count either, so `max_capacity` cannot be turned
 * into a "spots left" figure.
 */
export interface WebinarSummary {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  scheduled_at: string;
  timezone: string;
  duration_minutes: number | null;
  max_capacity: number | null;
  price: string;
  partner_institution: WebinarInstitutionBrief | null;
  category: { id: number; name: string; slug: string } | null;
  host_expert: CourseBrief | null;
}

export interface GuestSpeaker {
  full_name: string;
  title?: string;
  bio?: string;
}

export interface WebinarDetail extends WebinarSummary {
  description: string;
  institutional_speakers: CourseBrief[];
  guest_speakers: GuestSpeaker[];
  published_at: string | null;
}

/** Registrant-facing webinar — this one DOES carry the join link. */
export interface RegistrantWebinar {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  scheduled_at: string;
  timezone: string;
  duration_minutes: number | null;
  price: string;
  meeting_provider: string;
  meeting_url: string;
  partner_institution: WebinarInstitutionBrief | null;
  category: { id: number; name: string; slug: string } | null;
  host_expert: CourseBrief | null;
  guest_speakers: GuestSpeaker[];
}

export interface WebinarRegistration {
  id: number;
  webinar: RegistrantWebinar;
  is_active: boolean;
  attended: boolean;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebinarCatalogParams {
  search?: string;
  page?: number;
  page_size?: number;
}

/** Public webinar catalog. */
export async function getWebinarCatalog(
  params: WebinarCatalogParams = {},
): Promise<PaginatedResponse<WebinarSummary>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  const res = await apiGet<PaginatedResponse<WebinarSummary>>(
    `/webinars/catalog/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function getWebinarDetail(slug: string): Promise<WebinarDetail> {
  const res = await apiGet<WebinarDetail>(`/webinars/catalog/${slug}/`);
  return res.data as WebinarDetail;
}

/** The caller's own registrations — the only place `meeting_url` is exposed. */
export async function getMyWebinars(): Promise<
  PaginatedResponse<WebinarRegistration>
> {
  const res = await apiGet<PaginatedResponse<WebinarRegistration>>(
    "/webinars/my-webinars/",
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Register for a free webinar. Paid webinars go through payment checkout. */
export async function registerForWebinar(
  slug: string,
): Promise<WebinarRegistration> {
  const res = await apiPost<WebinarRegistration>(
    `/webinars/${slug}/register/`,
    {},
  );
  return res.data as WebinarRegistration;
}
