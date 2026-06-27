"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { TRANSACTIONS, type TxStatus } from "./data";

const STATUS_STYLES: Record<TxStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Processing: "bg-blue-50 text-blue-700 border border-blue-200",
};

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
];

const PARTNER_COLOR_MAP: Record<string, number> = {
  TC: 0,
  GU: 1,
  NT: 2,
  AP: 3,
  EC: 4,
  BF: 5,
};

const COLS = "grid-cols-[1.4fr_1.6fr_1fr_1fr_100px]";

type FilterTab = "All" | TxStatus;

export default function Transactions() {
  const [tab, setTab] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");

  const filtered = TRANSACTIONS.filter((tx) => {
    const matchTab = tab === "All" || tx.status === tab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      tx.partner.toLowerCase().includes(q) ||
      tx.course.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1">
          <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
            Transaction History
          </p>
          <p className="text-[12px] text-(--gray-400) mt-0.5">
            All payouts and pending revenue
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-(--gray-100) rounded-lg p-0.5">
            {(["All", "Paid", "Processing", "Pending"] as FilterTab[]).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`h-8 px-4 text-[12px]  rounded-md cursor-pointer transition-colors ${
                    tab === t
                      ? "bg-white text-(--text-title) shadow-sm font-medium"
                      : "text-(--gray-500) hover:text-(--gray-700) font-normal"
                  }`}
                >
                  {t}
                </button>
              ),
            )}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-8 pl-8 pr-3 text-[12px] bg-(--gray-50) border border-(--gray-200) rounded-md focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:bg-white placeholder:text-(--gray-400) text-(--text-title) w-full md:w-36 lg:w-36 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-160">
          {/* Head */}
          <div
            className={`grid ${COLS} gap-4 px-3 pb-2.5 border-b border-(--gray-100)`}
          >
            {[
              "Partner",
              "Course / Cohort",
              "Amount",
              "Commission",
              "Status",
            ].map((h) => (
              <p
                key={h}
                className="text-[12px] font-semibold tracking-widest text-(--gray-400) uppercase"
              >
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-(--gray-50)">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-[14px] text-(--gray-400)">
                No transactions found.
              </div>
            ) : (
              filtered.map((tx) => {
                const colorIdx = PARTNER_COLOR_MAP[tx.partnerInitials] ?? 0;
                return (
                  <div
                    key={tx.id}
                    className={`grid ${COLS} gap-4 items-center px-3 py-3.5 hover:bg-(--gray-50) rounded-xl transition-colors`}
                  >
                    {/* Partner */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${AVATAR_COLORS[colorIdx]}`}
                      >
                        {tx.partnerInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-(--text-title) truncate">
                          {tx.partner}
                        </p>
                        <p className="text-[12px] text-(--gray-400)">
                          {tx.date}
                        </p>
                      </div>
                    </div>

                    {/* Course */}
                    <p className="text-[14px] text-(--gray-600) truncate">
                      {tx.course}
                    </p>

                    {/* Amount */}
                    <p className="text-[14px] font-semibold text-(--text-title)">
                      ${tx.amount.toLocaleString()}
                    </p>

                    {/* Commission */}
                    <p className="text-[14px] text-(--primary-700) font-medium">
                      ${tx.commission.toLocaleString()}
                    </p>

                    {/* Status */}
                    <span
                      className={`inline-flex items-center justify-center w-fit px-2.5 py-1 rounded-full text-[12px] font-semibold ${STATUS_STYLES[tx.status]}`}
                    >
                      {tx.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
