"use client";

import { useState } from "react";
import { X, Loader2, Wallet } from "lucide-react";
import DatePicker from "@/components/common/date-picker";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { isoToDate, dateToIso } from "../../settings-shared/helpers";

interface GenerateModalProps {
  submitting: boolean;
  onConfirm: (periodStart: string, periodEnd: string) => void;
  onClose: () => void;
}

export default function GenerateModal({ submitting, onConfirm, onClose }: GenerateModalProps) {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [error, setError] = useState("");

  useLockBodyScroll();

  const handleConfirm = () => {
    if (!periodStart || !periodEnd) {
      setError("Both a start and end date are required.");
      return;
    }
    if (periodStart > periodEnd) {
      setError("Start date must be on or before the end date.");
      return;
    }
    onConfirm(periodStart, periodEnd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-(--primary-50) text-(--primary-600) flex items-center justify-center shrink-0">
              <Wallet className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[16px] font-semibold text-(--text-title)">Generate Payouts</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-[13px] text-(--gray-600)">
            Creates a pending payout for every verified account with revenue in this date
            range. Unverified accounts are skipped.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-(--gray-600) mb-1.5">
                Period Start
              </label>
              <DatePicker
                value={isoToDate(periodStart)}
                onChange={(d) => {
                  setPeriodStart(dateToIso(d));
                  if (error) setError("");
                }}
                placeholder="Select start date"
                disablePast={false}
                captionDropdown
                fromYear={2024}
                toYear={new Date().getFullYear() + 1}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-(--gray-600) mb-1.5">
                Period End
              </label>
              <DatePicker
                value={isoToDate(periodEnd)}
                onChange={(d) => {
                  setPeriodEnd(dateToIso(d));
                  if (error) setError("");
                }}
                placeholder="Select end date"
                disablePast={false}
                captionDropdown
                fromYear={2024}
                toYear={new Date().getFullYear() + 1}
              />
            </div>
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-9 px-4 rounded-lg text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="h-9 px-4 rounded-lg text-[13px] font-medium bg-(--primary-600) text-white hover:bg-(--primary-700) transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
