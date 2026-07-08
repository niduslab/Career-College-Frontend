"use client";

import { useMemo, useState } from "react";
import { RotateCw, Send } from "lucide-react";
import PayoutsFilterBar from "./filter-bar";
import StatusBadge from "./status-badge";
import { Pagination } from "@/components/common/pagination";
import { PAYOUTS } from "./data";
import { Payout, PayoutRecipientType, PayoutStatus } from "./types";

const PAGE_SIZE = 6;

const TYPE_LABEL: Record<PayoutRecipientType, string> = {
  Instructor: "text-purple-600 bg-purple-50",
  Partner: "text-(--primary-600) bg-(--primary-50)",
};

export default function PayoutsTable() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<PayoutRecipientType | "All">("All");
  const [status, setStatus] = useState<PayoutStatus | "All">("All");
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [decisions, setDecisions] = useState<Record<string, PayoutStatus>>({});

  const rows = useMemo(
    () => PAYOUTS.map((p) => ({ ...p, status: decisions[p.id] ?? p.status })),
    [decisions],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((p) => {
      const matchesSearch = !q || p.recipient.toLowerCase().includes(q);
      const matchesType = type === "All" || p.type === type;
      const matchesStatus = status === "All" || p.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rows, search, type, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updateAndResetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const pay = (id: string) => setDecisions((prev) => ({ ...prev, [id]: "Paid" }));

  return (
    <div className="space-y-4">
      <PayoutsFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        type={type}
        onTypeChange={(v) => {
          updateAndResetPage(setType)(v);
          setTypeOpen(false);
        }}
        status={status}
        onStatusChange={(v) => {
          updateAndResetPage(setStatus)(v);
          setStatusOpen(false);
        }}
        typeOpen={typeOpen}
        onTypeToggle={() => {
          setTypeOpen((v) => !v);
          setStatusOpen(false);
        }}
        statusOpen={statusOpen}
        onStatusToggle={() => {
          setStatusOpen((v) => !v);
          setTypeOpen(false);
        }}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-190 border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Recipient</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Type</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2 pr-6">Amount</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pl-3">Method</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Status</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Scheduled</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {pageRows.map((p: Payout) => {
                const canPayNow = p.status === "Pending";
                const canRetry = p.status === "Failed";
                return (
                  <tr key={p.id} className="hover:bg-(--gray-50) transition-colors">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                          {p.initials}
                        </div>
                        <p className="text-[13px] font-semibold text-(--text-title) truncate">{p.recipient}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${TYPE_LABEL[p.type]}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3 pr-6 text-[13px] font-semibold text-(--text-title) text-right">{p.amount}</td>
                    <td className="py-3 pl-3 pr-3 text-[13px] text-(--gray-600)">{p.method}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 pr-3 text-[13px] text-(--gray-600) whitespace-nowrap">{p.scheduled}</td>
                    <td className="py-3 text-right">
                      {canPayNow ? (
                        <button
                          onClick={() => pay(p.id)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-(--primary-600) bg-(--primary-50) hover:bg-(--primary-100) px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Pay Now
                        </button>
                      ) : canRetry ? (
                        <button
                          onClick={() => pay(p.id)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          Retry
                        </button>
                      ) : (
                        <span className="text-[12px] text-(--gray-400)">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[13px] text-(--gray-400)">
                    No payouts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-(--gray-100)">
          <p className="text-[12px] text-(--gray-400)">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} payouts
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
