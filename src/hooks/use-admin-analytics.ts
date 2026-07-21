import { useQuery } from "@tanstack/react-query";
import { getAdminAnalyticsSummary } from "@/lib/admin-analytics-api";
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
