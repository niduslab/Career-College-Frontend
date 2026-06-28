"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Search,
  Send,
  Star,
  MoreVertical,
  Paperclip,
  ChevronLeft,
  MessageSquareDashed,
  Trash2,
  BellOff,
  UserX,
  MailOpen,
} from "lucide-react";
import {
  type PartnerConversation,
  type PartnerMessage,
  PARTNER_CONVERSATIONS,
} from "@/data/partnership-messages";

type FilterTab = "All" | "Unread" | "Starred";

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
];

function Avatar({
  initials,
  size = "md",
  colorIdx = 0,
  online = false,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  colorIdx?: number;
  online?: boolean;
}) {
  const sz =
    size === "sm"
      ? "w-8 h-8 text-[11px]"
      : size === "lg"
        ? "w-11 h-11 text-[14px]"
        : "w-9 h-9 text-[12px]";
  const dotSz = size === "lg" ? "w-2.5 h-2.5" : "w-2 h-2";
  return (
    <div className="relative shrink-0">
      <div
        className={`${sz} ${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]} rounded-full flex items-center justify-center font-semibold`}
      >
        {initials}
      </div>
      {online && (
        <span
          className={`absolute bottom-0 right-0 ${dotSz} bg-green-500 border-2 border-white rounded-full`}
        />
      )}
    </div>
  );
}

function ConversationItem({
  conv,
  active,
  colorIdx,
  onClick,
}: {
  conv: PartnerConversation;
  active: boolean;
  colorIdx: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors text-left ${
        active
          ? "bg-(--primary-50) border-r-2 border-(--primary-700)"
          : "hover:bg-(--gray-50) border-r-2 border-transparent"
      }`}
    >
      <Avatar
        initials={conv.initials}
        online={conv.online}
        colorIdx={colorIdx}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[14px] truncate ${conv.unread > 0 ? "font-semibold text-(--text-title)" : "font-medium text-(--text-title)"}`}
          >
            {conv.name}
          </span>
          <span className="text-[12px] text-(--gray-400) shrink-0">
            {conv.lastTime}
          </span>
        </div>
        <p className="text-[12px] text-(--primary-700) truncate mt-0.5">
          {conv.organization}
        </p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-[12px] truncate text-(--gray-500)">
            {conv.lastMessage}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {conv.starred && (
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            )}
            {conv.unread > 0 && (
              <span className="min-w-4.5 h-4.5 px-1 bg-(--primary-700) text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {conv.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function ChatBubble({ msg }: { msg: PartnerMessage }) {
  const isMe = msg.from === "me";
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
          {msg.text}
        </div>
        <span className="text-[12px] text-(--gray-400) px-1">{msg.time}</span>
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

export default function PartnershipMessagesPage() {
  const [filter, setFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<PartnerConversation[]>(
    PARTNER_CONVERSATIONS,
  );
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [inboxMenuOpen, setInboxMenuOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const inboxMenuRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<(HTMLDivElement | null)[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filtered = conversations.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.organization.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "Unread") return c.unread > 0;
    if (filter === "Starred") return c.starred;
    return true;
  });

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const selectedColorIdx = PARTNER_CONVERSATIONS.findIndex(
    (c) => c.id === selectedId,
  );

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
    const handler = (e: MouseEvent) => {
      if (
        chatMenuRef.current &&
        !chatMenuRef.current.contains(e.target as Node)
      )
        setChatMenuOpen(false);
    };
    if (chatMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [chatMenuOpen]);

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
  }, [filter, search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, conversations]);

  function selectConversation(id: string) {
    setSelectedId(id);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  }

  function sendMessage() {
    const text = input.trim();
    if (!text || !selectedId) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: `m${Date.now()}`, from: "me", text, time },
              ],
              lastMessage: text,
              lastTime: "just now",
            }
          : c,
      ),
    );
    setInput("");
  }

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl overflow-hidden flex h-[calc(100vh-180px)] min-h-130">
      {/* Left: Conversation List */}
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
                      setConversations((prev) =>
                        prev.map((c) => ({ ...c, unread: 0 })),
                      );
                      setInboxMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-(--text-title) hover:bg-(--gray-50) transition-colors"
                  >
                    <MailOpen className="w-4 h-4 text-(--gray-400)" /> Mark all
                    as read
                  </button>
                  <button
                    onClick={() => {
                      setFilter("Unread");
                      setInboxMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-(--text-title) hover:bg-(--gray-50) transition-colors"
                  >
                    <BellOff className="w-4 h-4 text-(--gray-400)" /> Filter
                    unread
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partners…"
              className="w-full h-9 pl-8 pr-3 text-[12px] bg-(--gray-50) border border-(--gray-200) rounded-md focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:bg-white placeholder:text-(--gray-400) text-(--text-title) transition-colors"
            />
          </div>

          <div className="flex gap-1">
            {(["All", "Unread", "Starred"] as FilterTab[]).map((tab) => (
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
                  active={conv.id === selectedId}
                  colorIdx={PARTNER_CONVERSATIONS.findIndex(
                    (c) => c.id === conv.id,
                  )}
                  onClick={() => selectConversation(conv.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Chat Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {selected ? (
          <>
            <div className="flex items-center gap-3 px-4 h-16 border-b border-(--gray-200) shrink-0">
              <button
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) transition-colors -ml-1"
                onClick={() => setMobileView("list")}
              >
                <ChevronLeft className="w-5 h-5 text-(--gray-500)" />
              </button>
              <Avatar
                initials={selected.initials}
                size="lg"
                online={selected.online}
                colorIdx={selectedColorIdx >= 0 ? selectedColorIdx : 0}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-(--text-title) truncate">
                  {selected.name}
                </p>
                <p className="text-[12px] text-(--gray-400) truncate">
                  {selected.online ? (
                    <span className="text-green-600 font-medium">Online</span>
                  ) : (
                    selected.organization
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() =>
                    setConversations((prev) =>
                      prev.map((c) =>
                        c.id === selected.id
                          ? { ...c, starred: !c.starred }
                          : c,
                      ),
                    )
                  }
                  className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg hover:bg-(--gray-100) transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${selected.starred ? "fill-yellow-400 text-yellow-400" : "text-(--gray-400)"}`}
                  />
                </button>
                <div className="relative" ref={chatMenuRef}>
                  <button
                    onClick={() => setChatMenuOpen((v) => !v)}
                    className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg hover:bg-(--gray-100) transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-(--gray-500)" />
                  </button>
                  {chatMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1">
                      <button
                        onClick={() => {
                          setConversations((prev) =>
                            prev.map((c) =>
                              c.id === selected.id ? { ...c, unread: 1 } : c,
                            ),
                          );
                          setChatMenuOpen(false);
                        }}
                        className="w-full cursor-pointer flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-(--text-title) hover:bg-(--gray-50) transition-colors"
                      >
                        <MailOpen className="w-4 h-4 text-(--gray-400)" /> Mark
                        as unread
                      </button>
                      <button
                        onClick={() => {
                          setConversations((prev) =>
                            prev.map((c) =>
                              c.id === selected.id
                                ? { ...c, starred: !c.starred }
                                : c,
                            ),
                          );
                          setChatMenuOpen(false);
                        }}
                        className="w-full cursor-pointer flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-(--text-title) hover:bg-(--gray-50) transition-colors"
                      >
                        <Star className="w-4 h-4 text-(--gray-400)" />{" "}
                        {selected.starred ? "Unstar" : "Star"} conversation
                      </button>
                      <button
                        onClick={() => setChatMenuOpen(false)}
                        className="w-full cursor-pointer flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-(--text-title) hover:bg-(--gray-50) transition-colors"
                      >
                        <BellOff className="w-4 h-4 text-(--gray-400)" /> Mute
                        notifications
                      </button>
                      <div className="h-px bg-(--gray-100) my-1" />
                      <button
                        onClick={() => {
                          setConversations((prev) =>
                            prev.map((c) =>
                              c.id === selected.id ? { ...c, messages: [] } : c,
                            ),
                          );
                          setChatMenuOpen(false);
                        }}
                        className="w-full cursor-pointer flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Clear conversation
                      </button>
                      <button
                        onClick={() => {
                          setConversations((prev) =>
                            prev.filter((c) => c.id !== selected.id),
                          );
                          setSelectedId(null);
                          setChatMenuOpen(false);
                        }}
                        className="w-full cursor-pointer flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <UserX className="w-4 h-4" /> Remove partner
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <DateSep label="Today" />
              {selected.messages.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-(--gray-200) shrink-0">
              <div className="flex items-end gap-2 bg-(--gray-50) border border-(--gray-200) rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-(--primary-700) focus-within:bg-white transition-colors">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-200) transition-colors shrink-0 mb-0.5">
                  <Paperclip className="w-4 h-4 text-(--gray-400)" />
                </button>
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
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message… (Enter to send)"
                  className="flex-1 bg-transparent h-7 resize-none text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none leading-relaxed max-h-28 min-h-7"
                />
                <button
                  onClick={sendMessage}
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
