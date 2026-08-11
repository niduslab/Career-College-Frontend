"use client";

import { useState } from "react";
import { Loader2, Eye } from "lucide-react";
import StatusBadge from "./status-badge";
import ReasonModal from "./reason-modal";
import VerificationActionsMenu from "./verification-actions-menu";
import VerificationDetailModal from "./verification-detail-modal";
import {
  useIdentityVerifications,
  useReviewIdentityVerification,
} from "@/hooks/use-admin-verification";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";
import type { IdentityVerificationRow } from "@/lib/admin-verification-api";

export default function IdentityVerificationTable() {
  const { data, isLoading, isError } = useIdentityVerifications();
  const review = useReviewIdentityVerification();
  const [modal, setModal] = useState<{
    row: IdentityVerificationRow;
    kind: "reject" | "request_action";
  } | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const rows = data?.results ?? [];

  const handlePickUp = (row: IdentityVerificationRow) => {
    review.mutate(
      { id: row.id, action: "pick_up" },
      {
        onSuccess: () =>
          notify.success(`${row.instructor_name}'s verification picked up.`),
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.detail : "Failed to pick up.",
          ),
      },
    );
  };

  const handleApprove = (row: IdentityVerificationRow) => {
    review.mutate(
      { id: row.id, action: "approve" },
      {
        onSuccess: () => notify.success(`${row.instructor_name} verified.`),
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.detail : "Failed to approve.",
          ),
      },
    );
  };

  const handleModalConfirm = (reason: string) => {
    if (!modal) return;
    const { row, kind } = modal;
    review.mutate(
      {
        id: row.id,
        action: kind,
        ...(kind === "reject"
          ? { rejectionReason: reason }
          : { actionRequiredReason: reason }),
      },
      {
        onSuccess: () => {
          notify.success(
            kind === "reject"
              ? `${row.instructor_name}'s verification rejected.`
              : `Action requested from ${row.instructor_name}.`,
          );
          setModal(null);
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.detail : "Failed to submit.",
          ),
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-(--gray-100)">
              <th className="text-[11px] font-semibold truncate tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Instructor
              </th>
              <th className="text-[11px] font-semibold truncate tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Document Type
              </th>
              <th className="text-[11px] font-semibold truncate tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Country
              </th>
              <th className="text-[11px] font-semibold truncate tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Status
              </th>
              <th className="text-[11px] font-semibold truncate tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Submitted
              </th>
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                Action
              </th>
              <th className="w-9 pb-2 pl-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-(--gray-50)">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-[13px] text-(--gray-400)"
                >
                  <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                  Loading verifications…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-[13px] text-red-500"
                >
                  Failed to load verifications.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-[13px] text-(--gray-400)"
                >
                  No identity verifications submitted yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const busy =
                  review.isPending && review.variables?.id === row.id;
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-(--gray-50) transition-colors"
                  >
                    <td className="py-3 pr-8">
                      <button
                        type="button"
                        onClick={() => setDetailId(row.id)}
                        className="text-left cursor-pointer hover:opacity-80"
                      >
                        <p className="text-[13px] font-semibold text-(--text-title) truncate">
                          {row.instructor_name}
                        </p>
                        <p className="text-[11px] text-(--gray-400) truncate">
                          {row.instructor_email}
                        </p>
                      </button>
                    </td>
                    <td className="py-3 pr-8 text-[13px] text-(--gray-600) capitalize">
                      {row.document_type.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 pr-8 text-[13px] text-(--gray-600)">
                      {row.issuing_country}
                    </td>
                    <td className="py-3 pr-8">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 pr-8 text-[13px] text-(--gray-600) whitespace-nowrap">
                      {row.submitted_at?.slice(0, 10) ?? "—"}
                    </td>
                    <td className="py-3 text-right">
                      <VerificationActionsMenu
                        status={row.status}
                        busy={busy}
                        onPickUp={() => handlePickUp(row)}
                        onApprove={() => handleApprove(row)}
                        onReject={() => setModal({ row, kind: "reject" })}
                        onRequestAction={() =>
                          setModal({ row, kind: "request_action" })
                        }
                      />
                    </td>
                    <td className="py-3 pl-3">
                      <button
                        type="button"
                        onClick={() => setDetailId(row.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer"
                        aria-label="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <ReasonModal
          title={
            modal.kind === "reject" ? "Reject Verification" : "Request Action"
          }
          description={
            modal.kind === "reject"
              ? `Explain why ${modal.row.instructor_name}'s verification is being rejected.`
              : `Explain what ${modal.row.instructor_name} needs to fix and resubmit.`
          }
          confirmLabel={modal.kind === "reject" ? "Reject" : "Request Action"}
          submitting={review.isPending}
          onConfirm={handleModalConfirm}
          onClose={() => setModal(null)}
        />
      )}

      {detailId !== null && (
        <VerificationDetailModal
          kind="identity"
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
