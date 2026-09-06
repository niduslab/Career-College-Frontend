import { useQuery } from "@tanstack/react-query";
import {
  getAdminAnalyticsSummary,
  getUserSignupTrend,
  getRevenueTrend,
  getTopCourses,
  getConversionFunnel,
  type TrendParams,
  type TopCoursesSort,
} from "@/lib/admin-analytics-api";
import { countAdminUsers } from "@/lib/admin-console-api";

/** Platform-wide KPI summary (users/courses/enrollments/certificates/webinars/revenue). */
export function useAdminAnalyticsSummary() {
  return useQuery({
    queryKey: ["admin-analytics-summary"],
    queryFn: getAdminAnalyticsSummary,
    staleTime: 60 * 1000,
  });
}

/** Count of currently-suspended accounts — not tracked by the analytics summary. */
export function useSuspendedUserCount() {
  return useQuery({
    queryKey: ["admin-users-count", { is_restricted_by_admin: true }],
    queryFn: () => countAdminUsers({ is_restricted_by_admin: true }),
    staleTime: 60 * 1000,
  });
}

/** New-signup time series, used by the User Growth chart. */
export function useUserSignupTrend(params: TrendParams) {
  return useQuery({
    queryKey: ["admin-user-signup-trend", params],
    queryFn: () => getUserSignupTrend(params),
    staleTime: 60 * 1000,
  });
}

/** Paid-order gross revenue time series, used by the Platform Revenue chart. */
export function useRevenueTrend(params: TrendParams) {
  return useQuery({
    queryKey: ["admin-revenue-trend", params],
    queryFn: () => getRevenueTrend(params),
    staleTime: 60 * 1000,
  });
}

/** Ranked platform courses by enrollments / rating / completion. */
export function useTopCourses(sort: TopCoursesSort, limit: number) {
  return useQuery({
    queryKey: ["admin-top-courses", sort, limit],
    queryFn: () => getTopCourses(sort, limit),
    staleTime: 60 * 1000,
  });
}

/** Distinct-learner conversion funnel: signup → enrolled → completed → certified. */
export function useConversionFunnel() {
  return useQuery({
    queryKey: ["admin-conversion-funnel"],
    queryFn: getConversionFunnel,
    staleTime: 60 * 1000,
  });
}
