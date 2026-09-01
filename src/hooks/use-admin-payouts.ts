import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listPayoutAccounts,
  verifyPayoutAccount,
  listPayouts,
  getPayoutDetail,
  generatePayouts,
  reviewPayout,
  markPayoutPaid,
  type ListPayoutAccountsParams,
  type ListPayoutsParams,
} from "@/lib/admin-payouts-api";

export function usePayoutAccounts(params: ListPayoutAccountsParams) {
  return useQuery({
    queryKey: ["admin-payout-accounts", params],
    queryFn: () => listPayoutAccounts(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useVerifyPayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => verifyPayoutAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payout-accounts"] });
    },
  });
}

export function usePayouts(params: ListPayoutsParams) {
  return useQuery({
    queryKey: ["admin-payouts", params],
    queryFn: () => listPayouts(params),
    placeholderData: (previousData) => previousData,
  });
}

export function usePayoutDetail(id: number | null) {
  return useQuery({
    queryKey: ["admin-payout-detail", id],
    queryFn: () => getPayoutDetail(id as number),
    enabled: id !== null,
  });
}

export function useGeneratePayouts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ periodStart, periodEnd }: { periodStart: string; periodEnd: string }) =>
      generatePayouts(periodStart, periodEnd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
    },
  });
}

export function useReviewPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      rejectionReason,
    }: {
      id: number;
      action: "approve" | "reject";
      rejectionReason?: string;
    }) => reviewPayout(id, action, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payout-detail"] });
    },
  });
}

export function useMarkPayoutPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentReference }: { id: number; paymentReference: string }) =>
      markPayoutPaid(id, paymentReference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payout-detail"] });
    },
  });
}
