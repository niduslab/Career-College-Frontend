"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Share2,
  LogOut,
  Send,
  Radio,
  Users,
  Clock,
  MessageSquare,
  HelpCircle,
  BarChart2,
  PenLine,
  ThumbsUp,
  X,
} from "lucide-react";

// Types
interface ChatMessage {
  id: number;
  author: string;
  initials: string;
  color: string;
  text: string;
  isHost?: boolean;
  time: string;
}

interface Participant {
  id: number;
  name: string;
  initials: string;
  color: string;
  isYou?: boolean;
}

interface PollOption {
  id: number;
  label: string;
  votes: number;
}

interface QnaItem {
  id: number;
  author: string;
  initials: string;
  color: string;
  question: string;
  upvotes: number;
  upvoted: boolean;
  answered: boolean;
}

type PanelTab = "chat" | "qna" | "polls";

// Mock data
const PARTICIPANTS: Participant[] = [
  { id: 1, name: "David Kim", initials: "DK", color: "bg-sky-500" },
  { id: 2, name: "Sara Mendez", initials: "SM", color: "bg-emerald-500" },
  { id: 3, name: "Liam Foster", initials: "LF", color: "bg-amber-500" },
  { id: 4, name: "Amara Okafor", initials: "AO", color: "bg-rose-500" },
  { id: 5, name: "Kenji Tanaka", initials: "KT", color: "bg-violet-500" },
  { id: 6, name: "You", initials: "YO", color: "bg-purple-600", isYou: true },
];

const HOST = { name: "Dr. Lena Park", initials: "DL", color: "bg-violet-600" };

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 1,
    author: "Sara Mendez",
    initials: "SM",
    color: "bg-emerald-500",
    text: "This makes so much more sense live, thanks!",
    time: "3:02 PM",
  },
  {
    id: 2,
    author: "David Kim",
    initials: "DK",
    color: "bg-sky-500",
    text: "Will the recording be available after?",
    time: "3:04 PM",
  },
  {
    id: 3,
    author: "Dr. Lena Park",
    initials: "DL",
    color: "bg-violet-600",
    text: "Yes David — posted within an hour 🔥",
    isHost: true,
    time: "3:05 PM",
  },
  {
    id: 4,
    author: "Liam Foster",
    initials: "LF",
    color: "bg-amber-500",
    text: "Can you go back to the attention mechanism slide?",
    time: "3:08 PM",
  },
  {
    id: 5,
    author: "Amara Okafor",
    initials: "AO",
    color: "bg-rose-500",
    text: "Great explanation on backpropagation 👏",
    time: "3:10 PM",
  },
];

const INITIAL_QNA: QnaItem[] = [
  {
    id: 1,
    author: "Kenji Tanaka",
    initials: "KT",
    color: "bg-violet-500",
    question: "How does gradient clipping prevent exploding gradients?",
    upvotes: 14,
    upvoted: false,
    answered: false,
  },
  {
    id: 2,
    author: "Sara Mendez",
    initials: "SM",
    color: "bg-emerald-500",
    question: "What's the difference between Adam and AdamW?",
    upvotes: 9,
    upvoted: false,
    answered: true,
  },
  {
    id: 3,
    author: "David Kim",
    initials: "DK",
    color: "bg-sky-500",
    question: "Is batch norm applied before or after activation?",
    upvotes: 6,
    upvoted: false,
    answered: false,
  },
];

const POLL_OPTIONS: PollOption[] = [
  { id: 1, label: "Very clear", votes: 48 },
  { id: 2, label: "Mostly clear", votes: 31 },
  { id: 3, label: "Somewhat clear", votes: 12 },
  { id: 4, label: "Not clear yet", votes: 5 },
];

// Timer hook
function useTimer() {
  const [elapsed, setElapsed] = useState(42 * 60 + 18);
  useEffect(() => {
    const id = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Chat panel
function ChatPanel({
  messages,
  onSend,
}: {
  messages: ChatMessage[];
  onSend: (t: string) => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    onSend(t);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.map((m) => (
          <div key={m.id} className="flex gap-2.5">
            <div
              className={`w-7 h-7 rounded-full ${m.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5`}
            >
              {m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-[12px] font-semibold text-(--text-title)">
                  {m.author}
                </span>
                {m.isHost && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-(--primary-100) text-(--primary-600)">
                    Host
                  </span>
                )}
                <span className="text-[12px] text-(--gray-400) ml-auto">
                  {m.time}
                </span>
              </div>
              <p className="text-[14px] text-(--gray-500) leading-snug wrap-break-word">
                {m.text}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="px-3 py-3 border-t border-(--gray-100) flex items-center gap-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Say something..."
          className="flex-1 h-9 px-3 rounded-lg border border-(--gray-200) text-[13px] placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-(--primary-600)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Q&A panel
function QnaPanel({
  items,
  onUpvote,
}: {
  items: QnaItem[];
  onUpvote: (id: number) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
      {[...items]
        .sort((a, b) => b.upvotes - a.upvotes)
        .map((q) => (
          <div
            key={q.id}
            className={`rounded-xl border p-3 ${q.answered ? "border-(--gray-200) bg-(--gray-50)" : "border-(--primary-100) bg-(--primary-50)"}`}
          >
            <div className="flex gap-2 mb-2">
              <div
                className={`w-7 h-7 rounded-full ${q.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
              >
                {q.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[12px] font-semibold text-(--text-title)">
                    {q.author}
                  </span>
                  {q.answered && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                      Answered
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-(--gray-700) leading-snug mt-0.5">
                  {q.question}
                </p>
              </div>
            </div>
            <button
              onClick={() => onUpvote(q.id)}
              className={`flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${q.upvoted ? "bg-(--primary-600) text-white" : "bg-white border border-(--gray-200) text-(--gray-500) hover:border-(--primary-300) hover:text-(--primary-600)"}`}
            >
              <ThumbsUp className="w-3 h-3" />
              {q.upvotes}
            </button>
          </div>
        ))}
    </div>
  );
}

// Polls panel
function PollsPanel({ options }: { options: PollOption[] }) {
  const [voted, setVoted] = useState<number | null>(null);
  const total = options.reduce((s, o) => s + o.votes, 0);

  return (
    <div className="px-4 py-3 overflow-y-auto flex-1 min-h-0">
      <div className="bg-(--primary-50) border border-(--primary-100) rounded-xl p-4">
        <p className="text-[14px] font-semibold text-(--text-title) mb-3">
          How clear was the last explanation?
        </p>
        <div className="space-y-2">
          {options.map((opt) => {
            const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
            const isVoted = voted === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setVoted(opt.id)}
                className={`w-full text-left rounded-lg border transition-colors cursor-pointer overflow-hidden ${isVoted ? "border-(--primary-400)" : "border-(--gray-200) hover:border-(--primary-300)"}`}
              >
                <div className="relative px-3 py-2">
                  {voted !== null && (
                    <div
                      className="absolute inset-0 bg-(--primary-100)"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <span
                      className={`text-[14px] font-medium ${isVoted ? "text-(--primary-700)" : "text-(--text-title)"}`}
                    >
                      {opt.label}
                    </span>
                    {voted !== null && (
                      <span className="text-[14px] font-semibold text-(--primary-600)">
                        {pct}%
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p
          className={`text-[12px] mt-3 font-medium ${voted !== null ? "text-emerald-600" : "text-(--gray-400)"}`}
        >
          {voted !== null
            ? "✓ Your vote has been recorded"
            : `${total} responses so far`}
        </p>
      </div>
    </div>
  );
}

// Main
export default function LiveRoomPage() {
  const router = useRouter();
  const timer = useTimer();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<PanelTab>("chat");
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);
  const [qnaItems, setQnaItems] = useState(INITIAL_QNA);
  const watching = 142;

  const handleSendChat = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: "You",
        initials: "YO",
        color: "bg-purple-600",
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const handleUpvote = (id: number) => {
    setQnaItems((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              upvotes: q.upvoted ? q.upvotes - 1 : q.upvotes + 1,
              upvoted: !q.upvoted,
            }
          : q,
      ),
    );
  };

  const PANEL_TABS: {
    key: PanelTab;
    label: string;
    icon: React.ElementType;
  }[] = [
    { key: "chat", label: "Chat", icon: MessageSquare },
    { key: "qna", label: "Q&A", icon: HelpCircle },
    { key: "polls", label: "Polls", icon: BarChart2 },
  ];

  return (
    /* Fixed full-viewport overlay — escapes dashboard layout padding */
    <div className="fixed inset-0 z-50 flex bg-[#0d0520] overflow-hidden">
      {/* Left: video column */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Topbar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#0d0520] border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-rose-500 px-2.5 py-1 rounded-full shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              LIVE
            </span>
            <span className="text-[14px] font-semibold text-white truncate">
              Tuning Neural Networks
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden sm:flex items-center gap-1.5 text-[14px] text-white/60">
              <Users className="w-4 h-4" />
              {watching} watching
            </span>
            <span className="flex items-center gap-1.5 text-[14px] text-white/60">
              <Clock className="w-4 h-4" />
              {timer}
            </span>
            {/* Toggle panel on mobile */}
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="lg:hidden w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main video — fills remaining height */}
        <div className="relative flex-1 min-h-0 bg-[#12072a] flex items-center justify-center overflow-hidden">
          {/* Host avatar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full ${HOST.color} flex items-center justify-center text-[28px] sm:text-[36px] font-bold text-white`}
            >
              {HOST.initials}
            </div>
            <span className="text-white font-semibold text-[14px] sm:text-[16px]">
              {HOST.name}
            </span>
          </div>

          {/* Host label */}
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[12px] font-semibold px-2.5 py-1.5 rounded-lg">
            {HOST.name} · Host
          </div>

          {/* Whiteboard */}
          <button className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white text-[12px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">Whiteboard</span>
          </button>
        </div>

        {/* Participant strip */}
        <div className="shrink-0 bg-[#0d0520] border-t border-white/10 px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {PARTICIPANTS.map((p) => (
              <div
                key={p.id}
                className={`w-24 h-16 sm:w-28 sm:h-18 shrink-0 rounded-xl bg-[#1a0d35] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#221045] transition-colors relative overflow-hidden ${p.isYou ? "ring-2 ring-purple-500" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full ${p.color} flex items-center justify-center text-[11px] font-bold text-white`}
                >
                  {p.initials}
                </div>
                <span className="text-white/80 text-[10px] font-medium truncate px-1 max-w-full">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls bar */}
        <div className="shrink-0 bg-[#0d0520] border-t border-white/10 py-3 flex items-center justify-center gap-2 sm:gap-3 px-4">
          {/* Mic */}
          <button
            onClick={() => setMicOn((v) => !v)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${micOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
            title={micOn ? "Mute" : "Unmute"}
          >
            {micOn ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>

          {/* Camera */}
          <button
            onClick={() => setCamOn((v) => !v)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${camOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
            title={camOn ? "Stop camera" : "Start camera"}
          >
            {camOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>

          {/* Raise hand */}
          <button
            onClick={() => setHandRaised((v) => !v)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${handRaised ? "bg-amber-400 hover:bg-amber-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"}`}
            title="Raise hand"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Share screen */}
          <button
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Share screen"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Leave */}
          <button
            onClick={() => router.push("/dashboard/learner/live-sessions")}
            className="flex items-center gap-2 h-11 px-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer ml-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Right side */}

      <div
        className={`
          flex flex-col bg-white border-l border-(--gray-200) shrink-0
          transition-all duration-300
          w-full sm:w-80 xl:w-88
          lg:relative lg:translate-x-0
          ${panelOpen ? "fixed inset-y-0 right-0 z-50 w-full sm:w-80" : "fixed inset-y-0 right-0 z-50 translate-x-full"}
          lg:flex lg:translate-x-0 lg:static lg:w-80 xl:w-88
        `}
      >
        {/* Panel header */}
        <div className="shrink-0 flex items-center border-b border-(--gray-200)">
          {PANEL_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[13px] font-semibold transition-colors cursor-pointer border-b-2 ${activeTab === tab.key ? "border-(--primary-600) text-(--primary-600)" : "border-transparent text-(--gray-400) hover:text-(--gray-600)"}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          {/* Close on mobile */}
          <button
            onClick={() => setPanelOpen(false)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-(--gray-400) hover:text-(--gray-600) shrink-0 mr-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeTab === "chat" && (
            <ChatPanel messages={chatMessages} onSend={handleSendChat} />
          )}
          {activeTab === "qna" && (
            <QnaPanel items={qnaItems} onUpvote={handleUpvote} />
          )}
          {activeTab === "polls" && <PollsPanel options={POLL_OPTIONS} />}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-(--gray-200) px-4 py-2.5 flex items-center gap-2 text-(--gray-500)">
          <Radio className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-[12px]">
            <span className="font-semibold text-(--text-title)">
              {watching}
            </span>{" "}
            live · {PARTICIPANTS.length} in room
          </span>
        </div>
      </div>

      {/* Mobile panel backdrop */}
      {panelOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
