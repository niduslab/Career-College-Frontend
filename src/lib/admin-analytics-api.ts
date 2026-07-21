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

export interface AdminAnalyticsSummary {
  users: AdminUserMetrics;
  courses: unknown;
  enrollments: unknown;
  certificates: unknown;
  webinars: unknown;
  revenue: unknown;
}

export async function getAdminAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
  const res = await apiGet<AdminAnalyticsSummary>("/analytics/admin/summary/");
  return res.data as AdminAnalyticsSummary;
}
