"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import RichTextEditor from "@/components/common/rich-text-editor";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface ReasonModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  submitting: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

function isBlankHtml(html: string): boolean {
  return !html.replace(/<[^>]*>/g, "").trim();
}

export default function ReasonModal({
  title,
  description,
  confirmLabel,
  submitting,
  onConfirm,
  onClose,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useLockBodyScroll();

  const handleConfirm = () => {
    if (isBlankHtml(reason)) {
      setError("A reason is required.");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
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

        <div className="px-6 py-5 space-y-3">
          <p className="text-[13px] text-(--gray-600)">{description}</p>
          <div>
            <RichTextEditor
              value={reason}
              onChange={(html) => {
                setReason(html);
                if (error) setError("");
              }}
              placeholder="Explain the reason..."
              minHeight="120px"
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
            className="h-9 px-4 rounded-lg text-[13px] font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Submitting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
