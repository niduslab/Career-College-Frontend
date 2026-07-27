"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import type { NotificationItem } from "@/lib/notifications-api";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Where a notification's deep-link data should send the user, per event type family. */
function linkFor(item: NotificationItem): string | null {
  const data = item.data as { course_slug?: string; conversation_id?: number };
  if (item.event_type === "message.received" && data.conversation_id != null) {
    return null; // messaging inbox route TBD — surfaced as text only for now
  }
  if (data.course_slug) {
    return `/courses/${data.course_slug}`;
  }
  return null;
}

/** Shared bell icon + dropdown, used across every dashboard topbar (learner/instructor/partnership/admin). */
export function NotificationBell({ settingsHref }: { settingsHref: string }) {
  const { items, unreadCount, loading, refresh, markRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) void refresh();
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) void markRead([item.id]);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-(--gray-100) transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-(--gray-500)" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-(--danger-500) text-white text-[10px] leading-4 font-semibold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white border border-(--gray-200) rounded-xl shadow-lg z-50 flex flex-col max-h-112">
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--gray-100)">
            <p className="text-[14px] font-semibold text-(--text-title)">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="flex items-center gap-1 text-[12px] text-(--primary-700) hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-(--gray-400)" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-[13px] text-(--gray-400) text-center py-10">
                You&apos;re all caught up.
              </p>
            ) : (
              items.map((item) => {
                const href = linkFor(item);
                const content = (
                  <div
                    className={`px-4 py-3 border-b border-(--gray-50) transition-colors ${
                      item.is_read ? "bg-white" : "bg-(--primary-50)"
                    } hover:bg-(--gray-50)`}
                  >
                    <div className="flex items-start gap-2">
                      {!item.is_read && (
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-(--primary-600) shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-(--text-title) truncate">
                          {item.title}
                        </p>
                        <p className="text-[13px] text-(--gray-500) line-clamp-2">
                          {item.body}
                        </p>
                        <p className="text-[11px] text-(--gray-400) mt-1">
                          {timeAgo(item.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                return href ? (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => {
                      handleItemClick(item);
                      setOpen(false);
                    }}
                    className="block cursor-pointer"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="block w-full text-left cursor-pointer"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

          <Link
            href={`${settingsHref}?tab=notifications`}
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 text-[13px] text-center text-(--gray-500) hover:text-(--text-title) border-t border-(--gray-100) transition-colors"
          >
            Notification settings
          </Link>
        </div>
      )}
    </div>
  );
}
