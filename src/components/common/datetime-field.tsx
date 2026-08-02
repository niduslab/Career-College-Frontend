"use client";

import { format } from "date-fns";
import DatePicker from "@/components/common/date-picker";

/** ISO datetime -> "yyyy-MM-ddTHH:mm" for a datetime-local-shaped value. */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

/** datetime-local string -> the Date part, for the calendar picker. */
function localInputToDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** datetime-local string -> the time part, for the time input. */
function localInputToTime(value: string): string {
  if (!value) return "";
  const [, timePart] = value.split("T");
  return timePart ?? "";
}

/** Combine a picked date with a time-input value into a datetime-local string. */
function combineDateAndTime(date: Date | undefined, time: string): string {
  if (!date) return "";
  return `${format(date, "yyyy-MM-dd")}T${time || "00:00"}`;
}

interface DateTimeFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  optional?: boolean;
  required?: boolean;
  onClear?: () => void;
  disabled?: boolean;
  disablePast?: boolean;
}

/** Custom DatePicker (date-only) paired with a native time input, combined into one datetime-local string. */
export default function DateTimeField({
  label,
  value,
  onChange,
  error,
  optional,
  required,
  onClear,
  disabled,
  disablePast = false,
}: DateTimeFieldProps) {
  return (
    <div>
      <label className="block text-[12px] md:text-[14px] lg:text-[14px] font-medium text-(--text-title) mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}{" "}
        {optional && (
          <span className="text-(--gray-400) font-normal">
            (optional — open-ended if blank)
          </span>
        )}
      </label>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <DatePicker
            value={localInputToDate(value)}
            onChange={(date) =>
              onChange(combineDateAndTime(date, localInputToTime(value)))
            }
            placeholder="Pick a date"
            disabled={disabled}
            disablePast={disablePast}
            captionDropdown
            fromYear={new Date().getFullYear() - 1}
            toYear={new Date().getFullYear() + 5}
          />
        </div>
        <input
          type="time"
          value={localInputToTime(value)}
          disabled={disabled}
          onChange={(e) =>
            onChange(
              combineDateAndTime(localInputToDate(value), e.target.value),
            )
          }
          className={`h-11 mt-1 px-3 text-[14px] cursor-pointer border rounded-lg outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-red-300" : "border-(--gray-200)"
          }`}
        />
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 mt-1 h-11 px-3 text-[14px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
