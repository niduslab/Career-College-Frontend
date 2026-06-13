"use client";

import { Maximize, Send, Sparkles } from "lucide-react";
import { AI_SHORTCUTS } from "./data";
import type { AiMessage } from "./types";

export default function AiCopilot({
  aiMessages,
  aiInput,
  setAiInput,
  sendAiMessage,
  aiMessagesEndRef,
  setAiMessages,
}: {
  aiMessages: AiMessage[];
  aiInput: string;
  setAiInput: (v: string) => void;
  sendAiMessage: () => void;
  aiMessagesEndRef: React.RefObject<HTMLDivElement | null>;
  setAiMessages: React.Dispatch<React.SetStateAction<AiMessage[]>>;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--gray-200) shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-(--primary-600) flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
              AI Learning Copilot
            </p>
            <p className="text-[12px] text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Context: this lesson
            </p>
          </div>
        </div>
        <button className="w-7 h-7 flex items-center justify-center cursor-pointer rounded-lg hover:bg-(--gray-100) transition-colors text-(--gray-400)">
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {aiMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] text-[12px] leading-relaxed rounded-2xl px-4 py-3 ${
                msg.role === "ai"
                  ? "bg-(--gray-100) text-(--text-title) rounded-tl-sm"
                  : "bg-(--primary-600) text-white rounded-tr-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={aiMessagesEndRef} />
      </div>

      {/* Shortcuts */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex flex-wrap gap-2">
          {AI_SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                onClick={() =>
                  setAiMessages((prev) => [
                    ...prev,
                    { role: "user", text: s.label },
                    {
                      role: "ai",
                      text: `Here's what I found about "${s.label}" for this lesson...`,
                    },
                  ])
                }
                className="flex items-center gap-1.5 text-[12px] font-medium text-(--gray-500) border border-(--gray-200) px-3 py-1.5 rounded-full hover:bg-(--gray-50) transition-colors"
              >
                <Icon className="w-4 h-4" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex items-center gap-2 border border-(--gray-200) rounded-xl px-3 py-2.5 focus-within:border-(--primary-400) transition-colors bg-white">
          <input
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
            placeholder="Ask anything..."
            className="flex-1 text-[12px] lg:text-[14px]  text-(--text-title) placeholder:text-(--gray-400) outline-none bg-transparent"
          />
          <button
            onClick={sendAiMessage}
            disabled={!aiInput.trim()}
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-(--primary-600) hover:enabled:bg-(--primary-700)"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </>
  );
}
