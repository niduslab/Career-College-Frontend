"use client";

import { useRef, useEffect } from "react";
import { Search, ChevronDown, Download, Loader2 } from "lucide-react";

const DELIVERY_MODES = ["self_paced", "scheduled"] as const;
type DeliveryModeFilter = (typeof DELIVERY_MODES)[number];

const DELIVERY_MODE_LABEL: Record<DeliveryModeFilter, string> = {
  self_paced: "Self-paced",
  scheduled: "Scheduled",
};

interface ApprovalsFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  deliveryMode: DeliveryModeFilter | "All";
  onDeliveryModeChange: (v: DeliveryModeFilter | "All") => void;
  deliveryModeOpen: boolean;
  onDeliveryModeToggle: () => void;
  onExport?: () => void;
  exporting?: boolean;
}

export default function ApprovalsFilterBar({
  search,
  onSearchChange,
  deliveryMode,
  onDeliveryModeChange,
  deliveryModeOpen,
  onDeliveryModeToggle,
  onExport,
  exporting,
}: ApprovalsFilterBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!deliveryModeOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDeliveryModeToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [deliveryModeOpen, onDeliveryModeToggle]);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1 min-w-0">
        <Search className="w-4 h-4 text-(--gray-400) absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by course or instructor..."
          className="lg:w-62.5 w-full h-9 pl-9 pr-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative" ref={ref}>
          <button
            onClick={onDeliveryModeToggle}
            className="text-[12px] cursor-pointer text-(--gray-600) border border-(--gray-200) rounded-lg px-3 py-2 flex items-center gap-1.5 hover:bg-(--gray-50) transition-colors"
          >
            {deliveryMode === "All" ? "Delivery Mode" : DELIVERY_MODE_LABEL[deliveryMode]}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${deliveryModeOpen ? "rotate-180" : ""}`}
            />
          </button>
          {deliveryModeOpen && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1 min-w-36">
              <button
                onClick={() => onDeliveryModeChange("All")}
                className={`w-full text-left px-3 py-2 cursor-pointer text-[12px] transition-colors ${
                  deliveryMode === "All"
                    ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                    : "text-(--gray-600) hover:bg-(--gray-50)"
                }`}
              >
                All Delivery Modes
              </button>
              {DELIVERY_MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => onDeliveryModeChange(m)}
                  className={`w-full text-left px-3 py-2 cursor-pointer text-[12px] transition-colors ${
                    m === deliveryMode
                      ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                      : "text-(--gray-600) hover:bg-(--gray-50)"
                  }`}
                >
                  {DELIVERY_MODE_LABEL[m]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onExport}
          disabled={exporting}
          className="text-[12px] cursor-pointer font-medium text-(--gray-600) border border-(--gray-200) rounded-lg px-3 py-2 flex items-center gap-1.5 hover:bg-(--gray-50) transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exporting ? "Exporting…" : "Export"}
        </button>
      </div>
    </div>
  );
}
