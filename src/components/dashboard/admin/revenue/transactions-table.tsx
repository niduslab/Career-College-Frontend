"use client";

import { useMemo, useState } from "react";
import TransactionsFilterBar from "./filter-bar";
import StatusBadge from "./status-badge";
import { Pagination } from "@/components/common/pagination";
import { TRANSACTIONS } from "./data";
import { PaymentMethod, TransactionStatus } from "./types";

const PAGE_SIZE = 6;

export default function TransactionsTable() {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "All">("All");
  const [status, setStatus] = useState<TransactionStatus | "All">("All");
  const [methodOpen, setMethodOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TRANSACTIONS.filter((t) => {
      const matchesSearch =
        !q ||
        t.student.toLowerCase().includes(q) ||
        t.course.toLowerCase().includes(q);
      const matchesMethod = method === "All" || t.method === method;
      const matchesStatus = status === "All" || t.status === status;
      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [search, method, status]);

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

  return (
    <div className="space-y-4">
      <TransactionsFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        method={method}
        onMethodChange={(v) => {
          updateAndResetPage(setMethod)(v);
          setMethodOpen(false);
        }}
        status={status}
        onStatusChange={(v) => {
          updateAndResetPage(setStatus)(v);
          setStatusOpen(false);
        }}
        methodOpen={methodOpen}
        onMethodToggle={() => {
          setMethodOpen((v) => !v);
          setStatusOpen(false);
        }}
        statusOpen={statusOpen}
        onStatusToggle={() => {
          setStatusOpen((v) => !v);
          setMethodOpen(false);
        }}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-175 border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Transaction</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Student</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Course</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2 pr-6">Amount</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pl-3">Status</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {pageRows.map((t) => (
                <tr key={t.id} className="hover:bg-(--gray-50) transition-colors">
                  <td className="py-3 pr-3 text-[12px] text-(--gray-400) whitespace-nowrap">{t.id}</td>
                  <td className="py-3 pr-3 text-[13px] font-semibold text-(--text-title) truncate">{t.student}</td>
                  <td className="py-3 pr-3 text-[13px] text-(--gray-600) truncate">{t.course}</td>
                  <td className="py-3 pr-6 text-[13px] font-semibold text-(--text-title) text-right whitespace-nowrap">{t.amount}</td>
                  <td className="py-3 pl-3 pr-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3 text-[13px] text-(--gray-600) text-right whitespace-nowrap">{t.date}</td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[13px] text-(--gray-400)">
                    No transactions match your filters.
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
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
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
