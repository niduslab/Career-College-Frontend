"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Pencil, Eye, Archive, RotateCcw } from "lucide-react";
import type { CourseStatus } from "./types";

interface ActionMenuProps {
  open: boolean;
  onToggle: () => void;
  setRef: (el: HTMLDivElement | null) => void;
  status: CourseStatus;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRework: () => void;
  busy?: boolean;
}

export default function CourseActionMenu({
  open,
  onToggle,
  setRef,
  status,
  onView,
  onEdit,
  onArchive,
  onRework,
  busy,
}: ActionMenuProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const MENU_HEIGHT = 160;

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < MENU_HEIGHT + 12
      ? rect.top - MENU_HEIGHT - 6
      : rect.bottom + 4;
    setCoords({ top, right: window.innerWidth - rect.right });
  }, [open]);

  const items = [
    { icon: Eye, label: "View / Manage", onClick: onView },
    ...(status === "draft" || status === "rejected"
      ? [{ icon: Pencil, label: "Edit Content", onClick: onEdit }]
      : []),
    ...(status === "published"
      ? [{ icon: Archive, label: "Archive", onClick: onArchive, danger: true }]
      : []),
    ...(status === "archived"
      ? [{ icon: RotateCcw, label: "Rework", onClick: onRework }]
      : []),
  ];

  return (
    <div ref={setRef} className="relative">
      <button
        ref={btnRef}
        onClick={onToggle}
        disabled={busy}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) hover:text-(--gray-600) cursor-pointer transition-colors disabled:opacity-50"
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open &&
        createPortal(
          <div
            data-action-portal
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}
            className="bg-white border border-(--gray-200) rounded-xl shadow-lg py-1 min-w-40"
          >
            {items.map(({ icon: Icon, label, danger, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] cursor-pointer transition-colors ${
                  danger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-(--gray-600) hover:bg-(--gray-50) hover:text-(--text-title)"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
