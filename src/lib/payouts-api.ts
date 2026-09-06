import { apiGet, apiPatch, type ApiEnvelope } from "./api";
import type { PaginatedResult } from "./admin-console-api";
import type {
  Payout,
  PayoutAccount,
  PayoutMethod,
  MobileBankingProvider,
} from "./admin-payouts-api";

export const PAYOUT_METHOD_OPTIONS: { value: PayoutMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_banking", label: "Mobile Banking" },
];

export const MOBILE_BANKING_PROVIDER_OPTIONS: { value: MobileBankingProvider; label: string }[] = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
];

export interface PayoutAccountFormData {
  payout_method: PayoutMethod | "";
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_routing_number: string;
  mobile_banking_provider: MobileBankingProvider | "";
  mobile_banking_number: string;
}

/** GET my own payout account — null if not created yet. */
export async function getMyPayoutAccount(): Promise<PayoutAccount | null> {
  const res = (await apiGet(`/payouts/payout-account/me/`)) as ApiEnvelope<PayoutAccount | null>;
  return res.data ?? null;
}

/** PATCH — create or update my own payout account. */
export async function saveMyPayoutAccount(
  data: Partial<PayoutAccountFormData>,
): Promise<PayoutAccount> {
  const res = (await apiPatch(`/payouts/payout-account/me/`, data)) as ApiEnvelope<PayoutAccount>;
  if (!res.data) throw new Error("Failed to save payout account.");
  return res.data;
}

export async function getMyPayouts(): Promise<PaginatedResult<Payout>> {
  const res = (await apiGet(`/payouts/my-payouts/`)) as ApiEnvelope<PaginatedResult<Payout>>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}
