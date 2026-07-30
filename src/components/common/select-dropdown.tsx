"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
}

export function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {options.length === 0 && (
            <p className="px-4 py-3 text-gray-400 sg-p-default">
              No options available
            </p>
          )}
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0 cursor-pointer text-gray-500 sg-p-default"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
