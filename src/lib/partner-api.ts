import { apiGet, apiPost, apiPatch, apiDelete } from "./api";
import type { PaginatedResponse } from "./course-api";

// ── Departments ────────────────────────────────────────────────────────────

export interface Department {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getDepartments(activeOnly = true): Promise<Department[]> {
  const res = await apiGet<PaginatedResponse<Department>>(
    `/auth/partner/departments/${activeOnly ? "" : "?active_only=false"}`,
  );
  return res.data?.results ?? [];
}

export async function createDepartment(name: string): Promise<Department> {
  const res = await apiPost<Department>("/auth/partner/departments/", {
    name,
  });
  return res.data as Department;
}

export async function renameDepartment(
  id: number,
  name: string,
): Promise<Department> {
  const res = await apiPatch<Department>(`/auth/partner/departments/${id}/`, {
    name,
  });
  return res.data as Department;
}

export async function setDepartmentActive(
  id: number,
  is_active: boolean,
): Promise<Department> {
  const res = await apiPatch<Department>(`/auth/partner/departments/${id}/`, {
    is_active,
  });
  return res.data as Department;
}

/** Soft-deactivates the department (backend never hard-deletes). */
export async function deactivateDepartment(id: number): Promise<void> {
  await apiDelete(`/auth/partner/departments/${id}/`);
}

// Experts

export type AffiliationStatus = "active" | "removed";

export interface ExpertDepartmentBrief {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Expert {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  slug: string;
  headline: string;
  bio: string;
  department: ExpertDepartmentBrief | null;
  specialization: string[];
  is_verified: boolean;
  is_email_verified: boolean;
  affiliation_status: AffiliationStatus;
  onboarding_source: string;
  affiliated_at: string;
  course_count: number;
}

export interface OnboardExpertInput {
  full_name: string;
  email: string;
  bio?: string;
  headline?: string;
  department_id?: number | null;
  specialization?: string[];
}

export async function getExperts(): Promise<PaginatedResponse<Expert>> {
  const res = await apiGet<PaginatedResponse<Expert>>("/auth/partner/experts/");
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function onboardExpert(
  input: OnboardExpertInput,
): Promise<Expert> {
  const res = await apiPost<Expert>("/auth/partner/experts/", input);
  return res.data as Expert;
}

export interface UpdateExpertInput {
  headline?: string;
  bio?: string;
  specialization?: string[];
  department_id?: number | null;
  is_active?: boolean;
}

export async function updateExpert(
  id: number,
  patch: UpdateExpertInput,
): Promise<Expert> {
  const res = await apiPatch<Expert>(`/auth/partner/experts/${id}/`, patch);
  return res.data as Expert;
}

export async function setExpertActive(
  id: number,
  active: boolean,
): Promise<Expert> {
  return updateExpert(id, { is_active: active });
}

// Course instructor roster

export async function assignCourseInstructor(
  coursePk: number,
  expertUserId: number,
): Promise<void> {
  await apiPost(`/courses/${coursePk}/institution-instructors/`, {
    expert_user_id: expertUserId,
  });
}

export async function removeCourseInstructor(
  coursePk: number,
  expertUserId: number,
): Promise<void> {
  await apiDelete(
    `/courses/${coursePk}/institution-instructors/${expertUserId}/`,
  );
}
