"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker, type DropdownProps } from "react-day-picker";
import { format } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";

function CalendarDropdown({ options, value, onChange }: DropdownProps) {
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

  const selectedLabel = options?.find((o) => o.value === value)?.label;

  const pick = (optionValue: string | number) => {
    onChange?.({
      target: { value: String(optionValue) },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-9 pl-3 pr-2 flex items-center justify-between gap-1 text-[13px] font-medium border border-(--gray-200) rounded-lg bg-white text-(--text-title) cursor-pointer outline-none hover:border-(--primary-400) focus:ring-2 focus:ring-(--primary-700) transition-colors"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-(--gray-400) shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-28 max-h-56 overflow-y-auto bg-white border border-(--gray-200) rounded-xl shadow-lg py-1">
          {options?.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => pick(opt.value)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[13px] text-left transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  active
                    ? "bg-(--primary-50) text-(--primary-700) font-medium"
                    : "text-(--gray-600) hover:bg-(--gray-50)"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {active && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
  label?: string;

  captionDropdown?: boolean;
  fromYear?: number;
  toYear?: number;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  disablePast = true,
  disableFuture = false,
  label,
  captionDropdown = false,
  fromYear,
  toYear,
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
              defaultMonth={value}
              onSelect={(day) => {
                onChange(day);
                setOpen(false);
              }}
              captionLayout={captionDropdown ? "dropdown" : "label"}
              hideNavigation={captionDropdown}
              startMonth={
                captionDropdown
                  ? new Date(fromYear ?? new Date().getFullYear() - 100, 0)
                  : undefined
              }
              endMonth={
                captionDropdown
                  ? new Date(toYear ?? new Date().getFullYear(), 11)
                  : undefined
              }
              disabled={
                disablePast
                  ? { before: new Date() }
                  : disableFuture
                    ? { after: new Date() }
                    : undefined
              }
              classNames={{
                root: "w-full",
                months: "w-full",
                month: "w-full",
                month_caption: "flex items-center gap-2 px-0.5 pb-3",
                caption_label: captionDropdown
                  ? "sr-only"
                  : "flex-1 text-center text-[14px] font-semibold text-(--text-title)",
                dropdowns: "flex items-center gap-2 flex-1",
                nav: "flex items-center gap-1",
                button_previous:
                  "w-8 h-8 flex items-center justify-center rounded-lg border border-(--gray-200) hover:bg-(--primary-50) hover:border-(--primary-400) hover:text-(--primary-700) cursor-pointer transition-colors text-(--gray-500) disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-(--gray-200) disabled:hover:text-(--gray-500)",
                button_next:
                  "w-8 h-8 flex items-center justify-center rounded-lg border border-(--gray-200) hover:bg-(--primary-50) hover:border-(--primary-400) hover:text-(--primary-700) cursor-pointer transition-colors text-(--gray-500) disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-(--gray-200) disabled:hover:text-(--gray-500)",
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday:
                  "flex-1 text-center text-[11px] font-semibold text-(--gray-400) uppercase py-1.5",
                week: "flex mt-1",
                day: "flex-1 flex items-center justify-center",
                day_button:
                  "w-9 h-9 rounded-lg text-[13px] cursor-pointer transition-colors hover:bg-(--primary-50) hover:text-(--primary-700) text-(--text-title) font-normal",
                selected:
                  "[&>button]:bg-(--primary-700) [&>button]:text-white [&>button]:font-semibold [&>button]:hover:bg-(--primary-700) [&>button]:hover:text-white",
                today:
                  "[&>button]:border [&>button]:border-(--primary-400) [&>button]:text-(--primary-700) [&>button]:font-semibold",
                disabled:
                  "[&>button]:text-(--gray-300) [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent [&>button]:hover:text-(--gray-300)",
                outside: "[&>button]:text-(--gray-300)",
              }}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  ),
                Dropdown: CalendarDropdown,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
