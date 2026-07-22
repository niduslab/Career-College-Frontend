"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Eye,
  ShieldCheck,
  Ban,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";
import {
  useSuspendUser,
  useReactivateUser,
  useChangeUserRole,
} from "@/hooks/use-admin-users";
import { PlatformUser, ROLE_TO_USER_TYPE, ROLES, UserRole } from "./data";

interface RowActionsMenuProps {
  user: PlatformUser;
  open: boolean;
  onToggle: () => void;
  setRef: (el: HTMLDivElement | null) => void;
}

const MENU_HEIGHT_CLOSED = 154; // 4 rows
const MENU_HEIGHT_ROLE_OPEN = 268; // + 3 role rows

export default function RowActionsMenu({
  user,
  open,
  onToggle,
  setRef,
}: RowActionsMenuProps) {
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const suspend = useSuspendUser();
  const reactivate = useReactivateUser();
  const changeRole = useChangeUserRole();

  const reposition = (roleOpen: boolean) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const height = roleOpen ? MENU_HEIGHT_ROLE_OPEN : MENU_HEIGHT_CLOSED;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < height + 12 ? rect.top - height - 6 : rect.bottom + 4;
    setCoords({ top, right: window.innerWidth - rect.right });
  };

  const handleToggleMenu = () => {
    if (!open) reposition(false);
    setRoleMenuOpen(false);
    onToggle();
  };

  const handleToggleRoleMenu = () => {
    const next = !roleMenuOpen;
    setRoleMenuOpen(next);
    reposition(next);
  };

  const close = () => {
    onToggle();
    setRoleMenuOpen(false);
  };

  const handleViewProfile = () => {
    close();
    router.push(`/dashboard/admin/users/${user.id}`);
  };

  const handleToggleSuspend = () => {
    close();
    if (user.status === "Suspended") {
      reactivate.mutate(user.id, {
        onSuccess: () => notify.success(`${user.name} reactivated.`),
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.detail : "Failed to reactivate user.",
          ),
      });
    } else {
      suspend.mutate(
        { id: user.id },
        {
          onSuccess: () => notify.success(`${user.name} suspended.`),
          onError: (err) =>
            notify.error(
              err instanceof ApiError ? err.detail : "Failed to suspend user.",
            ),
        },
      );
    }
  };

  const handleChangeRole = (role: UserRole) => {
    close();
    changeRole.mutate(
      { id: user.id, user_type: ROLE_TO_USER_TYPE[role] },
      {
        onSuccess: () =>
          notify.success(`${user.name}'s role changed to ${role}.`),
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.detail : "Failed to change role.",
          ),
      },
    );
  };

  const busy =
    suspend.isPending || reactivate.isPending || changeRole.isPending;

  return (
    <div ref={setRef} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleToggleMenu}
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
            <button
              onClick={handleViewProfile}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View profile
            </button>

            <button
              onClick={handleToggleRoleMenu}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[12px] text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Change role
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${roleMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {roleMenuOpen && (
              <div className="bg-(--gray-50) py-1">
                {ROLES.filter((r) => r !== user.role).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleChangeRole(r)}
                    className="w-full text-left pl-8 pr-3 py-2 text-[12px] text-(--gray-600) hover:bg-(--gray-100) transition-colors cursor-pointer"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleToggleSuspend}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              {user.status === "Suspended" ? "Reinstate" : "Suspend"}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
