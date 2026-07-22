"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Check, X, Loader2 } from "lucide-react";

interface ApprovalActionsMenuProps {
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const MENU_HEIGHT = 78; // 2 rows x ~38px

export default function ApprovalActionsMenu({
  busy,
  onApprove,
  onReject,
}: ApprovalActionsMenuProps) {
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

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={busy}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Approval actions"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>
      {open &&
        createPortal(
          <div
            data-action-portal
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}
            className="bg-white border border-(--gray-200) rounded-xl shadow-lg py-1 min-w-36 text-left"
          >
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
          </div>,
          document.body,
        )}
    </div>
  );
}
