"use client";

import { useRef, useEffect } from "react";
import { Search, ChevronDown, Wallet } from "lucide-react";
import type { PayoutStatus } from "@/lib/admin-payouts-api";

const STATUSES: PayoutStatus[] = ["pending", "approved", "paid", "rejected"];

const STATUS_LABEL: Record<PayoutStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

interface PayoutsFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: PayoutStatus | "";
  onStatusChange: (v: PayoutStatus | "") => void;
  statusOpen: boolean;
  onStatusToggle: () => void;
  onGenerateClick: () => void;
}

export default function PayoutsFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOpen,
  onStatusToggle,
  onGenerateClick,
}: PayoutsFilterBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onStatusToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [statusOpen, onStatusToggle]);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1 min-w-0">
        <Search className="w-4 h-4 text-(--gray-400) absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by recipient name..."
          className="lg:w-62.5 w-full h-9 pl-9 pr-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative" ref={ref}>
          <button
            onClick={onStatusToggle}
            className="text-[12px] cursor-pointer text-(--gray-600) border border-(--gray-200) rounded-lg px-3 py-2 flex items-center gap-1.5 hover:bg-(--gray-50) transition-colors"
          >
            {status === "" ? "Status" : STATUS_LABEL[status]}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`}
            />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1 min-w-36">
              <button
                onClick={() => onStatusChange("")}
                className={`w-full text-left px-3 py-2 cursor-pointer text-[12px] transition-colors ${
                  status === ""
                    ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                    : "text-(--gray-600) hover:bg-(--gray-50)"
                }`}
              >
                All Statuses
              </button>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`w-full text-left px-3 py-2 cursor-pointer text-[12px] transition-colors ${
                    s === status
                      ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                      : "text-(--gray-600) hover:bg-(--gray-50)"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onGenerateClick}
          className="text-[12px] cursor-pointer font-medium text-white bg-(--primary-600) hover:bg-(--primary-700) rounded-lg px-3 py-2 flex items-center gap-1.5 transition-colors"
        >
          <Wallet className="w-4 h-4" />
          Generate Payouts
        </button>
      </div>
    </div>
  );
}
