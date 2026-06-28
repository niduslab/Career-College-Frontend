"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Pencil, Eye, Trash2, UserPlus, Ban } from "lucide-react";

interface ActionMenuProps {
  open: boolean;
  onToggle: () => void;
  setRef: (el: HTMLDivElement | null) => void;
}

const MENU_HEIGHT = 190;

export default function CohortActionMenu({ open, onToggle, setRef }: ActionMenuProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < MENU_HEIGHT + 12 ? rect.top - MENU_HEIGHT - 6 : rect.bottom + 4;
    setCoords({ top, right: window.innerWidth - rect.right });
  }, [open]);

  const items = [
    { icon: Eye, label: "View Cohort" },
    { icon: Pencil, label: "Edit" },
    { icon: UserPlus, label: "Add Learner" },
    { icon: Ban, label: "Cancel Cohort", danger: true },
    { icon: Trash2, label: "Delete", danger: true },
  ];

  return (
    <div ref={setRef} className="relative">
      <button
        ref={btnRef}
        onClick={onToggle}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) hover:text-(--gray-600) cursor-pointer transition-colors"
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
            {items.map(({ icon: Icon, label, danger }) => (
              <button
                key={label}
                type="button"
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
