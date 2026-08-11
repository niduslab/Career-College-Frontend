import { useQuery } from "@tanstack/react-query";

import {
  getContinueLearning,
  getLearnerActivity,
  getLearnerSummary,
  getLearnerUpcoming,
  type ActivityParams,
  type UpcomingParams,
} from "@/lib/learner-dashboard-api";

/** KPI tiles for the learner dashboard. */
export function useLearnerSummary() {
  return useQuery({
    queryKey: ["learner-summary"],
    queryFn: getLearnerSummary,
  });
}

/** Recent-activity feed. `placeholderData` keeps the list rendered while a
 *  new page loads, matching the catalog's pagination feel. */
export function useLearnerActivity(params: ActivityParams = {}) {
  return useQuery({
    queryKey: ["learner-activity", params],
    queryFn: () => getLearnerActivity(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Upcoming cohort, drip-release and webinar dates. */
export function useLearnerUpcoming(params: UpcomingParams = {}) {
  return useQuery({
    queryKey: ["learner-upcoming", params],
    queryFn: () => getLearnerUpcoming(params),
  });
}

/** Resume target. Resolves to null when there is no active enrollment. */
export function useContinueLearning() {
  return useQuery({
    queryKey: ["learner-continue"],
    queryFn: getContinueLearning,
  });
}
