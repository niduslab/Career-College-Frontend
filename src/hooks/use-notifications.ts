"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationsRead,
  type NotificationItem,
} from "@/lib/notifications-api";
import { getPlatformSocket, type StreamEnvelope } from "@/lib/realtime-socket";
import { isLoggedIn, onAuthChange } from "@/lib/session";

interface NotificationPushPayload {
  type: "notification";
  id: number;
  event_type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

interface UnreadCountPayload {
  type: "unread_count";
  count: number;
}

type NotificationsStreamPayload = NotificationPushPayload | UnreadCountPayload;

/** Bell-icon state: recent notifications + unread badge count, kept live via WS with REST as the source of truth. */
export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const loadedOnce = useRef(false);

  const refresh = useCallback(async () => {
    if (!isLoggedIn()) return;
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        fetchNotifications({ page_size: 20 }),
        fetchUnreadCount(),
      ]);
      setItems(list.results);
      setTotalCount(list.count);
      setUnreadCount(count);
    } catch {
      // Bell just stays stale; next refresh() call (open, poll, WS event) retries.
    } finally {
      setLoading(false);
      loadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) return;
    void refresh();

    const socket = getPlatformSocket();
    socket.connect();

    const unsubscribe = socket.onMessage((envelope: StreamEnvelope) => {
      if (envelope.stream !== "notifications") return;
      const payload = envelope.payload as NotificationsStreamPayload;

      if (payload.type === "unread_count") {
        setUnreadCount(payload.count);
      } else if (payload.type === "notification") {
        setUnreadCount((c) => c + 1);
        setTotalCount((c) => c + 1);
        setItems((prev) => [
          {
            id: payload.id,
            event_type: payload.event_type,
            title: payload.title,
            body: payload.body,
            data: payload.data,
            is_read: payload.is_read,
            read_at: null,
            created_at: payload.created_at,
          },
          ...prev,
        ]);
      }
    });

    // WS may be unavailable (no ws-token endpoint yet) — poll REST as a fallback.
    const pollId = setInterval(() => void refresh(), 30_000);

    return () => {
      unsubscribe();
      clearInterval(pollId);
    };
  }, [refresh]);

  useEffect(() => onAuthChange(() => void refresh()), [refresh]);

  const markRead = useCallback(async (ids: number[]) => {
    setItems((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - ids.length));
    try {
      await markNotificationsRead(ids);
    } catch {
      // Best-effort — next refresh() reconciles if this silently failed.
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // Best-effort — next refresh() reconciles if this silently failed.
    }
  }, []);

  return { items, totalCount, unreadCount, loading, refresh, markRead, markAllRead };
}
