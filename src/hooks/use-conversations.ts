"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchConversations,
  fetchConversationDetail,
  fetchUnreadConversationCount,
  markConversationRead,
  type Conversation,
  type ConversationListParams,
  type Message,
} from "@/lib/messaging-api";
import { getPlatformSocket, type StreamEnvelope } from "@/lib/realtime-socket";
import { isLoggedIn, onAuthChange } from "@/lib/session";
import { notify } from "@/lib/toast";

export type PendingSendStatus = "pending" | "sent" | "failed";

export interface ThreadMessage extends Message {
  is_own: boolean;
  send_status?: PendingSendStatus;
  client_id?: string;
}

interface WsMessageSnapshot {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  is_deleted: boolean;
  created_at: string;
}

interface NewMessagePayload {
  type: "new_message";
  conversation_id: number;
  message: WsMessageSnapshot;
}

interface MessageSentPayload {
  type: "message_sent";
  message: WsMessageSnapshot;
}

interface MarkedReadPayload {
  type: "marked_read";
  conversation_id: number;
}

interface UnreadSummaryPayload {
  type: "unread_summary";
  conversations: { conversation_id: number; unread_count: number }[];
  unread_conversations: number;
}

interface ErrorPayload {
  type: "error";
  detail: string;
}

type MessagingStreamPayload =
  | NewMessagePayload
  | MessageSentPayload
  | MarkedReadPayload
  | UnreadSummaryPayload
  | ErrorPayload;

interface PendingSend {
  clientId: string;
  conversationId: number;
  body: string;
}

/** Inbox: list of conversations for the current user + a live unread-conversation badge count, kept in sync via REST + the `messaging` WS stream. */
export function useConversationList(currentUserId: number | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadConversations, setUnreadConversations] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (params: ConversationListParams = {}) => {
    if (!isLoggedIn()) return;
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        fetchConversations({ page_size: 50, ...params }),
        fetchUnreadConversationCount(),
      ]);
      setConversations(list.results);
      setUnreadConversations(count);
    } catch {
      // Stays stale; next refresh() retries.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) return;
    void refresh();

    const socket = getPlatformSocket();
    socket.connect();

    const unsubscribe = socket.onMessage((envelope: StreamEnvelope) => {
      if (envelope.stream !== "messaging") return;
      const payload = envelope.payload as MessagingStreamPayload;

      if (payload.type === "unread_summary") {
        setUnreadConversations(payload.unread_conversations);
        return;
      }

      if (payload.type === "new_message") {
        const msg = payload.message;
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === payload.conversation_id);
          if (idx === -1) {
            void refresh();
            return prev;
          }
          const isOwn =
            currentUserId != null && msg.sender_id === currentUserId;
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            updated_at: msg.created_at,
            unread_count: isOwn
              ? next[idx].unread_count
              : next[idx].unread_count + 1,
          };
          return next.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          );
        });
        if (currentUserId == null || msg.sender_id !== currentUserId) {
          setUnreadConversations((c) => c + 1);
        }
        return;
      }

      if (payload.type === "marked_read") {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === payload.conversation_id ? { ...c, unread_count: 0 } : c,
          ),
        );
      }
    });

    const pollId = setInterval(() => void refresh(), 30_000);

    return () => {
      unsubscribe();
      clearInterval(pollId);
    };
  }, [refresh, currentUserId]);

  useEffect(() => onAuthChange(() => void refresh()), [refresh]);

  return { conversations, unreadConversations, loading, refresh };
}

/** One open conversation thread: paginated history + live WS append + optimistic send with pending-queue fallback. */
export function useConversationThread(
  conversationId: number | null,
  currentUserId: number | null,
) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const pendingQueue = useRef<PendingSend[]>([]);
  const wasConnected = useRef(false);

  const toThreadMessage = useCallback(
    (m: Message): ThreadMessage => ({
      ...m,
      is_own:
        m.is_own ?? (currentUserId != null && m.sender_id === currentUserId),
    }),
    [currentUserId],
  );

  const load = useCallback(async () => {
    if (conversationId == null) return;
    setLoading(true);
    setNotFound(false);
    try {
      const detail = await fetchConversationDetail(conversationId, {
        page_size: 100,
      });
      setConversation(detail.conversation);
      setMessages(detail.messages.results.map(toThreadMessage));
      try {
        await markConversationRead(conversationId);
      } catch {
        // Best-effort — the conversation stays marked unread; next open retries.
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [conversationId, toThreadMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const flushPending = useCallback(() => {
    const socket = getPlatformSocket();
    const queued = pendingQueue.current;
    pendingQueue.current = [];
    queued.forEach((send) => {
      socket.send("messaging", {
        type: "send_message",
        conversation_id: send.conversationId,
        body: send.body,
      });
    });
  }, []);

  useEffect(() => {
    const socket = getPlatformSocket();
    socket.connect();

    const unsubscribe = socket.onMessage((envelope: StreamEnvelope) => {
      if (envelope.stream !== "messaging") return;
      const payload = envelope.payload as MessagingStreamPayload;

      if (payload.type === "unread_summary") {
        if (!wasConnected.current) {
          wasConnected.current = true;
          flushPending();
        }
        return;
      }

      if (
        payload.type === "new_message" &&
        payload.conversation_id === conversationId
      ) {
        const msg = payload.message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, toThreadMessage(msg)];
        });
        if (conversationId != null)
          void markConversationRead(conversationId).catch(() => {});
        return;
      }

      if (payload.type === "message_sent") {
        const msg = payload.message;
        setMessages((prev) => {
          const idx = prev.findIndex(
            (m) =>
              m.send_status === "pending" &&
              m.body === msg.body &&
              m.conversation_id === msg.conversation_id,
          );
          if (idx === -1) {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, toThreadMessage(msg)];
          }
          const next = [...prev];
          next[idx] = { ...toThreadMessage(msg), send_status: "sent" };
          return next;
        });
        return;
      }

      if (payload.type === "error") {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.send_status === "pending");
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { ...next[idx], send_status: "failed" };
          return next;
        });
        notify.error(payload.detail);
      }
    });

    return () => unsubscribe();
  }, [conversationId, toThreadMessage, flushPending]);

  const sendMessage = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || conversationId == null) return;

      const clientId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic: ThreadMessage = {
        id: -Date.now(),
        conversation_id: conversationId,
        sender_id: currentUserId ?? -1,
        body: trimmed,
        is_own: true,
        created_at: new Date().toISOString(),
        send_status: "pending",
        client_id: clientId,
      };
      setMessages((prev) => [...prev, optimistic]);

      const socket = getPlatformSocket();
      if (socket.isOpen()) {
        socket.send("messaging", {
          type: "send_message",
          conversation_id: conversationId,
          body: trimmed,
        });
      } else {
        pendingQueue.current.push({ clientId, conversationId, body: trimmed });
      }
    },
    [conversationId, currentUserId],
  );

  const retrySend = useCallback((clientId: string) => {
    setMessages((prev) => {
      const msg = prev.find((m) => m.client_id === clientId);
      if (!msg) return prev;
      const socket = getPlatformSocket();
      if (socket.isOpen()) {
        socket.send("messaging", {
          type: "send_message",
          conversation_id: msg.conversation_id,
          body: msg.body,
        });
      } else {
        pendingQueue.current.push({
          clientId,
          conversationId: msg.conversation_id,
          body: msg.body,
        });
      }
      return prev.map((m) =>
        m.client_id === clientId ? { ...m, send_status: "pending" } : m,
      );
    });
  }, []);

  return {
    conversation,
    messages,
    loading,
    notFound,
    sendMessage,
    retrySend,
    reload: load,
  };
}

/** Lightweight unread-conversation badge count for sidebars/topbars — REST on mount + live via the `messaging` WS stream, without loading the full conversation list. */
export function useConversationUnreadBadge(): number {
  const [unreadConversations, setUnreadConversations] = useState(0);

  useEffect(() => {
    if (!isLoggedIn()) return;

    const refresh = () => {
      fetchUnreadConversationCount()
        .then(setUnreadConversations)
        .catch(() => {});
    };
    refresh();

    const socket = getPlatformSocket();
    socket.connect();

    const unsubscribe = socket.onMessage((envelope: StreamEnvelope) => {
      if (envelope.stream !== "messaging") return;
      const payload = envelope.payload as MessagingStreamPayload;
      if (payload.type === "unread_summary") {
        setUnreadConversations(payload.unread_conversations);
      } else if (payload.type === "new_message") {
        setUnreadConversations((c) => c + 1);
      } else if (payload.type === "marked_read") {
        refresh();
      }
    });

    const pollId = setInterval(refresh, 30_000);

    return () => {
      unsubscribe();
      clearInterval(pollId);
    };
  }, []);

  useEffect(
    () =>
      onAuthChange(() => {
        fetchUnreadConversationCount()
          .then(setUnreadConversations)
          .catch(() => {});
      }),
    [],
  );

  return unreadConversations;
}
