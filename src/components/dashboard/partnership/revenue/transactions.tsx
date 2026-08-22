"use client";

import { useState } from "react";
import { Search, BookOpen, Video, Loader2 } from "lucide-react";
import { usePartnerRevenueOrders } from "@/hooks/use-partner-revenue";

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
];

const COLS = "grid-cols-[1.4fr_1.6fr_1fr_100px_120px]";

type FilterTab = "all" | "course" | "webinar";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1][0]!).toUpperCase();
}

export default function Transactions() {
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = usePartnerRevenueOrders({
    itemType: tab,
    sort: "-paid_at",
  });

  const orders = data?.results ?? [];
  const q = search.toLowerCase();
  const filtered = orders.filter(
    (o) =>
      !q ||
      o.learner_name.toLowerCase().includes(q) ||
      o.item.title.toLowerCase().includes(q),
  );

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1">
          <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
            Transaction History
          </p>
          <p className="text-[12px] text-(--gray-400) mt-0.5">
            Paid orders on your courses and webinars
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-(--gray-100) rounded-lg p-0.5">
            {(
              [
                { key: "all", label: "All" },
                { key: "course", label: "Courses" },
                { key: "webinar", label: "Webinars" },
              ] as { key: FilterTab; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`h-8 px-4 text-[12px] rounded-md cursor-pointer transition-colors ${
                  tab === key
                    ? "bg-white text-(--text-title) shadow-sm font-medium"
                    : "text-(--gray-500) hover:text-(--gray-700) font-normal"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
          <div className={`grid ${COLS} gap-4 px-3 pb-2.5 border-b border-(--gray-100)`}>
            {["Learner", "Item", "Amount", "Type", "Paid"].map((h) => (
              <p
                key={h}
                className="text-[12px] font-semibold tracking-widest text-(--gray-400) uppercase"
              >
                {h}
              </p>
            ))}
          </div>

          <div className="divide-y divide-(--gray-50)">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-5 h-5 text-(--gray-400) mx-auto animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-[14px] text-(--gray-400)">
                No transactions found.
              </div>
            ) : (
              filtered.map((tx, i) => {
                const Icon = tx.item.type === "course" ? BookOpen : Video;
                return (
                  <div
                    key={tx.order_id}
                    className={`grid ${COLS} gap-4 items-center px-3 py-3.5 hover:bg-(--gray-50) rounded-xl transition-colors`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      >
                        {initialsOf(tx.learner_name)}
                      </div>
                      <p className="text-[14px] font-medium text-(--text-title) truncate">
                        {tx.learner_name}
                      </p>
                    </div>

                    <p className="text-[14px] text-(--gray-600) truncate">
                      {tx.item.title}
                    </p>

                    <p className="text-[14px] font-semibold text-(--text-title)">
                      {Number(tx.amount).toLocaleString()} {tx.currency}
                    </p>

                    <span className="inline-flex items-center gap-1.5 w-fit text-[12px] font-medium text-(--gray-600)">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {tx.item.type === "course" ? "Course" : "Webinar"}
                    </span>

                    <p className="text-[12px] text-(--gray-400) whitespace-nowrap">
                      {tx.paid_at ? new Date(tx.paid_at).toLocaleDateString() : "—"}
                    </p>
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
