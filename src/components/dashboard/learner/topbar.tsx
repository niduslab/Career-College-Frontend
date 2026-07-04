"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Menu,
  ChevronDown,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { getMyProfile } from "@/lib/profile-api";
import { useAuth } from "@/lib/use-auth";
import { mediaUrl, initialsOf } from "./settings/helpers";

// Map a backend user_type.
const ROLE_LABELS: Record<string, string> = {
  learner: "Learner",
  instructor: "Instructor",
  partner_institution: "Institution",
};

export default function LearnerTopbar() {
  const { logout } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = () => {
    window.dispatchEvent(new Event("toggleLearnerSidebar"));
  };

  // Load the current user's name / role / photo for the header.
  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((data) => {
        if (!active) return;
        setName(data.user.full_name);
        setRole(ROLE_LABELS[data.user.user_type] ?? data.user.user_type);
        setPhoto(data.profile.profile_photo);
      })
      .catch(() => {
        /* header just falls back to initials/empty */
      });
    return () => {
      active = false;
    };
  }, []);

  // Close the dropdown on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setOpen(false);
    await logout();
  };

  const photoUrl = mediaUrl(photo);

  return (
    <header className="sticky top-0 z-20 h-14 lg:h-16 bg-white border-b border-(--gray-200) px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={handleMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-(--gray-100) transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-(--gray-600)" />
        </button>
      </div>

      <div className="hidden lg:block flex-1" />

      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-(--gray-100) transition-colors">
          <Bell className="w-6 h-6 text-(--gray-500)" />
          <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-(--danger-500) rounded-xl" />
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-full pl-1 pr-2 py-1 hover:bg-(--gray-100) transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden shrink-0 bg-(--primary-100) text-(--primary-700) text-[13px] font-semibold flex items-center justify-center">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={name || "User"}
                  width={36}
                  height={36}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                initialsOf(name)
              )}
            </div>
            <div className="hidden sm:flex flex-col leading-tight text-left">
              <span className="text-[13px] font-semibold text-(--text-title)">
                {name || "…"}
              </span>
              <span className="text-[11px] text-(--gray-400)">{role}</span>
            </div>
            <ChevronDown
              className={`hidden sm:block w-4 h-4 text-(--gray-400) transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1.5 z-50">
              {/* Header row (name + role) — useful on mobile where they're hidden above */}
              <div className="px-4 py-2 border-b border-(--gray-100) sm:hidden">
                <p className="text-[13px] font-semibold text-(--text-title) truncate">
                  {name || "…"}
                </p>
                <p className="text-[11px] text-(--gray-400)">{role}</p>
              </div>

              <Link
                href="/dashboard/learner/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-(--gray-600) hover:bg-(--gray-50) transition-colors"
              >
                <Settings className="w-4 h-4 text-(--gray-400)" />
                Profile Settings
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {loggingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
