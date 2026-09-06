import { apiGet } from "./api";
import type { AdminUserType } from "./admin-console-api";

export interface AdminUserMetrics {
  total: number;
  active: number;
  email_verified: number;
  by_type: Record<AdminUserType, number>;
  /** Signups in the trailing window. */
  new_this_window: number;
  growth_pct: number | null;
}

export interface AdminCourseMetrics {
  total: number;
  published: number;
  draft: number;
  status_breakdown: Record<string, number>;
  avg_rating: number;
}

export interface AdminEnrollmentMetrics {
  total: number;
  active: number;
  completed: number;
  completion_rate: number;
  avg_progress: number;
  free: number;
  paid: number;
  new_this_window: number;
  growth_pct: number | null;
}

export interface AdminCertificateMetrics {
  total: number;
  this_month: number;
}

export interface AdminRevenueMetrics {
  enabled: boolean;
  currency: string;
  gross: number;
  paid_orders: number;
  by_item_type: { course: number; webinar: number };
  this_window: number;
  growth_pct: number | null;
}

export interface AdminAnalyticsSummary {
  users: AdminUserMetrics;
  courses: AdminCourseMetrics;
  enrollments: AdminEnrollmentMetrics;
  certificates: AdminCertificateMetrics;
  webinars: unknown;
  revenue: AdminRevenueMetrics;
}

export async function getAdminAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
  const res = await apiGet<AdminAnalyticsSummary>("/analytics/admin/summary/");
  return res.data as AdminAnalyticsSummary;
}

export type TrendGranularity = "monthly" | "weekly";

export interface CountTrendPoint {
  period: string;
  count: number;
}

export interface TrendResponse {
  granularity: TrendGranularity;
  periods: number;
  series: CountTrendPoint[];
}

export interface TrendParams {
  granularity?: TrendGranularity;
  periods?: number;
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

export async function getUserSignupTrend(params: TrendParams = {}): Promise<TrendResponse> {
  const res = await apiGet<TrendResponse>(`/analytics/admin/users/trend/${buildQuery({ ...params })}`);
  return res.data as TrendResponse;
}

export async function getEnrollmentTrend(params: TrendParams = {}): Promise<TrendResponse> {
  const res = await apiGet<TrendResponse>(`/analytics/admin/enrollments/trend/${buildQuery({ ...params })}`);
  return res.data as TrendResponse;
}

export interface ValueTrendPoint {
  period: string;
  value: number;
}

export interface ValueTrendResponse {
  granularity: TrendGranularity;
  periods: number;
  series: ValueTrendPoint[];
}

export async function getRevenueTrend(params: TrendParams = {}): Promise<ValueTrendResponse> {
  const res = await apiGet<ValueTrendResponse>(`/analytics/admin/revenue/trend/${buildQuery({ ...params })}`);
  return res.data as ValueTrendResponse;
}

export type TopCoursesSort = "enrollments" | "rating" | "completion";

export interface TopCourse {
  id: number;
  title: string;
  slug: string;
  status: string;
  enrollments: number;
  completion_rate: number;
  avg_rating: number;
  review_count: number;
}

export async function getTopCourses(
  sort: TopCoursesSort = "enrollments",
  limit = 5,
): Promise<TopCourse[]> {
  const res = await apiGet<TopCourse[]>(
    `/analytics/admin/top-courses/${buildQuery({ sort, limit })}`,
  );
  return res.data ?? [];
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  from_prev_pct?: number;
}

export interface ConversionFunnel {
  stages: FunnelStage[];
}

export async function getConversionFunnel(): Promise<ConversionFunnel> {
  const res = await apiGet<ConversionFunnel>("/analytics/admin/funnel/");
  return res.data as ConversionFunnel;
}
