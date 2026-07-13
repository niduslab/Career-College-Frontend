"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export default function SearchableSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-[13px] font-medium text-(--text-title)">
        {label}
      </label>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (!open) setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="w-full h-12 px-3 rounded-lg cursor-pointer border border-(--gray-200) bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-(--primary-700) text-left flex items-center justify-between transition-shadow"
        >
          <span className={value ? "text-(--text-title)" : "text-(--gray-400)"}>
            {value || `Select ${label.toLowerCase()}`}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-(--gray-500) pointer-events-none shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-(--gray-500) pointer-events-none shrink-0" />
          )}
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-(--gray-200) rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-(--gray-100)">
              <Search className="w-4 h-4 text-(--gray-400) shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full text-[13px] text-(--text-title) placeholder:text-(--gray-400) outline-none"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-[13px] text-(--gray-400)">
                  No matches.
                </p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] cursor-pointer border-b border-(--gray-100) last:border-b-0 transition-colors hover:bg-(--primary-50) ${
                      opt === value
                        ? "bg-(--primary-50) text-(--primary-700) font-medium"
                        : "text-(--gray-600)"
                    }`}
                  >
                    {opt}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
