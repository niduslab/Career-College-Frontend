"use client";

import { useRef, useEffect } from "react";
import { Search, ChevronDown, Download } from "lucide-react";
import { METHODS, STATUSES } from "./data";
import { PaymentMethod, TransactionStatus } from "./types";

interface FilterDropdownProps<T extends string> {
  label: string;
  value: T | "All";
  options: T[];
  open: boolean;
  onToggle: () => void;
  onSelect: (value: T | "All") => void;
}

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  open,
  onToggle,
  onSelect,
}: FilterDropdownProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onToggle]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="text-[12px] cursor-pointer text-(--gray-600) border border-(--gray-200) rounded-lg px-3 py-2 flex items-center gap-1.5 hover:bg-(--gray-50) transition-colors"
      >
        {value === "All" ? label : value}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1 min-w-32.5">
          <button
            onClick={() => onSelect("All")}
            className={`w-full text-left px-3 py-2 cursor-pointer text-[12px] transition-colors ${
              value === "All"
                ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                : "text-(--gray-600) hover:bg-(--gray-50)"
            }`}
          >
            All {label}
          </button>
          {options.map((o) => (
            <button
              key={o}
              onClick={() => onSelect(o)}
              className={`w-full text-left px-3 py-2 cursor-pointer text-[12px] transition-colors ${
                o === value
                  ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                  : "text-(--gray-600) hover:bg-(--gray-50)"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface TransactionsFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  method: PaymentMethod | "All";
  onMethodChange: (v: PaymentMethod | "All") => void;
  status: TransactionStatus | "All";
  onStatusChange: (v: TransactionStatus | "All") => void;
  methodOpen: boolean;
  onMethodToggle: () => void;
  statusOpen: boolean;
  onStatusToggle: () => void;
}

export default function TransactionsFilterBar({
  search,
  onSearchChange,
  method,
  onMethodChange,
  status,
  onStatusChange,
  methodOpen,
  onMethodToggle,
  statusOpen,
  onStatusToggle,
}: TransactionsFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1 min-w-0">
        <Search className="w-4 h-4 text-(--gray-400) absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by student or course..."
          className="lg:w-62.5 w-full h-9 pl-9 pr-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <FilterDropdown
          label="Method"
          value={method}
          options={METHODS}
          open={methodOpen}
          onToggle={onMethodToggle}
          onSelect={onMethodChange}
        />
        <FilterDropdown
          label="Status"
          value={status}
          options={STATUSES}
          open={statusOpen}
          onToggle={onStatusToggle}
          onSelect={onStatusChange}
        />
        <button className="text-[12px] cursor-pointer font-medium text-(--gray-600) border border-(--gray-200) rounded-lg px-3 py-2 flex items-center gap-1.5 hover:bg-(--gray-50) transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
}
