"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Country } from "country-state-city";

interface CountrySelectProps {
  value: string;
  onChange: (country: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function useClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  onOutside: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

const PANEL_CLS =
  "absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto";
const ITEM_CLS =
  "w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0 cursor-pointer text-gray-500 sg-p-default";

/** Standalone searchable country picker, styled like LocationSelect's country field. */
export function CountrySelect({
  value,
  onChange,
  disabled,
  placeholder = "Search country...",
}: CountrySelectProps) {
  const countries = useMemo(() => Country.getAllCountries(), []);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={open ? search : value}
          disabled={disabled}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
            setSearch("");
          }}
          className="w-full h-12 pl-10 pr-10 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent disabled:bg-(--gray-50) disabled:cursor-not-allowed"
          autoComplete="off"
        />
        {!disabled && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        )}
      </div>
      {open && (
        <div className={PANEL_CLS}>
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-gray-400 sg-p-default">
              No countries found
            </p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.isoCode}
                type="button"
                onClick={() => {
                  onChange(c.name);
                  setSearch("");
                  setOpen(false);
                }}
                className={ITEM_CLS}
              >
                {c.flag} {c.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
