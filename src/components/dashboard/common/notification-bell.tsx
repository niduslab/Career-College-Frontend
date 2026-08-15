"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Loader2,
  PlayCircle,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  BookOpen,
  Users,
  MessageSquare,
  Star,
  type LucideIcon,
} from "lucide-react";
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

/** "Today" / "Yesterday" / "Earlier" bucket for a notification's created_at. */
function dayBucket(iso: string): string {
  const created = new Date(iso);
  const now = new Date();
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round(
    (startOf(now) - startOf(created)) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

/** Icon + accent color per event-type family — quick visual scan of the feed. */
function iconFor(eventType: string): { Icon: LucideIcon; color: string } {
  if (
    eventType.startsWith("lecture.") ||
    eventType.startsWith("course.completed")
  ) {
    return { Icon: PlayCircle, color: "text-blue-500" };
  }
  if (eventType.startsWith("course.")) {
    return { Icon: BookOpen, color: "text-indigo-500" };
  }
  if (eventType.startsWith("payment.")) {
    return { Icon: CreditCard, color: "text-emerald-500" };
  }
  if (
    eventType.startsWith("verification.") ||
    eventType.startsWith("institution_verification.")
  ) {
    return { Icon: ShieldCheck, color: "text-amber-500" };
  }
  if (eventType.startsWith("invite.") || eventType === "learner.enrolled") {
    return { Icon: Users, color: "text-violet-500" };
  }
  if (eventType === "message.received") {
    return { Icon: MessageSquare, color: "text-sky-500" };
  }
  if (eventType === "review.received") {
    return { Icon: Star, color: "text-yellow-500" };
  }
  if (eventType === "enrollment.created") {
    return { Icon: GraduationCap, color: "text-teal-500" };
  }
  return { Icon: Bell, color: "text-(--gray-400)" };
}

function linkFor(
  item: NotificationItem,
  coursePlayerBase: string | null,
  messagesBase: string | null,
): string | null {
  const data = item.data as {
    course_slug?: string;
    conversation_id?: number;
    item_type?: "course" | "webinar";
    item_slug?: string;
  };
  if (item.event_type === "message.received" && data.conversation_id != null) {
    return messagesBase
      ? `${messagesBase}?conversation=${data.conversation_id}`
      : null;
  }
  if (!coursePlayerBase) return null;

  // payment.successful / payment.failed carry item_type + item_slug instead
  // of course_slug — only "course" has a working route today, webinar doesn't.
  if (data.item_slug && data.item_type === "course") {
    return `${coursePlayerBase}/${data.item_slug}`;
  }
  if (data.course_slug) {
    return `${coursePlayerBase}/${data.course_slug}`;
  }
  return null;
}

/** Shared bell icon + dropdown, used across every dashboard topbar (learner/instructor/partnership/admin). */
export function NotificationBell({
  settingsHref,
  viewAllHref,
  coursePlayerBase = null,
  messagesBase = null,
}: {
  settingsHref: string;
  viewAllHref: string;
  coursePlayerBase?: string | null;
  messagesBase?: string | null;
}) {
  const {
    items,
    totalCount,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
  } = useNotifications();
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
        <div
          className="fixed inset-x-3 top-16 z-50 flex flex-col max-h-[calc(100vh-5rem)] bg-white border border-(--gray-200) rounded-xl shadow-lg
            sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-h-112"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--gray-100)">
            <p className="text-[14px] font-semibold text-(--text-title)">
              Notifications
              {totalCount > 0 && (
                <span className="ml-1.5 text-[12px] font-normal text-(--gray-400)">
                  ({totalCount} total)
                </span>
              )}
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
              items.map((item, i) => {
                const href = linkFor(item, coursePlayerBase, messagesBase);
                const { Icon, color } = iconFor(item.event_type);
                const bucket = dayBucket(item.created_at);
                const showBucketHeader =
                  i === 0 || dayBucket(items[i - 1].created_at) !== bucket;

                const content = (
                  <>
                    {showBucketHeader && (
                      <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-(--gray-400) bg-(--gray-50)">
                        {bucket}
                      </p>
                    )}
                    <div
                      className={`px-4 py-3 border-b border-(--gray-50) border-l-[3px] transition-colors ${
                        item.is_read
                          ? "border-l-transparent bg-white"
                          : "border-l-(--primary-600) bg-(--primary-50)"
                      } hover:bg-(--gray-50)`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 w-7 h-7 rounded-full bg-(--gray-100) flex items-center justify-center shrink-0 ${color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
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
                        {!item.is_read && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-(--primary-600) shrink-0" />
                        )}
                      </div>
                    </div>
                  </>
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

          <div className="border-t border-(--gray-100)">
            <Link
              href={viewAllHref}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[13px] text-center font-semibold text-(--primary-700) hover:bg-(--gray-50) transition-colors"
            >
              View all notifications
            </Link>
            <Link
              href={`${settingsHref}?tab=notifications`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-[12px] text-center text-(--gray-400) hover:text-(--text-title) transition-colors"
            >
              Notification settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
