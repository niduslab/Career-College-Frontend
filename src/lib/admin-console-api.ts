import { apiGet, apiPost, type ApiEnvelope } from "./api";

export type AdminUserType = "learner" | "instructor" | "partner_institution" | "admin";

export type InstitutionType =
  | "university"
  | "college"
  | "training_center"
  | "corporate"
  | "nonprofit"
  | "other";

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  name_slug: string;
  user_type: AdminUserType;
  is_email_verified: boolean;
  is_verified: boolean;
  is_active: boolean;
  is_restricted_by_admin: boolean;
  is_deleted: boolean;
  is_staff: boolean;
  registration_date: string;
  /** Only set for user_type='partner_institution' accounts; null otherwise. */
  institution_name: string | null;
  institution_type: InstitutionType | null;
}

/** Full account detail — adds soft-delete + timestamp fields over the list row. */
export interface AdminUserDetail extends AdminUser {
  deleted_at: string | null;
  deletion_reason: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListAdminUsersParams {
  search?: string;
  user_type?: AdminUserType | "";
  institution_type?: InstitutionType | "";
  is_active?: boolean;
  is_restricted_by_admin?: boolean;
  is_verified?: boolean;
  is_email_verified?: boolean;
  include_deleted?: boolean;
  sort?:
    | "registration_date"
    | "-registration_date"
    | "email"
    | "-email"
    | "full_name"
    | "-full_name";
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

export async function listAdminUsers(
  params: ListAdminUsersParams = {},
): Promise<PaginatedResult<AdminUser>> {
  const res = (await apiGet(
    `/admin-console/users/${buildQuery({ ...params })}`,
  )) as ApiEnvelope<PaginatedResult<AdminUser>>;
  return (
    res.data ?? { count: 0, next: null, previous: null, results: [] }
  );
}

/** Cheap count-only lookup — reuses the list endpoint with page_size=1 and reads `.count`. */
export async function countAdminUsers(
  params: ListAdminUsersParams = {},
): Promise<number> {
  const result = await listAdminUsers({ ...params, page: 1, page_size: 1 });
  return result.count;
}

const EXPORT_PAGE_SIZE = 100;
const EXPORT_MAX_ROWS = 5000;

/**
 * Fetch every user matching the given filters, paging through the list
 * endpoint (page_size capped at 100 by StandardResultsSetPagination). Stops
 * at EXPORT_MAX_ROWS as a safety cap for very large result sets.
 */
export async function listAllAdminUsers(
  params: ListAdminUsersParams = {},
): Promise<AdminUser[]> {
  const all: AdminUser[] = [];
  let page = 1;
  for (;;) {
    const result = await listAdminUsers({ ...params, page, page_size: EXPORT_PAGE_SIZE });
    all.push(...result.results);
    if (!result.next || all.length >= EXPORT_MAX_ROWS || result.results.length === 0) break;
    page += 1;
  }
  return all;
}

export async function getAdminUser(id: number): Promise<AdminUserDetail> {
  const res = await apiGet<AdminUserDetail>(`/admin-console/users/${id}/`);
  return res.data as AdminUserDetail;
}

export async function suspendUser(id: number, reason = ""): Promise<AdminUser> {
  const res = await apiPost<AdminUser>(`/admin-console/users/${id}/suspend/`, {
    reason,
  });
  return res.data as AdminUser;
}

export async function reactivateUser(id: number): Promise<AdminUser> {
  const res = await apiPost<AdminUser>(
    `/admin-console/users/${id}/reactivate/`,
    {},
  );
  return res.data as AdminUser;
}

export async function changeUserRole(
  id: number,
  args: { user_type?: AdminUserType; is_staff?: boolean },
): Promise<AdminUser> {
  const res = await apiPost<AdminUser>(`/admin-console/users/${id}/role/`, args);
  return res.data as AdminUser;
}

export type AdminActionType = "suspend" | "reactivate" | "role_change";

export interface AdminActionActor {
  id: number;
  full_name: string;
  email: string;
}

export interface AdminActionLogEntry {
  id: number;
  action: AdminActionType;
  actor: AdminActionActor | null;
  target_user: AdminActionActor | null;
  reason: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ListAuditLogParams {
  target_user_id?: number;
  actor_id?: number;
  action?: AdminActionType;
  page?: number;
  page_size?: number;
}

export async function listAuditLog(
  params: ListAuditLogParams = {},
): Promise<PaginatedResult<AdminActionLogEntry>> {
  const res = (await apiGet(
    `/admin-console/audit/${buildQuery({ ...params })}`,
  )) as ApiEnvelope<PaginatedResult<AdminActionLogEntry>>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}
