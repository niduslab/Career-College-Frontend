import { useQuery } from "@tanstack/react-query";
import {
  getInstructorRevenueSummary,
  listInstructorOrders,
  type ListOrdersParams,
} from "@/lib/instructor-revenue-api";

export function useInstructorRevenueSummary(params: {
  granularity?: "monthly" | "weekly";
  periods?: number;
} = {}) {
  return useQuery({
    queryKey: ["instructor-revenue-summary", params],
    queryFn: () => getInstructorRevenueSummary(params),
    staleTime: 60 * 1000,
  });
}

export function useInstructorOrders(params: ListOrdersParams) {
  return useQuery({
    queryKey: ["instructor-orders", params],
    queryFn: () => listInstructorOrders(params),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}
