"use client";

import { useState } from "react";
import { X, Loader2, ShieldX } from "lucide-react";

import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import type { AdminCertificate } from "@/lib/certificates-api";

interface RevokeModalProps {
  certificate: AdminCertificate;
  submitting: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/**
 * Revoke confirmation with a required reason.
 *
 * Plain textarea rather than the RichTextEditor the verification modals use:
 * this reason is stored on the certificate and copied into the audit log, both
 * plain-text fields, and it is read back in a table cell where markup would
 * only get in the way.
 */
export default function RevokeModal({
  certificate,
  submitting,
  onConfirm,
  onClose,
}: RevokeModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useLockBodyScroll();

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("A reason is required.");
      return;
    }
    onConfirm(trimmed);
  };

  const label = certificate.certificate_id ?? certificate.certificate_uid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <ShieldX className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[16px] font-semibold text-(--text-title)">
              Revoke certificate
            </h3>
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
          <p className="text-[13px] text-(--gray-600) leading-relaxed">
            <span className="font-semibold text-(--text-title)">{label}</span> —{" "}
            {certificate.learner_name}, {certificate.course_title}.
          </p>
          <p className="text-[12px] text-(--gray-500) mt-2 leading-relaxed">
            Public verification will report this credential as no longer valid.
            The issued record itself is kept intact, and the revocation can be
            lifted later.
          </p>

          <label className="block text-[13px] font-medium text-(--text-title) mt-4 mb-1.5">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            rows={3}
            maxLength={500}
            autoFocus
            placeholder="e.g. Issued in error — learner did not complete the assessment."
            className={`w-full px-3 py-2.5 text-[14px] border rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none ${
              error ? "border-red-400" : "border-(--gray-200)"
            }`}
          />
          {error ? (
            <p className="text-[12px] text-red-500 mt-1">{error}</p>
          ) : (
            <p className="text-[12px] text-(--gray-400) mt-1">
              Recorded in the audit log. {500 - reason.length} characters left.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-10 px-4 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="h-10 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Revoking…
              </>
            ) : (
              "Revoke certificate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}