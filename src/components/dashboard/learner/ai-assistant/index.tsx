"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  BookOpen,
  Code2,
  FileText,
  Lightbulb,
  RotateCcw,
  X,
  Check,
} from "lucide-react";
import gsap from "gsap";

import instructor6 from "@/assets/images/instructors/instructor6.webp";

// Types
type Role = "user" | "assistant";
type Feedback = "up" | "down" | null;

interface Message {
  id: number;
  role: Role;
  content: string;
  feedback: Feedback;
  copied: boolean;
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
  createdAt: string;
}

//  Prompt suggestions

const SUGGESTIONS = [
  {
    icon: BookOpen,
    label: "Explain a concept",
    prompt:
      "Explain the difference between supervised and unsupervised learning in simple terms.",
  },
  {
    icon: Code2,
    label: "Review my code",
    prompt:
      "Can you review this Python function and suggest improvements?\n\ndef add(a, b):\n  return a + b",
  },
  {
    icon: FileText,
    label: "Summarise content",
    prompt:
      "Summarise the key ideas behind the Transformer architecture from the 'Attention Is All You Need' paper.",
  },
  {
    icon: Lightbulb,
    label: "Study plan",
    prompt:
      "Create a 4-week study plan for learning machine learning from scratch, 1 hour per day.",
  },
];

// Mock AI responses

const MOCK_RESPONSES: Record<string, string> = {
  default: `Great question! Here's a clear breakdown:

**Key Points:**
- The concept builds on foundational ideas you've already covered
- There are three main aspects to understand here
- Practice with real examples is the fastest way to solidify this

Would you like me to go deeper on any of these points, or would a different example be more helpful for your current course?`,
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("study plan")) {
    return `Here's a **4-week ML study plan** (1 hour/day):

**Week 1 — Foundations**
- Day 1–2: Linear algebra basics (vectors, matrices)
- Day 3–4: Probability & statistics refresher
- Day 5–7: Python & NumPy for data manipulation

**Week 2 — Core ML Concepts**
- Day 1–2: Supervised learning (regression, classification)
- Day 3–4: Unsupervised learning (clustering, PCA)
- Day 5–7: Model evaluation & cross-validation

**Week 3 — Practical Skills**
- Day 1–3: scikit-learn hands-on projects
- Day 4–5: Feature engineering techniques
- Day 6–7: Hyperparameter tuning

**Week 4 — Deep Learning Intro**
- Day 1–3: Neural network fundamentals
- Day 4–5: PyTorch basics
- Day 6–7: Build your first CNN

**Recommended resources:**
- 📚 *Hands-On ML* by Aurélien Géron
- 🎓 Fast.ai Practical Deep Learning course
- 🛠️ Kaggle competitions for practice

Shall I expand any of these weeks in more detail?`;
  }
  if (lower.includes("transformer") || lower.includes("attention")) {
    return `The **Transformer architecture** (Vaswani et al., 2017) revolutionised NLP. Here's the core idea:

**The Problem It Solved:**
Previous RNNs processed tokens sequentially — slow and hard to parallelise. Transformers process all tokens simultaneously.

**Self-Attention Mechanism:**
\`\`\`
Attention(Q, K, V) = softmax(QK^T / √d_k) · V
\`\`\`
- **Q (Query)** — what we're looking for
- **K (Key)** — what each token offers
- **V (Value)** — what we actually extract

**Architecture:**
1. Input Embeddings + Positional Encoding
2. Multi-Head Attention (parallel attention heads)
3. Feed-Forward Network
4. Layer Normalisation + Residual Connections

**Why it matters:**
- Foundation of BERT, GPT, T5, and all modern LLMs
- Scales incredibly well with data and compute
- Handles long-range dependencies effortlessly

Want me to walk through the encoder, decoder, or the multi-head attention in more detail?`;
  }
  return MOCK_RESPONSES.default;
}

/* Inline bold renderer (no dangerouslySetInnerHTML)*/
function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

//  Message bubble

function MessageBubble({
  msg,
  onFeedback,
  onCopy,
}: {
  msg: Message;
  onFeedback: (id: number, f: Feedback) => void;
  onCopy: (id: number, text: string) => void;
}) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2">
        <div className="max-w-[75%] bg-(--primary-600) text-white rounded-2xl rounded-br-sm px-4 py-3">
          <p className="text-[14px] md:text-[16px] lg:text-[16px] font-normal leading-relaxed whitespace-pre-wrap">
            {msg.content}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-0.5">
          <Image
            src={instructor6}
            alt="You"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-full bg-(--primary-600) flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-(--gray-200) rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="text-[14px] md:text-[16px] lg:text-[16px] leading-relaxed text-(--text-title) space-y-1.5">
            {msg.content.split("\n").map((line, i) => {
              if (line.startsWith("```")) return null;
              if (line.trim() === "") return <div key={i} className="h-1" />;
              if (line.startsWith("- ")) {
                return (
                  <p key={i} className="flex gap-2">
                    <span className="text-(--primary-600) shrink-0">•</span>
                    <span>
                      <InlineBold text={line.slice(2)} />
                    </span>
                  </p>
                );
              }
              if (/^\d+\. /.test(line)) {
                const num = line.match(/^(\d+)\. /)?.[1];
                return (
                  <p key={i} className="flex gap-2">
                    <span className="text-(--primary-600) font-semibold shrink-0">
                      {num}.
                    </span>
                    <span>
                      <InlineBold text={line.replace(/^\d+\. /, "")} />
                    </span>
                  </p>
                );
              }
              return (
                <p key={i}>
                  <InlineBold text={line} />
                </p>
              );
            })}
          </div>
        </div>
        {/* Action row */}
        <div className="flex items-center gap-1 mt-1.5 px-1">
          <button
            onClick={() => onCopy(msg.id, msg.content)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-(--gray-400) hover:text-(--gray-600) hover:bg-(--gray-100) transition-colors cursor-pointer"
          >
            {msg.copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {msg.copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() =>
              onFeedback(msg.id, msg.feedback === "up" ? null : "up")
            }
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${msg.feedback === "up" ? "text-(--primary-600) bg-(--primary-50)" : "text-(--gray-400) hover:text-(--gray-600) hover:bg-(--gray-100)"}`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              onFeedback(msg.id, msg.feedback === "down" ? null : "down")
            }
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${msg.feedback === "down" ? "text-rose-500 bg-rose-50" : "text-(--gray-400) hover:text-(--gray-600) hover:bg-(--gray-100)"}`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main page
export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      title: "LLM fine-tuning basics",
      createdAt: "Today",
      messages: [
        {
          id: 1,
          role: "user",
          content: "What is fine-tuning in LLMs?",
          feedback: null,
          copied: false,
        },
        {
          id: 2,
          role: "assistant",
          content: MOCK_RESPONSES.default,
          feedback: null,
          copied: false,
        },
      ],
    },
  ]);
  const [activeConvId, setActiveConvId] = useState(1);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(100);

  const activeConv = conversations.find((c) => c.id === activeConvId)!;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, isTyping]);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg: Message = {
      id: ++idRef.current,
      role: "user",
      content,
      feedback: null,
      copied: false,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              title: c.messages.length === 0 ? content.slice(0, 40) : c.title,
            }
          : c,
      ),
    );
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: ++idRef.current,
        role: "assistant",
        content: getResponse(content),
        feedback: null,
        copied: false,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, messages: [...c.messages, aiMsg] }
            : c,
        ),
      );
      setIsTyping(false);
    }, 1200);
  };

  const handleNewConv = () => {
    const id = ++idRef.current;
    setConversations((prev) => [
      ...prev,
      { id, title: "New conversation", createdAt: "Today", messages: [] },
    ]);
    setActiveConvId(id);
    setSidebarOpen(false);
  };

  const handleDeleteConv = (id: number) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeConvId === id && next.length > 0) setActiveConvId(next[0].id);
      return next;
    });
  };

  const handleFeedback = (msgId: number, f: Feedback) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, feedback: f } : m,
              ),
            }
          : c,
      ),
    );
  };

  const handleCopy = (msgId: number, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, copied: true } : m,
              ),
            }
          : c,
      ),
    );
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === msgId ? { ...m, copied: false } : m,
                ),
              }
            : c,
        ),
      );
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerRef}
        className="opacity-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
            AI Assistant
          </h1>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-1">
            Ask anything about your courses - get instant, accurate answers.
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-4 h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[calc(100vh-220px)] min-h-120">
        {/* Conversation sidebar*/}
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
          fixed top-0 left-0 h-full z-40 w-64 bg-white border-r border-(--gray-200) flex flex-col transition-transform duration-300
          lg:static lg:translate-x-0 lg:z-auto lg:rounded-2xl lg:border lg:shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-(--gray-200) shrink-0">
            <p className="text-[14px] font-semibold text-(--text-title)">
              Conversations
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewConv}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conv list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${activeConvId === conv.id ? "bg-(--primary-50) border border-(--primary-200)" : "hover:bg-(--gray-50)"}`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[14px] font-medium truncate ${activeConvId === conv.id ? "text-(--primary-600)" : "text-(--text-title)"}`}
                  >
                    {conv.title}
                  </p>
                  <p className="text-[12px] text-(--gray-400)">
                    {conv.createdAt} · {conv.messages.length} msgs
                  </p>
                </div>
                {conversations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConv(conv.id);
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 text-(--gray-400) cursor-pointer transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/*  Chat area   */}
        <div className="flex flex-col flex-1 min-w-0 bg-white rounded-2xl border border-(--gray-200) overflow-hidden">
          {/* Chat topbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-(--gray-200) shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-500) cursor-pointer lg:hidden"
            >
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
            <div className="w-8 h-8 rounded-full bg-(--primary-600) flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-(--text-title) truncate">
                {activeConv.title}
              </p>
              <p className="text-[12px] text-(--gray-400)">
                CareerCollege AI · always available
              </p>
            </div>
            <button
              onClick={() => {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === activeConvId ? { ...c, messages: [] } : c,
                  ),
                );
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer transition-colors"
              title="Clear chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {activeConv.messages.length === 0 ? (
              /* Empty state — prompt suggestions */
              <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
                <div className="text-center">
                  <h3 className="text-[16px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
                    How can I help you today?
                  </h3>
                  <p className="text-[12px] md:text-[14px] lg:text-[14px]  text-(--gray-500) mt-1">
                    Ask me anything about your courses, concepts, or career.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.prompt)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-(--gray-200) hover:border-(--primary-300) hover:bg-(--primary-50) text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-(--gray-100) group-hover:bg-(--primary-100) flex items-center justify-center shrink-0 transition-colors">
                        <s.icon className="w-4 h-4 text-(--gray-500) group-hover:text-(--primary-600) transition-colors" />
                      </div>
                      <span className="text-[12px] md:text-[14px] lg:text-[14px] font-medium text-(--gray-600) group-hover:text-(--primary-600) transition-colors">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeConv.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onFeedback={handleFeedback}
                  onCopy={handleCopy}
                />
              ))
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-(--primary-600) flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-(--gray-200) rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-2 h-2 rounded-full bg-(--primary-400) animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-(--primary-400) animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-(--primary-400) animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="px-4 py-3  shrink-0">
            <div className="flex items-end gap-2 bg-(--gray-50) border border-(--gray-200) rounded-xl px-3 py-2 focus-within:border-(--primary-400) transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-[14px] text-(--text-title) placeholder:text-(--gray-400) leading-relaxed py-1 max-h-40"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12px] text-(--gray-400) mt-1.5 text-center">
              AI responses are for learning purposes. Always verify with course
              materials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
