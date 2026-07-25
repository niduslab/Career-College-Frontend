"use client";

import { X, Loader2, AlertTriangle } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface DeactivateModalProps {
  categoryName: string;
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeactivateModal({
  categoryName,
  submitting,
  onConfirm,
  onClose,
}: DeactivateModalProps) {
  useLockBodyScroll();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[16px] font-semibold text-(--text-title)">Deactivate Category</h3>
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
          <p className="text-[13px] text-(--gray-600)">
            Deactivate <span className="font-semibold text-(--text-title)">&quot;{categoryName}&quot;</span>?
            It will be hidden from the public category filter. This can be reversed later from the database if needed.
          </p>
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
            className="h-9 px-4 rounded-lg text-[13px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Deactivating…" : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}
