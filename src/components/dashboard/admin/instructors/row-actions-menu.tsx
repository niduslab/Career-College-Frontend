"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Eye, ShieldCheck, Ban, Trash2 } from "lucide-react";
import { Instructor } from "./data";

interface RowActionsMenuProps {
  instructor: Instructor;
  open: boolean;
  onToggle: () => void;
  setRef: (el: HTMLDivElement | null) => void;
  onView?: (instructor: Instructor) => void;
  onVerify?: (instructor: Instructor) => void;
  onToggleSuspend?: (instructor: Instructor) => void;
  onDelete?: (instructor: Instructor) => void;
}

const MENU_HEIGHT = 154; // 4 items x ~38px

export default function RowActionsMenu({
  instructor,
  open,
  onToggle,
  setRef,
  onView,
  onVerify,
  onToggleSuspend,
  onDelete,
}: RowActionsMenuProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < MENU_HEIGHT + 12 ? rect.top - MENU_HEIGHT - 6 : rect.bottom + 4;
    setCoords({ top, right: window.innerWidth - rect.right });
  }, [open]);

  const runAction = (fn?: (instructor: Instructor) => void) => {
    onToggle();
    fn?.(instructor);
  };

  return (
    <div ref={setRef} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={onToggle}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer"
        aria-label="Row actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open &&
        createPortal(
          <div
            data-action-portal
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}
            className="bg-white border border-(--gray-200) rounded-xl shadow-lg py-1 min-w-40 text-left"
          >
            <button
              onClick={() => runAction(onView)}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View profile
            </button>
            {instructor.status === "Pending" && (
              <button
                onClick={() => runAction(onVerify)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Verify
              </button>
            )}
            <button
              onClick={() => runAction(onToggleSuspend)}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              {instructor.status === "Suspended" ? "Reinstate" : "Suspend"}
            </button>
            <button
              onClick={() => runAction(onDelete)}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
