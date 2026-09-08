"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Eye, Check, X, Loader2 } from "lucide-react";

interface ApprovalActionsMenuProps {
  busy: boolean;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const MENU_HEIGHT = 116;

export default function ApprovalActionsMenu({
  busy,
  onView,
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
    const insidePortal = !!(target as HTMLElement).closest?.(
      "[data-action-portal]",
    );
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
        spaceBelow < MENU_HEIGHT + 12
          ? rect.top - MENU_HEIGHT - 6
          : rect.bottom + 4;
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
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 ${
          open
            ? "bg-(--primary-50) text-(--primary-600) shadow-sm"
            : "text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600)"
        }`}
        aria-label="Approval actions"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreVertical className="w-4 h-4" />
        )}
      </button>
      {open &&
        createPortal(
          <div
            data-action-portal
            style={{
              position: "fixed",
              top: coords.top,
              right: coords.right,
              zIndex: 9999,
            }}
            className="animate-menu-in origin-top-right bg-white border border-(--gray-200) rounded-xl shadow-xl py-1.5 min-w-40 text-left overflow-hidden"
          >
            <button
              onClick={() => runAction(onView)}
              className="group w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-(--gray-700) hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-50 text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                <Eye className="w-3.5 h-3.5" />
              </span>
              View details
            </button>

            <div className="my-1 border-t border-dashed border-(--gray-100)" />

            <button
              onClick={() => runAction(onApprove)}
              className="group w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                <Check className="w-3.5 h-3.5" />
              </span>
              Approve
            </button>
            <button
              onClick={() => runAction(onReject)}
              className="group w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-red-50 text-red-500 shrink-0 group-hover:scale-105 transition-transform">
                <X className="w-3.5 h-3.5" />
              </span>
              Reject
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
