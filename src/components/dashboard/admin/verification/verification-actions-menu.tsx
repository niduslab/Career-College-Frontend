"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Eye, PlayCircle, Check, X, AlertCircle, Loader2 } from "lucide-react";
import type { VerificationStatus } from "@/lib/admin-verification-api";

interface VerificationActionsMenuProps {
  status: VerificationStatus;
  busy: boolean;
  onView: () => void;
  onPickUp: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestAction: () => void;
}

const MENU_HEIGHT = 192;

export default function VerificationActionsMenu({
  status,
  busy,
  onView,
  onPickUp,
  onApprove,
  onReject,
  onRequestAction,
}: VerificationActionsMenuProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

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

  const canPickUp = status === "submitted";
  const canDecide = status === "under_review";

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={busy}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Verification actions"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>
      {open &&
        createPortal(
          <div
            data-action-portal
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}
            className="bg-white border border-(--gray-200) rounded-xl shadow-lg py-1 min-w-44 text-left"
          >
            <button
              onClick={() => runAction(onView)}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View details
            </button>
            {canPickUp && (
              <button
                onClick={() => runAction(onPickUp)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Pick up for review
              </button>
            )}
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
                  onClick={() => runAction(onRequestAction)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Request action
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
          </div>,
          document.body,
        )}
    </div>
  );
}
