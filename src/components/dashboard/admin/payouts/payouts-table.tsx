"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import PayoutsFilterBar from "./payouts-filter-bar";
import PayoutActionsMenu from "./payout-actions-menu";
import PayoutStatusBadge from "./status-badge";
import GenerateModal from "./generate-modal";
import RejectModal from "./reject-modal";
import MarkPaidModal from "./mark-paid-modal";
import { Pagination } from "@/components/common/pagination";
import {
  usePayouts,
  useGeneratePayouts,
  useReviewPayout,
  useMarkPayoutPaid,
} from "@/hooks/use-admin-payouts";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";
import type { Payout, PayoutStatus } from "@/lib/admin-payouts-api";

const PAGE_SIZE = 10;

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function recipientName(payout: Payout): string {
  const account = payout.payout_account;
  if (account.institution) return account.institution.institution_name;
  return account.instructor?.full_name ?? "—";
}

function recipientInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function PayoutsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PayoutStatus | "">("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Payout | null>(null);
  const [markPaidTarget, setMarkPaidTarget] = useState<Payout | null>(null);

  const debouncedSearch = useDebounced(search, 350);

  const { data, isLoading, isError, isFetching } = usePayouts({
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const generate = useGeneratePayouts();
  const review = useReviewPayout();
  const markPaid = useMarkPayoutPaid();

  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const updateAndResetPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const handleGenerate = (periodStart: string, periodEnd: string) => {
    generate.mutate(
      { periodStart, periodEnd },
      {
        onSuccess: (created) => {
          notify.success(
            created.length === 0
              ? "No eligible payouts for that period."
              : `${created.length} payout(s) generated.`,
          );
          setGenerateOpen(false);
        },
        onError: (err) =>
          notify.error(err instanceof ApiError ? err.detail : "Failed to generate payouts."),
      },
    );
  };

  const handleApprove = (payout: Payout) => {
    review.mutate(
      { id: payout.id, action: "approve" },
      {
        onSuccess: () => notify.success(`Payout for "${recipientName(payout)}" approved.`),
        onError: (err) =>
          notify.error(err instanceof ApiError ? err.detail : "Failed to approve payout."),
      },
    );
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;
    review.mutate(
      { id: rejectTarget.id, action: "reject", rejectionReason: reason },
      {
        onSuccess: () => {
          notify.success(`Payout for "${recipientName(rejectTarget)}" rejected.`);
          setRejectTarget(null);
        },
        onError: (err) =>
          notify.error(err instanceof ApiError ? err.detail : "Failed to reject payout."),
      },
    );
  };

  const handleMarkPaidConfirm = (paymentReference: string) => {
    if (!markPaidTarget) return;
    markPaid.mutate(
      { id: markPaidTarget.id, paymentReference },
      {
        onSuccess: () => {
          notify.success(`Payout for "${recipientName(markPaidTarget)}" marked paid.`);
          setMarkPaidTarget(null);
        },
        onError: (err) =>
          notify.error(err instanceof ApiError ? err.detail : "Failed to mark payout paid."),
      },
    );
  };

  return (
    <div className="space-y-4">
      <PayoutsFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        status={status}
        onStatusChange={(v) => {
          updateAndResetPage(setStatus)(v);
          setStatusOpen(false);
        }}
        statusOpen={statusOpen}
        onStatusToggle={() => setStatusOpen((v) => !v)}
        onGenerateClick={() => setGenerateOpen(true)}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Recipient
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Period
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2 pr-8">
                  Net Amount
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Status
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Requested
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13px] text-(--gray-400)">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading payouts…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13px] text-red-500">
                    Failed to load payouts. Please try again.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[13px] text-(--gray-400)">
                    No payouts match your filters.
                  </td>
                </tr>
              ) : (
                rows.map((p) => {
                  const name = recipientName(p);
                  const busy =
                    (review.isPending && review.variables?.id === p.id) ||
                    (markPaid.isPending && markPaid.variables?.id === p.id);
                  return (
                    <tr key={p.id} className="hover:bg-(--gray-50) transition-colors">
                      <td className="py-3 pr-8">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                            {recipientInitials(name)}
                          </div>
                          <p className="text-[13px] font-semibold text-(--text-title) truncate">
                            {name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 pr-8 text-[13px] text-(--gray-600) whitespace-nowrap">
                        {p.period_start} – {p.period_end}
                      </td>
                      <td className="py-3 pr-8 text-[13px] font-semibold text-(--text-title) text-right whitespace-nowrap">
                        {p.currency} {p.net_amount}
                      </td>
                      <td className="py-3 pr-8">
                        <PayoutStatusBadge status={p.status} />
                      </td>
                      <td className="py-3 pr-8 text-[13px] text-(--gray-600) whitespace-nowrap">
                        {p.requested_at?.slice(0, 10) ?? "—"}
                      </td>
                      <td className="py-3 text-right">
                        <PayoutActionsMenu
                          status={p.status}
                          busy={busy}
                          onApprove={() => handleApprove(p)}
                          onReject={() => setRejectTarget(p)}
                          onMarkPaid={() => setMarkPaidTarget(p)}
                        />
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
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} payouts
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {generateOpen && (
        <GenerateModal
          submitting={generate.isPending}
          onConfirm={handleGenerate}
          onClose={() => setGenerateOpen(false)}
        />
      )}

      {rejectTarget && (
        <RejectModal
          recipientName={recipientName(rejectTarget)}
          submitting={review.isPending}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {markPaidTarget && (
        <MarkPaidModal
          recipientName={recipientName(markPaidTarget)}
          netAmount={markPaidTarget.net_amount}
          currency={markPaidTarget.currency}
          submitting={markPaid.isPending}
          onConfirm={handleMarkPaidConfirm}
          onClose={() => setMarkPaidTarget(null)}
        />
      )}
    </div>
  );
}
