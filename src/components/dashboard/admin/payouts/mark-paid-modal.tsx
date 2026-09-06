"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface MarkPaidModalProps {
  recipientName: string;
  netAmount: string;
  currency: string;
  submitting: boolean;
  onConfirm: (paymentReference: string) => void;
  onClose: () => void;
}

export default function MarkPaidModal({
  recipientName,
  netAmount,
  currency,
  submitting,
  onConfirm,
  onClose,
}: MarkPaidModalProps) {
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  useLockBodyScroll();

  const handleConfirm = () => {
    if (!reference.trim()) {
      setError("A payment reference is required for reconciliation.");
      return;
    }
    onConfirm(reference);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[16px] font-semibold text-(--text-title)">Mark Payout Paid</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <p className="text-[13px] text-(--gray-600)">
            Confirm you have manually transferred{" "}
            <span className="font-semibold text-(--text-title)">
              {currency} {netAmount}
            </span>{" "}
            to <span className="font-semibold text-(--text-title)">{recipientName}</span> via
            bank transfer or mobile banking, then record the transaction reference below.
          </p>
          <div>
            <label className="block text-[12px] font-medium text-(--gray-600) mb-1.5">
              Payment Reference
            </label>
            <input
              value={reference}
              onChange={(e) => {
                setReference(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Bank transaction ID or bKash TrxID"
              className="w-full h-9 px-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
            />
            {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
          </div>
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
            className="h-9 px-4 rounded-lg text-[13px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Saving…" : "Mark Paid"}
          </button>
        </div>
      </div>
    </div>
  );
}
