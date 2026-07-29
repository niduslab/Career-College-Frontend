"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import {
  Search,
  Send,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronLeft,
  MessageSquareDashed,
  MailOpen,
  Plus,
  X,
} from "lucide-react";

import {
  useConversationList,
  useConversationThread,
  type ThreadMessage,
} from "@/hooks/use-conversations";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { dayLabel } from "@/lib/date-groups";
import { createConversation, type Conversation } from "@/lib/messaging-api";
import { listCourses, type Course } from "@/lib/course-api";
import { getExperts, type Expert } from "@/lib/partner-api";
import { fetchMe } from "@/lib/auth-api";
import { notify } from "@/lib/toast";
import { SelectDropdown } from "@/components/common/select-dropdown";

type FilterTab = "All" | "Unread";

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function otherParticipant(conv: Conversation, currentUserId: number | null) {
  return (
    conv.participants.find((p) => p.user_id !== currentUserId) ??
    conv.participants[0]
  );
}

function Avatar({
  initials,
  size = "md",
  colorIdx = 0,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  colorIdx?: number;
}) {
  const sz =
    size === "sm"
      ? "w-8 h-8 text-[11px]"
      : size === "lg"
        ? "w-11 h-11 text-[14px]"
        : "w-9 h-9 text-[12px]";
  return (
    <div className="relative shrink-0">
      <div
        className={`${sz} ${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]} rounded-full flex items-center justify-center font-semibold`}
      >
        {initials}
      </div>
    </div>
  );
}

function ConversationItem({
  conv,
  currentUserId,
  active,
  colorIdx,
  onClick,
}: {
  conv: Conversation;
  currentUserId: number | null;
  active: boolean;
  colorIdx: number;
  onClick: () => void;
}) {
  const other = otherParticipant(conv, currentUserId);

  return (
    <button
      onClick={onClick}
      className={`w-full flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors text-left ${
        active
          ? "bg-(--primary-50) border-r-2 border-(--primary-700)"
          : "hover:bg-(--gray-50) border-r-2 border-transparent"
      }`}
    >
      <Avatar initials={initialsOf(other.full_name)} colorIdx={colorIdx} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-1 min-w-0">
            <span
              className={`text-[14px] truncate ${conv.unread_count > 0 ? "font-semibold text-(--text-title)" : "font-medium text-(--text-title)"}`}
            >
              {other.full_name}
            </span>
            <span className="text-[11px] text-(--gray-400) shrink-0">·</span>
            <span className="text-[11px] text-(--primary-700) truncate">
              {conv.course_title ?? "Expert"}
            </span>
          </span>
          <span className="text-[12px] text-(--gray-400) shrink-0">
            {relativeTime(conv.updated_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p
            className={`text-[12px] truncate ${conv.unread_count > 0 ? "text-(--text-title) font-medium" : "text-(--gray-500)"}`}
          >
            {conv.last_message
              ? `${conv.last_message.sender_id === currentUserId ? "You: " : ""}${conv.last_message.body}`
              : "No messages yet"}
          </p>
          {conv.unread_count > 0 && (
            <span className="min-w-4.5 h-4.5 px-1 bg-(--primary-700) text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
              {conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ChatBubble({ msg }: { msg: ThreadMessage }) {
  const isMe = msg.is_own;
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] sm:max-w-[60%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
            isMe
              ? "bg-(--primary-700) text-white rounded-br-sm"
              : "bg-(--gray-100) text-(--text-title) rounded-bl-sm"
          }`}
        >
          {msg.body}
        </div>
        <div className="flex items-center gap-1 px-1">
          <span className="text-[12px] text-(--gray-400)">
            {formatTime(msg.created_at)}
          </span>
          {isMe && msg.send_status === "pending" && (
            <Clock className="w-3 h-3 text-(--gray-400)" />
          )}
          {isMe && msg.send_status === "failed" && (
            <AlertCircle className="w-3 h-3 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
}

function DateSep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-(--gray-200)" />
      <span className="text-[12px] font-medium text-(--gray-400) whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-(--gray-200)" />
    </div>
  );
}

const NO_COURSE_VALUE = "none";

interface NewConversationModalProps {
  experts: Expert[];
  courses: Course[];
  onClose: () => void;
  onCreated: (conv: Conversation) => void;
}

function NewConversationModal({
  experts,
  courses,
  onClose,
  onCreated,
}: NewConversationModalProps) {
  const [expertUserId, setExpertUserId] = useState<number | "">("");
  const [courseChoice, setCourseChoice] = useState<string>(NO_COURSE_VALUE);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!expertUserId || !body.trim()) return;
    setSubmitting(true);
    try {
      const courseId =
        courseChoice === NO_COURSE_VALUE ? undefined : Number(courseChoice);
      const conv = await createConversation({
        conversation_type: "institution_expert",
        expert_user_id: expertUserId,
        course_id: courseId,
        body: body.trim(),
      });
      onCreated(conv);
      onClose();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Failed to start conversation.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--gray-200)">
          <h3 className="text-[16px] font-semibold text-(--text-title)">
            New Conversation
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-(--gray-500)" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">
              Expert
            </label>
            <SelectDropdown
              value={expertUserId === "" ? "" : String(expertUserId)}
              onChange={(v) => setExpertUserId(v ? Number(v) : "")}
              placeholder="Select an expert…"
              options={experts.map((e) => ({
                value: String(e.user_id),
                label: e.full_name,
              }))}
            />
            {experts.length === 0 && (
              <p className="text-[12px] text-(--gray-400) mt-1.5">
                No experts available — your institution must be verified and
                have at least one active affiliated expert.
              </p>
            )}
          </div>

          <div>
            <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">
              Course (optional)
            </label>
            <SelectDropdown
              value={courseChoice}
              onChange={(v) => setCourseChoice(v || NO_COURSE_VALUE)}
              placeholder="Select a course…"
              options={[
                { value: NO_COURSE_VALUE, label: "No course (general)" },
                ...courses.map((c) => ({
                  value: String(c.id),
                  label: c.title,
                })),
              ]}
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="What would you like to say?"
              className="w-full px-3 py-2 text-[13px] bg-(--gray-50) border border-(--gray-200) rounded-md focus:outline-none focus:ring-2 focus:ring-(--primary-700) text-(--text-title) placeholder:text-(--gray-400) resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--gray-200)">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[13px] font-medium text-(--gray-600) rounded-lg hover:bg-(--gray-100) transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!expertUserId || !body.trim() || submitting}
            className="h-9 px-4 text-[13px] font-medium bg-(--primary-700) text-white rounded-lg hover:bg-(--primary-900) transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Starting…" : "Start Conversation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PartnershipMessagesPage() {
  const searchParams = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const raw = searchParams.get("conversation");
    return raw ? Number(raw) : null;
  });
  const [input, setInput] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">(() =>
    searchParams.get("conversation") ? "chat" : "list",
  );
  const [inboxMenuOpen, setInboxMenuOpen] = useState(false);
  const inboxMenuRef = useRef<HTMLDivElement>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const listRef = useRef<(HTMLDivElement | null)[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(showNewModal);

  useEffect(() => {
    void fetchMe().then((user) => setCurrentUserId(user?.user_id ?? null));
    void getExperts()
      .then((res) =>
        setExperts(
          res.results.filter((e) => e.affiliation_status === "active"),
        ),
      )
      .catch(() => {});
    void listCourses(1, 100)
      .then((res) => setMyCourses(res.results))
      .catch(() => {});
  }, []);

  const { conversations, refresh, markLocallyRead } =
    useConversationList(currentUserId);
  const { messages, sendMessage, retrySend } = useConversationThread(
    selectedId,
    currentUserId,
  );

  const filtered = conversations.filter((c) => {
    const other = otherParticipant(c, currentUserId);
    const matchSearch = other.full_name
      .toLowerCase()
      .includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "Unread") return c.unread_count > 0;
    return true;
  });

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const selectedOther = selected
    ? otherParticipant(selected, currentUserId)
    : null;
  const selectedColorIdx = conversations.findIndex((c) => c.id === selectedId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inboxMenuRef.current &&
        !inboxMenuRef.current.contains(e.target as Node)
      )
        setInboxMenuOpen(false);
    };
    if (inboxMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [inboxMenuOpen]);

  useEffect(() => {
    listRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          delay: 0.05 + i * 0.06,
          ease: "power2.out",
        },
      );
    });
  }, [filter, search, conversations.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, messages]);

  useEffect(() => {
    if (selectedId != null) markLocallyRead(selectedId);
  }, [selectedId, markLocallyRead]);

  function selectConversation(id: number) {
    setSelectedId(id);
    setMobileView("chat");
  }

  function handleSend() {
    const text = input.trim();
    if (!text || !selectedId) return;
    sendMessage(text);
    setInput("");
  }

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread_count, 0);

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl overflow-hidden flex h-[calc(100vh-180px)] min-h-130">
      {showNewModal && (
        <NewConversationModal
          experts={experts}
          courses={myCourses}
          onClose={() => setShowNewModal(false)}
          onCreated={(conv) => {
            void refresh();
            selectConversation(conv.id);
          }}
        />
      )}

      <div
        className={`flex flex-col w-full md:w-80 lg:w-88 shrink-0 border-r border-(--gray-200) ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
      >
        <div className="px-4 pt-4 pb-3 border-b border-(--gray-200) space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-(--text-title)">
              Inbox
              {totalUnread > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-(--primary-700) text-white text-[12px] font-semibold rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowNewModal(true)}
                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-md hover:bg-(--gray-100) transition-colors"
                aria-label="New conversation"
              >
                <Plus className="w-5 h-5 text-(--gray-500)" />
              </button>
              <div className="relative" ref={inboxMenuRef}>
                <button
                  onClick={() => setInboxMenuOpen((v) => !v)}
                  className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-md hover:bg-(--gray-100) transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-(--gray-500)" />
                </button>
                {inboxMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1">
                    <button
                      onClick={() => {
                        setFilter("Unread");
                        setInboxMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-(--text-title) hover:bg-(--gray-50) transition-colors"
                    >
                      <MailOpen className="w-4 h-4 text-(--gray-400)" /> Filter
                      unread
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experts…"
              className="w-full h-9 pl-8 pr-3 text-[12px] bg-(--gray-50) border border-(--gray-200) rounded-md focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:bg-white placeholder:text-(--gray-400) text-(--text-title) transition-colors"
            />
          </div>

          <div className="flex gap-1">
            {(["All", "Unread"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 h-8 text-[12px] font-medium rounded-md cursor-pointer transition-colors ${
                  filter === tab
                    ? "bg-(--primary-700) text-white"
                    : "text-(--gray-500) hover:bg-(--gray-100)"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-6">
              <MessageSquareDashed className="w-8 h-8 text-(--gray-300)" />
              <p className="text-[16px] text-(--gray-500)">
                No conversations found
              </p>
            </div>
          ) : (
            filtered.map((conv, i) => (
              <div
                key={conv.id}
                ref={(el) => {
                  listRef.current[i] = el;
                }}
                className="opacity-0"
              >
                <ConversationItem
                  conv={conv}
                  currentUserId={currentUserId}
                  active={conv.id === selectedId}
                  colorIdx={conversations.findIndex((c) => c.id === conv.id)}
                  onClick={() => selectConversation(conv.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {selected && selectedOther ? (
          <>
            <div className="flex items-center gap-3 px-4 h-16 border-b border-(--gray-200) shrink-0">
              <button
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) transition-colors -ml-1"
                onClick={() => setMobileView("list")}
              >
                <ChevronLeft className="w-5 h-5 text-(--gray-500)" />
              </button>
              <Avatar
                initials={initialsOf(selectedOther.full_name)}
                size="lg"
                colorIdx={selectedColorIdx >= 0 ? selectedColorIdx : 0}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-(--text-title) truncate">
                  {selectedOther.full_name}
                </p>
                <p className="text-[12px] text-(--gray-400) truncate">
                  {selected.course_title ?? "Affiliated expert"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => {
                const label = dayLabel(msg.created_at);
                const showSep =
                  i === 0 || dayLabel(messages[i - 1].created_at) !== label;
                return (
                  <div key={msg.client_id ?? msg.id}>
                    {showSep && <DateSep label={label} />}
                    <div className="group">
                      <ChatBubble msg={msg} />
                      {msg.send_status === "failed" && msg.client_id && (
                        <div className="flex justify-end mt-0.5">
                          <button
                            onClick={() => retrySend(msg.client_id as string)}
                            className="text-[11px] text-red-500 hover:underline cursor-pointer"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-(--gray-200) shrink-0">
              <div className="flex items-end gap-2 bg-(--gray-50) border border-(--gray-200) rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-(--primary-700) focus-within:bg-white transition-colors">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message… (Enter to send)"
                  className="flex-1 bg-transparent h-7 resize-none text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none leading-relaxed max-h-28 min-h-7"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-(--primary-700) hover:bg-(--primary-900) text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-0.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[12px] text-(--gray-500) mt-1.5 px-1">
                Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-(--primary-50) flex items-center justify-center">
              <MessageSquareDashed className="w-7 h-7 text-(--primary-700)" />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-(--text-title)">
                No conversation selected
              </p>
              <p className="text-[14px] text-(--gray-500) mt-1">
                Choose a partner from the list to start messaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
