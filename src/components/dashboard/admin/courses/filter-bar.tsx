"use client";

import { useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import type { CourseStatus, DeliveryMode } from "@/lib/admin-courses-api";

const STATUS_OPTIONS: CourseStatus[] = [
  "draft",
  "institution_review",
  "under_review",
  "published",
  "rejected",
  "archived",
];

const STATUS_LABEL: Record<CourseStatus, string> = {
  draft: "Draft",
  institution_review: "Institution Review",
  under_review: "Under Review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

const DELIVERY_MODE_OPTIONS: DeliveryMode[] = ["self_paced", "scheduled"];

const DELIVERY_MODE_LABEL: Record<DeliveryMode, string> = {
  self_paced: "Self-paced",
  scheduled: "Scheduled",
};

interface FilterDropdownProps<T extends string> {
  label: string;
  value: T | "";
  options: T[];
  optionLabel: Record<T, string>;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: T | "") => void;
}

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  optionLabel,
  open,
  onToggle,
  onSelect,
}: FilterDropdownProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onToggle]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="text-[12px] cursor-pointer text-(--gray-600) border border-(--gray-200) rounded-lg px-3 py-2 flex items-center gap-1.5 hover:bg-(--gray-50) transition-colors"
      >
        {value === "" ? label : optionLabel[value]}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1 min-w-40">
          <button
            onClick={() => onSelect("")}
            className={`w-full text-left px-3 py-2 cursor-pointer text-[12px] transition-colors ${
              value === ""
                ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                : "text-(--gray-600) hover:bg-(--gray-50)"
            }`}
          >
            All {label}
          </button>
          {options.map((o) => (
            <button
              key={o}
              onClick={() => onSelect(o)}
              className={`w-full text-left px-3 py-2 cursor-pointer text-[12px] transition-colors ${
                o === value
                  ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                  : "text-(--gray-600) hover:bg-(--gray-50)"
              }`}
            >
              {optionLabel[o]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CoursesFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: CourseStatus | "";
  onStatusChange: (v: CourseStatus | "") => void;
  deliveryMode: DeliveryMode | "";
  onDeliveryModeChange: (v: DeliveryMode | "") => void;
  statusOpen: boolean;
  onStatusToggle: () => void;
  deliveryModeOpen: boolean;
  onDeliveryModeToggle: () => void;
}

export default function CoursesFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  deliveryMode,
  onDeliveryModeChange,
  statusOpen,
  onStatusToggle,
  deliveryModeOpen,
  onDeliveryModeToggle,
}: CoursesFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1 min-w-0">
        <Search className="w-4 h-4 text-(--gray-400) absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by course title..."
          className="lg:w-62.5 w-full h-9 pl-9 pr-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <FilterDropdown
          label="Status"
          value={status}
          options={STATUS_OPTIONS}
          optionLabel={STATUS_LABEL}
          open={statusOpen}
          onToggle={onStatusToggle}
          onSelect={onStatusChange}
        />
        <FilterDropdown
          label="Delivery Mode"
          value={deliveryMode}
          options={DELIVERY_MODE_OPTIONS}
          optionLabel={DELIVERY_MODE_LABEL}
          open={deliveryModeOpen}
          onToggle={onDeliveryModeToggle}
          onSelect={onDeliveryModeChange}
        />
      </div>
    </div>
  );
}
