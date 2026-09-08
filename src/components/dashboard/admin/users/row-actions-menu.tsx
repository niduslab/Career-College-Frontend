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
            <button
              onClick={handleViewProfile}
              className="group w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-(--gray-700) hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-50 text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                <Eye className="w-3.5 h-3.5" />
              </span>
              View profile
            </button>

            <button
              onClick={handleToggleRoleMenu}
              className="group w-full flex items-center justify-between gap-2.5 px-3 py-2.5 text-[13px] font-medium text-(--gray-700) hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md flex items-center justify-center bg-purple-50 text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                Change role
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-(--gray-400) transition-transform duration-200 ${roleMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {roleMenuOpen && (
              <div className="animate-menu-in bg-(--gray-50) py-1 border-y border-(--gray-100)">
                {ROLES.filter((r) => r !== user.role).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleChangeRole(r)}
                    className="w-full text-left pl-11 pr-3 py-2 text-[12px] font-medium text-(--gray-600) hover:bg-white hover:text-(--primary-600) transition-colors cursor-pointer"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            <div className="my-1 border-t border-dashed border-(--gray-100)" />

            <button
              onClick={handleToggleSuspend}
              className="group w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-orange-50 text-orange-600 shrink-0 group-hover:scale-105 transition-transform">
                <Ban className="w-3.5 h-3.5" />
              </span>
              {user.status === "Suspended" ? "Reinstate" : "Suspend"}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
