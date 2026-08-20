import { useQuery } from "@tanstack/react-query";
import {
  getPartnerRevenueSummary,
  getPartnerRevenueOrders,
} from "@/lib/partner-revenue-api";

export function usePartnerRevenueSummary(
  granularity: "monthly" | "weekly" = "monthly",
  periods = 6,
) {
  return useQuery({
    queryKey: ["partner-revenue-summary", granularity, periods],
    queryFn: () => getPartnerRevenueSummary(granularity, periods),
    staleTime: 60 * 1000,
  });
}

export function usePartnerRevenueOrders(params?: {
  itemType?: "course" | "webinar" | "all";
  sort?: "-paid_at" | "paid_at" | "-amount" | "amount";
  page?: number;
}) {
  return useQuery({
    queryKey: ["partner-revenue-orders", params],
    queryFn: () => getPartnerRevenueOrders(params),
    staleTime: 60 * 1000,
  });
}
