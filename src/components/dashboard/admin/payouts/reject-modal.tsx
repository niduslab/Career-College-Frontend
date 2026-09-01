"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface RejectModalProps {
  recipientName: string;
  submitting: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function RejectModal({
  recipientName,
  submitting,
  onConfirm,
  onClose,
}: RejectModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useLockBodyScroll();

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("A reason is required so the recipient knows why.");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[16px] font-semibold text-(--text-title)">Reject Payout</h3>
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
            Rejecting this payout for{" "}
            <span className="font-semibold text-(--text-title)">{recipientName}</span>. Explain
            why so it can be regenerated correctly next time.
          </p>
          <div>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Bank details out of date, please re-verify before regenerating."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all resize-none"
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
            className="h-9 px-4 rounded-lg text-[13px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Rejecting…" : "Reject Payout"}
          </button>
        </div>
      </div>
    </div>
  );
}
