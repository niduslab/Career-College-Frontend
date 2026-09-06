"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Check, X, CheckCircle2, Loader2 } from "lucide-react";
import type { PayoutStatus } from "@/lib/admin-payouts-api";

interface PayoutActionsMenuProps {
  status: PayoutStatus;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onMarkPaid: () => void;
}

const MENU_HEIGHT = 116;

export default function PayoutActionsMenu({
  status,
  busy,
  onApprove,
  onReject,
  onMarkPaid,
}: PayoutActionsMenuProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const canDecide = status === "pending";
  const canMarkPaid = status === "approved";

  const closeOnOutsideClick = (e: MouseEvent) => {
    const target = e.target as Node;
    const insideWrapper = wrapperRef.current?.contains(target) ?? false;
    const insidePortal = !!(target as HTMLElement).closest?.("[data-action-portal]");
    if (!insideWrapper && !insidePortal) {
      setOpen(false);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    }
  };

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow < MENU_HEIGHT + 12 ? rect.top - MENU_HEIGHT - 6 : rect.bottom + 4;
      setCoords({ top, right: window.innerWidth - rect.right });
      document.addEventListener("mousedown", closeOnOutsideClick);
    }
    setOpen((v) => !v);
  };

  const runAction = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  if (!canDecide && !canMarkPaid) {
    return <span className="text-[12px] text-(--gray-400)">—</span>;
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={busy}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Payout actions"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>
      {open &&
        createPortal(
          <div
            data-action-portal
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}
            className="bg-white border border-(--gray-200) rounded-xl shadow-lg py-1 min-w-40 text-left"
          >
            {canDecide && (
              <>
                <button
                  onClick={() => runAction(onApprove)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => runAction(onReject)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
              </>
            )}
            {canMarkPaid && (
              <button
                onClick={() => runAction(onMarkPaid)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Paid
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
