"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, Landmark, Smartphone } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { usePayoutAccounts, useVerifyPayoutAccount } from "@/hooks/use-admin-payouts";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";
import type { PayoutAccount } from "@/lib/admin-payouts-api";

const PAGE_SIZE = 10;

function ownerName(account: PayoutAccount): string {
  if (account.institution) return account.institution.institution_name;
  return account.instructor?.full_name ?? "—";
}

function ownerEmail(account: PayoutAccount): string {
  if (account.institution) return "";
  return account.instructor?.email ?? "";
}

function ownerInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function methodDetail(account: PayoutAccount): string {
  if (account.payout_method === "bank_transfer") {
    return `${account.bank_name} · ${account.bank_account_number}`;
  }
  return `${account.mobile_banking_provider} · ${account.mobile_banking_number}`;
}

export default function PayoutAccountsTable() {
  const [onlyUnverified, setOnlyUnverified] = useState(true);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = usePayoutAccounts({
    is_verified: onlyUnverified ? false : undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const verify = useVerifyPayoutAccount();

  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const handleVerify = (account: PayoutAccount) => {
    verify.mutate(account.id, {
      onSuccess: () => notify.success(`${ownerName(account)}'s payout account verified.`),
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to verify payout account."),
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => {
            setOnlyUnverified((v) => !v);
            setPage(1);
          }}
          className={`text-[12px] cursor-pointer font-medium rounded-lg px-3 py-2 border transition-colors ${
            onlyUnverified
              ? "bg-(--primary-50) text-(--primary-600) border-(--primary-200)"
              : "text-(--gray-600) border-(--gray-200) hover:bg-(--gray-50)"
          }`}
        >
          {onlyUnverified ? "Showing: Needs Verification" : "Showing: All Accounts"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Owner
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Method
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Details
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Status
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[13px] text-(--gray-400)">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading payout accounts…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[13px] text-red-500">
                    Failed to load payout accounts. Please try again.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[13px] text-(--gray-400)">
                    {onlyUnverified
                      ? "No accounts awaiting verification."
                      : "No payout accounts yet."}
                  </td>
                </tr>
              ) : (
                rows.map((a) => {
                  const name = ownerName(a);
                  const email = ownerEmail(a);
                  const MethodIcon = a.payout_method === "bank_transfer" ? Landmark : Smartphone;
                  return (
                    <tr key={a.id} className="hover:bg-(--gray-50) transition-colors">
                      <td className="py-3 pr-8">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                            {ownerInitials(name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-(--text-title) truncate">
                              {name}
                            </p>
                            {email && (
                              <p className="text-[11px] text-(--gray-400) truncate">{email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-8">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-(--gray-100) text-(--gray-600)">
                          <MethodIcon className="w-3 h-3" />
                          {a.payout_method === "bank_transfer" ? "Bank Transfer" : "Mobile Banking"}
                        </span>
                      </td>
                      <td className="py-3 pr-8 text-[13px] text-(--gray-600) truncate">
                        {methodDetail(a)}
                      </td>
                      <td className="py-3 pr-8">
                        {a.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-(--gray-100) text-(--gray-500)">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {!a.is_verified ? (
                          <button
                            onClick={() => handleVerify(a)}
                            disabled={verify.isPending && verify.variables === a.id}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium bg-(--primary-600) text-white hover:bg-(--primary-700) transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {verify.isPending && verify.variables === a.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            Verify
                          </button>
                        ) : (
                          <span className="text-[12px] text-(--gray-400)">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-(--gray-100)">
          <p className="text-[12px] text-(--gray-400)">
            {isFetching && !isLoading && "Refreshing… · "}
            Showing {totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} accounts
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
