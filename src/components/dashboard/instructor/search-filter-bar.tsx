"use client";

import { useCallback, useRef, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  filterOptions: string[];
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  searchValue: string;
  filterValue: string;
}

export default function SearchFilterBar({
  searchPlaceholder = "Search...",
  filterOptions,
  onSearchChange,
  onFilterChange,
  searchValue,
  filterValue,
}: SearchFilterBarProps) {
  const [dropOpen, setDropOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(
    ref,
    useCallback(() => setDropOpen(false), []),
  );

  return (
    <div className="flex items-center justify-between gap-3 bg-white border border-(--gray-200) rounded-xl px-5 py-4">
      {/* Search — standalone */}
      <div className="relative w-117.5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-12 pl-10 pr-4 text-[14px] border border-(--gray-200) rounded-xl bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-200) transition-shadow"
        />
      </div>

      {/* Filter dropdown — standalone */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setDropOpen((v) => !v)}
          className="flex items-center cursor-pointer gap-2 px-4 h-12 w-41.5 border border-(--gray-200) rounded-xl bg-white text-[13px] text-(--gray-600) hover:bg-(--gray-50) transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-(--gray-500)" />
          <span className="flex-1 text-left">{filterValue}</span>
          <ChevronDown
            className={`w-4 h-4 ml-auto transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1 min-w-36">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onFilterChange(opt);
                  setDropOpen(false);
                }}
                className={`w-full text-left cursor-pointer px-4 py-2 text-[12px] transition-colors ${
                  opt === filterValue
                    ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                    : "text-(--gray-600) hover:bg-(--gray-50)"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
