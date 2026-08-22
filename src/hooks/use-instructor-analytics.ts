import { useQuery } from "@tanstack/react-query";
import { getInstructorAnalyticsSummary } from "@/lib/instructor-analytics-api";

/** KPI summary for the instructor's own courses (revenue/students/courses/rating/funnel/top-courses). */
export function useInstructorAnalyticsSummary() {
  return useQuery({
    queryKey: ["instructor-analytics-summary"],
    queryFn: getInstructorAnalyticsSummary,
    staleTime: 60 * 1000,
  });
}
