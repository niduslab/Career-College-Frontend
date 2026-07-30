"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  CheckCheck,
  CreditCard,
  GraduationCap,
  Loader2,
  MessageSquare,
  PlayCircle,
  ShieldCheck,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  type NotificationItem,
} from "@/lib/notifications-api";
import { notify } from "@/lib/toast";
import { Pagination } from "@/components/common/pagination";

const PAGE_SIZE = 20;

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
  if (data.item_slug && data.item_type === "course") {
    return `${coursePlayerBase}/${data.item_slug}`;
  }
  if (data.course_slug) {
    return `${coursePlayerBase}/${data.course_slug}`;
  }
  return null;
}

/**
 * Full paginated notification history, shared across every dashboard role.
 * The bell dropdown only shows the most recent 20 — this is where the rest
 * of "N total" lives.
 */
export function NotificationsListPage({
  coursePlayerBase = null,
  messagesBase = null,
}: {
  coursePlayerBase?: string | null;
  messagesBase?: string | null;
}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const list = await fetchNotifications({
        page: targetPage,
        page_size: PAGE_SIZE,
      });
      setItems(list.results);
      setTotalCount(list.count);
    } catch {
      notify.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  const handleItemClick = (item: NotificationItem) => {
    if (item.is_read) return;
    setItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)),
    );
    void markNotificationsRead([item.id]);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      notify.error("Failed to mark all as read.");
    }
  };

  const unreadOnPage = items.some((n) => !n.is_read);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-(--gray-100)">
        <p className="text-[16px] font-semibold text-(--text-title)">
          Notifications
          {totalCount > 0 && (
            <span className="ml-1.5 text-[13px] font-normal text-(--gray-400)">
              ({totalCount} total)
            </span>
          )}
        </p>
        {unreadOnPage && (
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            className="flex items-center gap-1.5 text-[13px] text-(--primary-700) hover:underline cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-(--gray-400)" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-[14px] text-(--gray-400) text-center py-16">
          You&apos;re all caught up.
        </p>
      ) : (
        <div>
          {items.map((item) => {
            const href = linkFor(item, coursePlayerBase, messagesBase);
            const { Icon, color } = iconFor(item.event_type);

            const content = (
              <div
                className={`px-5 py-4 border-b border-(--gray-50) border-l-[3px] transition-colors ${
                  item.is_read
                    ? "border-l-transparent bg-white"
                    : "border-l-(--primary-600) bg-(--primary-50)"
                } hover:bg-(--gray-50)`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-full bg-(--gray-100) flex items-center justify-center shrink-0 ${color}`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-(--text-title)">
                      {item.title}
                    </p>
                    <p className="text-[13px] text-(--gray-500)">{item.body}</p>
                    <p className="text-[12px] text-(--gray-400) mt-1">
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                  {!item.is_read && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-(--primary-600) shrink-0" />
                  )}
                </div>
              </div>
            );

            return href ? (
              <Link
                key={item.id}
                href={href}
                onClick={() => handleItemClick(item)}
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
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-5 pb-5">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
