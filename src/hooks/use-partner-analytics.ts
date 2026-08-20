import { useQuery } from "@tanstack/react-query";
import {
  getPartnerAnalyticsSummary,
  getPartnerEnrollmentTrend,
  getPartnerTopCourses,
  getPartnerExpertPerformance,
  type TrendGranularity,
} from "@/lib/partner-analytics-api";

export function usePartnerAnalyticsSummary() {
  return useQuery({
    queryKey: ["partner-analytics-summary"],
    queryFn: getPartnerAnalyticsSummary,
    staleTime: 60 * 1000,
  });
}

export function usePartnerEnrollmentTrend(
  granularity: TrendGranularity = "monthly",
  periods = 12,
) {
  return useQuery({
    queryKey: ["partner-analytics-enrollment-trend", granularity, periods],
    queryFn: () => getPartnerEnrollmentTrend(granularity, periods),
    staleTime: 60 * 1000,
  });
}

export function usePartnerTopCourses(
  sort: "enrollments" | "rating" | "completion" = "enrollments",
  limit = 5,
) {
  return useQuery({
    queryKey: ["partner-analytics-top-courses", sort, limit],
    queryFn: () => getPartnerTopCourses(sort, limit),
    staleTime: 60 * 1000,
  });
}

export function usePartnerExpertPerformance() {
  return useQuery({
    queryKey: ["partner-analytics-expert-performance"],
    queryFn: getPartnerExpertPerformance,
    staleTime: 60 * 1000,
  });
}
