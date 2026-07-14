import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createCheckoutSession,
  findOrderByTranId,
  getMyOrders,
  type CheckoutInput,
} from "@/lib/payments-api";

/** Open a checkout session; on success, callers redirect the browser to gateway_url. */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (input: CheckoutInput) => createCheckoutSession(input),
  });
}

/** List the caller's own payment orders. */
export function useMyOrders() {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
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
