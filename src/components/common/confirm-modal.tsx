"use client";

import { X, Loader2, AlertTriangle } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface ConfirmModalProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  confirmingLabel?: string;
  submitting?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  confirmingLabel = "Working…",
  submitting = false,
  danger = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useLockBodyScroll();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                danger ? "bg-red-50 text-red-500" : "bg-(--primary-50) text-(--primary-600)"
              }`}
            >
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[16px] font-semibold text-(--text-title)">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-[13px] text-(--gray-600)">{message}</p>
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
            onClick={onConfirm}
            disabled={submitting}
            className={`h-9 px-4 rounded-lg text-[13px] font-medium text-white transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5 ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-(--primary-600) hover:bg-(--primary-700)"
            }`}
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
