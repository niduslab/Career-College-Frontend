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
    "w-full flex items-center gap-2 px-3 py-2 text-[12px] text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer";

  return (
    <div ref={setRef} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={busy}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer disabled:opacity-50"
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
            className="bg-white border border-(--gray-200) rounded-xl shadow-lg py-1 min-w-44 text-left"
          >
            <a
              href={certificateVerifyPath(certificate)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onToggle}
              className={itemClass}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Public verify page
            </a>

            <a
              href={certificateDownloadUrl(certificate.certificate_uid)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onToggle}
              className={itemClass}
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>

            {isRevoked ? (
              <button
                onClick={() => {
                  onToggle();
                  onRestore();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore
              </button>
            ) : (
              <button
                onClick={() => {
                  onToggle();
                  onRevoke();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <ShieldX className="w-3.5 h-3.5" />
                Revoke
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}