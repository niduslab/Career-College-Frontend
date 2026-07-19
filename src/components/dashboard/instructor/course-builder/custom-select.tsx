"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";

export default function CustomSelect({
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
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(
    ref,
    useCallback(() => setOpen(false), []),
  );

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-[13px] font-medium text-(--text-title)">
        {label}
      </label>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full h-12 px-3 rounded-lg cursor-pointer border border-(--gray-200) bg-white text-[14px] text-(--gray-500) focus:outline-none focus:ring-2 focus:ring-(--primary-700) text-left flex items-center justify-between transition-shadow"
        >
          <span className={value ? "text-(--text-title)" : "text-(--gray-400)"}>
            {value || `Select ${label.toLowerCase()}`}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-(--gray-500) pointer-events-none" />
          ) : (
            <ChevronDown className="w-4 h-4 text-(--gray-500) pointer-events-none" />
          )}
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-[14px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors hover:bg-purple-50 ${
                  opt === value
                    ? "bg-purple-50 text-(--primary-700) font-medium"
                    : "text-gray-500"
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
