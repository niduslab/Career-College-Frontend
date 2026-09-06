import { apiGet, apiPost, type ApiEnvelope } from "./api";
import type { PaginatedResult } from "./admin-console-api";

export type PayoutMethod = "bank_transfer" | "mobile_banking";
export type MobileBankingProvider = "bkash" | "nagad" | "rocket";
export type PayoutStatus = "pending" | "approved" | "paid" | "rejected";

interface Brief {
  id: number;
  full_name: string;
  email: string;
}

interface InstitutionBrief {
  id: number;
  institution_name: string;
  slug: string;
}

export interface PayoutAccount {
  id: number;
  instructor: Brief | null;
  institution: InstitutionBrief | null;
  payout_method: PayoutMethod;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_routing_number: string;
  mobile_banking_provider: MobileBankingProvider | "";
  mobile_banking_number: string;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payout {
  id: number;
  payout_account: PayoutAccount;
  period_start: string;
  period_end: string;
  gross_amount: string;
  platform_fee_pct: string;
  net_amount: string;
  currency: string;
  status: PayoutStatus;
  included_order_ids: number[];
  admin_notes: string;
  rejection_reason: string;
  payment_reference: string;
  requested_at: string;
  approved_at: string | null;
  paid_at: string | null;
  rejected_at: string | null;
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

export interface ListPayoutAccountsParams {
  is_verified?: boolean;
  page?: number;
  page_size?: number;
}

export async function listPayoutAccounts(
  params: ListPayoutAccountsParams = {},
): Promise<PaginatedResult<PayoutAccount>> {
  const res = (await apiGet(
    `/payouts/admin/payout-accounts/${buildQuery({ ...params })}`,
  )) as ApiEnvelope<PaginatedResult<PayoutAccount>>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function verifyPayoutAccount(id: number): Promise<PayoutAccount> {
  const res = await apiPost<PayoutAccount>(`/payouts/admin/payout-accounts/${id}/verify/`, {});
  return res.data as PayoutAccount;
}

export interface ListPayoutsParams {
  status?: PayoutStatus | "";
  search?: string;
  sort?: "-requested_at" | "requested_at" | "-net_amount" | "net_amount";
  page?: number;
  page_size?: number;
}

export async function listPayouts(
  params: ListPayoutsParams = {},
): Promise<PaginatedResult<Payout>> {
  const res = (await apiGet(
    `/payouts/admin/payouts/${buildQuery({ ...params })}`,
  )) as ApiEnvelope<PaginatedResult<Payout>>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function getPayoutDetail(id: number): Promise<Payout> {
  const res = (await apiGet(`/payouts/admin/payouts/${id}/`)) as ApiEnvelope<Payout>;
  if (!res.data) throw new Error("Payout not found.");
  return res.data;
}

export async function generatePayouts(
  periodStart: string,
  periodEnd: string,
): Promise<Payout[]> {
  const res = (await apiPost(`/payouts/admin/payouts/generate/`, {
    period_start: periodStart,
    period_end: periodEnd,
  })) as ApiEnvelope<Payout[]>;
  return res.data ?? [];
}

export async function reviewPayout(
  id: number,
  action: "approve" | "reject",
  rejectionReason?: string,
): Promise<Payout> {
  const res = await apiPost<Payout>(`/payouts/admin/payouts/${id}/review/`, {
    action,
    ...(rejectionReason ? { rejection_reason: rejectionReason } : {}),
  });
  return res.data as Payout;
}

export async function markPayoutPaid(
  id: number,
  paymentReference: string,
): Promise<Payout> {
  const res = await apiPost<Payout>(`/payouts/admin/payouts/${id}/mark-paid/`, {
    payment_reference: paymentReference,
  });
  return res.data as Payout;
}
