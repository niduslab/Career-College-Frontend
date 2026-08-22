import { apiGet } from "./api";

export interface PartnerRevenueByItem {
  id: number;
  item_type: "course" | "webinar";
  title: string;
  slug: string;
  gross: string;
  paid_orders: number;
}

export interface PartnerRevenueTrendPoint {
  period: string;
  value: number;
}

export interface PartnerRevenueSummary {
  enabled: boolean;
  gross: string;
  currency: string;
  paid_orders: number;
  window_days: number;
  window_gross: string;
  growth_pct: number | null;
  avg_order_value: number;
  by_item_type: {
    course: string;
    webinar: string;
  };
  by_item: PartnerRevenueByItem[];
  trend: {
    granularity: "monthly" | "weekly";
    periods: number;
    series: PartnerRevenueTrendPoint[];
  };
}

export interface PartnerRevenueOrderItem {
  id: number;
  type: "course" | "webinar";
  title: string;
  slug: string;
}

export interface PartnerRevenueOrder {
  order_id: number;
  item: PartnerRevenueOrderItem;
  learner_name: string;
  amount: string;
  currency: string;
  paid_at: string | null;
}

export interface PartnerRevenueOrdersPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: PartnerRevenueOrder[];
}

export async function getPartnerRevenueSummary(
  granularity: "monthly" | "weekly" = "monthly",
  periods = 6,
): Promise<PartnerRevenueSummary> {
  const res = await apiGet<PartnerRevenueSummary>(
    `/analytics/partner/revenue/summary/?granularity=${granularity}&periods=${periods}`,
  );
  return res.data as PartnerRevenueSummary;
}

export async function getPartnerRevenueOrders(params?: {
  itemType?: "course" | "webinar" | "all";
  sort?: "-paid_at" | "paid_at" | "-amount" | "amount";
  page?: number;
}): Promise<PartnerRevenueOrdersPage> {
  const search = new URLSearchParams();
  if (params?.itemType) search.set("item_type", params.itemType);
  if (params?.sort) search.set("sort", params.sort);
  if (params?.page) search.set("page", String(params.page));
  const query = search.toString();
  const res = await apiGet<PartnerRevenueOrdersPage>(
    `/analytics/partner/revenue/orders/${query ? `?${query}` : ""}`,
  );
  return res.data as PartnerRevenueOrdersPage;
}
