"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";

interface DropdownOption<T> {
  value: T;
  label: string;
  /** When set, the row renders as a real <Link> (navigation, works with
   *  middle-click/open-in-new-tab) instead of a selection button. Use for
   *  nav-style dropdowns where each item is its own destination rather than
   *  a value to select. */
  href?: string;
}

interface SearchableDropdownProps<T extends string | number> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (v: T) => void;
  icon?: React.ComponentType<{ className?: string }>;
  minWidth?: string;
  /** Adds an in-menu filter box. Worth it once the list outgrows a glance —
   *  an instructor can own dozens of courses. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Which side the menu opens from. Right-align on filter bars near the
   *  right edge of a card so the menu doesn't overflow off-screen. */
  align?: "left" | "right";
  /** Fixed trigger text (e.g. "Categories") instead of the selected option's
   *  label — for nav-style dropdowns with no real "current selection". */
  triggerLabel?: string;
  /** Overrides the trigger button's classes entirely — for embedding this
   *  dropdown somewhere with different chrome (e.g. a navbar link) instead
   *  of the default bordered-select look. */
  triggerClassName?: string;
}

export function SearchableDropdown<T extends string | number>({
  value,
  options,
  onChange,
  icon: Icon,
  minWidth = "min-w-52",
  searchable = false,
  searchPlaceholder = "Search...",
  align = "left",
  triggerLabel,
  triggerClassName,
}: SearchableDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const current =
    triggerLabel ?? options.find((o) => o.value === value)?.label ?? "Select";

  const close = () => {
    setOpen(false);
    setFilter("");
  };

  const visible =
    searchable && filter.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(filter.trim().toLowerCase()),
        )
      : options;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className={
          triggerClassName ??
          "flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
        }
      >
        {Icon && <Icon className="w-3.5 h-3.5 text-(--gray-500) shrink-0" />}
        <span className="flex-1 text-left truncate">{current}</span>
        <ChevronDown
          className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div
            className={`absolute top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 flex flex-col ${minWidth} ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {searchable && (
              <div className="relative p-2 border-b border-(--gray-100) shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--gray-400)" />
                <input
                  autoFocus
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-8 pl-8 pr-2 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>
            )}
            <div className="py-1 max-h-64 overflow-y-auto">
              {visible.length === 0 && (
                <p className="px-4 py-3 text-[13px] text-(--gray-400)">
                  No matches.
                </p>
              )}
              {visible.map((o) =>
                o.href ? (
                  <Link
                    key={String(o.value)}
                    href={o.href}
                    onClick={close}
                    className={`block w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors truncate ${
                      o.value === value
                        ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                        : "text-(--gray-600) hover:bg-(--gray-50)"
                    }`}
                  >
                    {o.label}
                  </Link>
                ) : (
                  <button
                    key={String(o.value)}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      close();
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors truncate ${
                      o.value === value
                        ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                        : "text-(--gray-600) hover:bg-(--gray-50)"
                    }`}
                  >
                    {o.label}
                  </button>
                ),
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
