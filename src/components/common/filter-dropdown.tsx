"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface FilterOption<T extends string | number> {
  value: T;
  label: string;
}

interface FilterDropdownProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  placeholder: string;
  align?: "left" | "right";
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

/**
 * Filter-bar dropdown (button trigger + option list) used by table toolbars.
 * Closes on outside click — every hand-rolled copy of this (courses/webinars/
 * instructors tables) was missing that, so this is the one place to fix it.
 */
export function FilterDropdown<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
  align = "left",
  className = "",
  searchable = false,
  searchPlaceholder = "Search…",
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filteredOptions =
    searchable && search
      ? options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase()),
        )
      : options;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (!next) setSearch("");
            return next;
          });
          if (searchable) setTimeout(() => searchRef.current?.focus(), 0);
        }}
        className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
      >
        <span className="flex-1 text-left truncate">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 min-w-40 max-h-64 overflow-hidden flex flex-col ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {searchable && (
            <div className="relative p-2 border-b border-(--gray-100) shrink-0">
              <Search
                size={16}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-(--gray-400) pointer-events-none"
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={searchPlaceholder}
                autoComplete="off"
                className="w-full h-9 pl-8 pr-3 rounded-md border border-(--gray-200) bg-white text-(--text-title) text-[13px] placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700)"
              />
            </div>
          )}
          <div className="py-1 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-2 text-[13px] text-(--gray-400)">
                {searchable && search
                  ? "No matches found"
                  : "No options available"}
              </p>
            ) : (
              filteredOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                    o.value === value
                      ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                      : "text-(--gray-600) hover:bg-(--gray-50)"
                  }`}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
