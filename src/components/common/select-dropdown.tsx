"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Adds a search input at the top of the panel that filters options by label. */
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search…",
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const filteredOptions =
    searchable && search
      ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((p) => {
            const next = !p;
            if (!next) setSearch("");
            return next;
          });
          if (searchable) setTimeout(() => searchRef.current?.focus(), 0);
        }}
        className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 focus:outline-none text-left flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{selected?.label ?? placeholder}</span>
        {open ? (
          <ChevronUp size={20} className="text-gray-500 shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-72 overflow-hidden flex flex-col">
          {searchable && (
            <div className="relative p-2 border-b border-gray-100 shrink-0">
              <Search
                size={16}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
                className="w-full h-9 pl-8 pr-3 rounded-md border border-gray-200 bg-white text-gray-600 text-[13px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
              />
            </div>
          )}
          <div className="overflow-y-auto">
            {filteredOptions.length === 0 && (
              <p className="px-4 py-3 text-gray-400 sg-p-default">
                {searchable && search ? "No matches found" : "No options available"}
              </p>
            )}
            {filteredOptions.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0 cursor-pointer text-gray-500 sg-p-default"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
