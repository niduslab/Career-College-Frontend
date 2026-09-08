"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  ExternalLink,
  Download,
  ShieldX,
  RotateCcw,
  Loader2,
} from "lucide-react";

import {
  certificateDownloadUrl,
  certificateVerifyPath,
  type AdminCertificate,
} from "@/lib/certificates-api";

interface RowActionsMenuProps {
  certificate: AdminCertificate;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  setRef: (el: HTMLDivElement | null) => void;
  /** Opens the table's revoke/restore modal — this menu never mutates itself. */
  onRevoke: () => void;
  onRestore: () => void;
}

const MENU_HEIGHT = 118; // 3 rows

export default function RowActionsMenu({
  certificate,
  open,
  busy,
  onToggle,
  setRef,
  onRevoke,
  onRestore,
}: RowActionsMenuProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const reposition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    // Flip above the button when there is no room below it.
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < MENU_HEIGHT + 12
        ? rect.top - MENU_HEIGHT - 6
        : rect.bottom + 4;
    setCoords({ top, right: window.innerWidth - rect.right });
  };

  const handleToggle = () => {
    if (!open) reposition();
    onToggle();
  };

  const isRevoked = certificate.status === "revoked";
  const itemClass =
    "group w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-(--gray-700) hover:bg-(--gray-50) transition-colors cursor-pointer";

  return (
    <div ref={setRef} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={busy}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 ${
          open
            ? "bg-(--primary-50) text-(--primary-600) shadow-sm"
            : "text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600)"
        }`}
        aria-label="Row actions"
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
            className="animate-menu-in origin-top-right bg-white border border-(--gray-200) rounded-xl shadow-xl py-1.5 min-w-48 text-left overflow-hidden"
          >
            <a
              href={certificateVerifyPath(certificate)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onToggle}
              className={itemClass}
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-50 text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
              Public verify page
            </a>

            <a
              href={certificateDownloadUrl(certificate.certificate_uid)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onToggle}
              className={itemClass}
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-purple-50 text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
                <Download className="w-3.5 h-3.5" />
              </span>
              Download PDF
            </a>

            <div className="my-1 border-t border-dashed border-(--gray-100)" />

            {isRevoked ? (
              <button
                onClick={() => {
                  onToggle();
                  onRestore();
                }}
                className="group w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 rounded-md flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-3.5 h-3.5" />
                </span>
                Restore
              </button>
            ) : (
              <button
                onClick={() => {
                  onToggle();
                  onRevoke();
                }}
                className="group w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 rounded-md flex items-center justify-center bg-red-50 text-red-600 shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldX className="w-3.5 h-3.5" />
                </span>
                Revoke
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}