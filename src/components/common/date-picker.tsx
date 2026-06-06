"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disablePast?: boolean;
  label?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  disablePast = true,
  label,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[13px] font-medium text-(--text-title)">
          {label}
        </label>
      )}
      <div className="relative" ref={ref}>
        {/* Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-2 w-full h-11 mt-1 px-3 border rounded-lg bg-white text-[14px] transition-colors ${
            disabled
              ? "border-(--gray-200) opacity-50 cursor-not-allowed"
              : "border-(--gray-200) cursor-pointer hover:bg-(--gray-50)"
          } ${open ? "ring-2 ring-(--primary-700)" : ""}`}
        >
          <CalendarDays className="w-4 h-4 text-(--gray-400) shrink-0" />
          <span
            className={`flex-1 text-left ${value ? "text-(--text-title)" : "text-(--gray-400)"}`}
          >
            {value ? format(value, "MMM d, yyyy") : placeholder}
          </span>
        </button>

        {/* Calendar dropdown */}
        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-(--gray-200) rounded-2xl shadow-xl p-3 w-72">
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(day) => {
                onChange(day);
                setOpen(false);
              }}
              disabled={disablePast ? { before: new Date() } : undefined}
              classNames={{
                root: "w-full",
                months: "w-full",
                month: "w-full",
                month_caption: "flex items-center justify-between px-1 pb-3",
                caption_label: "text-[14px] font-semibold text-(--text-title)",
                nav: "flex items-center gap-1",
                button_previous:
                  "w-7 h-7 flex items-center justify-center rounded-lg border border-(--gray-200) hover:bg-(--gray-100) cursor-pointer transition-colors text-(--gray-500)",
                button_next:
                  "w-7 h-7 flex items-center justify-center rounded-lg border border-(--gray-200) hover:bg-(--gray-100) cursor-pointer transition-colors text-(--gray-500)",
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday:
                  "flex-1 text-center text-[11px] font-semibold text-(--gray-400) uppercase py-1",
                week: "flex mt-1",
                day: "flex-1 flex items-center justify-center",
                day_button:
                  "w-8 h-8 rounded-lg text-[13px] cursor-pointer transition-colors hover:bg-(--primary-50) hover:text-(--primary-700) text-(--text-title) font-normal",
                selected:
                  "[&>button]:bg-(--primary-700) [&>button]:text-white [&>button]:font-semibold [&>button]:hover:bg-(--primary-700)",
                today:
                  "[&>button]:border [&>button]:border-(--primary-400) [&>button]:text-(--primary-700) [&>button]:font-semibold",
                disabled:
                  "[&>button]:text-(--gray-300) [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent [&>button]:hover:text-(--gray-300)",
                outside: "[&>button]:text-(--gray-300)",
              }}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
