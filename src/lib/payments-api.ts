import { apiGet, apiPost } from "./api";
import type { PaginatedResponse } from "./course-api";

export type OrderStatus =
  | "initiated"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export type PaymentItemType = "course" | "webinar";

export interface CheckoutSession {
  gateway_url: string;
  order_id: number;
  tran_id: string;
  item_type: PaymentItemType;
  schedule_id: number | null;
  amount: string;
  currency: string;
}

export interface CheckoutInput {
  course_slug?: string;
  webinar_slug?: string;
  schedule_id?: number;
}

/** Open an SSLCommerz hosted-checkout session for a paid course or webinar. */
export async function createCheckoutSession(
  input: CheckoutInput,
): Promise<CheckoutSession> {
  const res = await apiPost<CheckoutSession>("/payments/checkout/", input);
  return res.data as CheckoutSession;
}

export interface Order {
  id: number;
  tran_id: string;
  status: OrderStatus;
  item_type: PaymentItemType;
  amount: string;
  currency: string;
  schedule_id: number | null;
  paid_at: string | null;
  created_at: string;
  /** Exactly one of the course or webinar pairs is populated, matching
   *  `item_type`. The order carries no thumbnail, instructor, or gateway
   *  metadata — only the purchase target's title and slug. */
  course_title: string | null;
  course_slug: string | null;
  webinar_title: string | null;
  webinar_slug: string | null;
}

export interface OrderListParams {
  status?: OrderStatus;
  page?: number;
  page_size?: number;
}

/** List the caller's own payment orders. */
export async function getMyOrders(
  params: OrderListParams = {},
): Promise<PaginatedResponse<Order>> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  const res = await apiGet<PaginatedResponse<Order>>(
    `/payments/orders/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Fetch a single order by id (own-only; 404 on no access). */
export async function getOrder(orderId: number): Promise<Order> {
  const res = await apiGet<Order>(`/payments/orders/${orderId}/`);
  return res.data as Order;
}

/** Find the caller's own order matching a given tran_id (from the payment redirect). */
export async function findOrderByTranId(
  tranId: string,
): Promise<Order | undefined> {
  const { results } = await getMyOrders();
  return results.find((o) => o.tran_id === tranId);
}
