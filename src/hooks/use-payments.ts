import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createCheckoutSession,
  findOrderByTranId,
  getMyOrders,
  type CheckoutInput,
  type OrderListParams,
} from "@/lib/payments-api";

/** Open a checkout session; on success, callers redirect the browser to gateway_url. */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (input: CheckoutInput) => createCheckoutSession(input),
  });
}

/** List the caller's own payment orders.
 *
 *  The backend exposes only a `?status=` filter — no search or sort — and the
 *  payment-history page needs status counts across the whole history for its
 *  stat tiles. So it pulls one large page and filters/sorts/paginates
 *  client-side. `page_size` is capped at 100 server-side. */
export function useMyOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: ["my-orders", params],
    queryFn: () => getMyOrders(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Look up the caller's order by tran_id — used on the payment redirect pages. */
export function useOrderByTranId(tranId: string | undefined) {
  return useQuery({
    queryKey: ["order-by-tran-id", tranId],
    queryFn: () => findOrderByTranId(tranId as string),
    enabled: !!tranId,
    retry: 2,
  });
}
