import { apiGet, type ApiEnvelope } from "./api";

// Instructor revenue — see backend docs/architecture/31-instructor-revenue.md.
//
// Gross-only, deliberately. No payout, "available balance", commission
// split, or bank account — none of those have a backing model on the
// backend yet. Every number here is `Order.amount` summed where
// `status='paid'`.

export interface RevenueByCourse {
  id: number;
  title: string;
  slug: string;
  gross: string;
  paid_orders: number;
}

export interface RevenueTrendPoint {
  period: string;
  value: number;
}

export interface RevenueTrend {
  granularity: "monthly" | "weekly";
  periods: number;
  series: RevenueTrendPoint[];
}

export interface InstructorCourseOption {
  id: number;
  title: string;
  slug: string;
}

export interface InstructorRevenueSummary {
  gross: string;
  currency: string;
  paid_orders: number;
  window_days: number;
  window_gross: string;
  /** Null when the previous window had zero revenue — show "no prior data",
   *  never a fabricated 0%. */
  growth_pct: number | null;
  avg_order_value: number;
  by_course: RevenueByCourse[];
  trend: RevenueTrend;
  courses: InstructorCourseOption[];
}

export type OrderSort = "-paid_at" | "paid_at" | "-amount" | "amount";

export interface OrderRow {
  order_id: number;
  course: { id: number; title: string; slug: string };
  learner_name: string;
  amount: string;
  currency: string;
  paid_at: string;
}

export interface PaginatedOrders {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderRow[];
}

export interface ListOrdersParams {
  course_id?: number | "";
  sort?: OrderSort;
  page?: number;
  page_size?: number;
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

export async function getInstructorRevenueSummary(params: {
  granularity?: "monthly" | "weekly";
  periods?: number;
} = {}): Promise<InstructorRevenueSummary> {
  const res = await apiGet<InstructorRevenueSummary>(
    `/analytics/instructor/revenue/summary/${buildQuery(params)}`,
  );
  return res.data as InstructorRevenueSummary;
}

export async function listInstructorOrders(
  params: ListOrdersParams = {},
): Promise<PaginatedOrders> {
  const res = (await apiGet(
    `/analytics/instructor/revenue/orders/${buildQuery({ ...params })}`,
  )) as ApiEnvelope<PaginatedOrders>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}
