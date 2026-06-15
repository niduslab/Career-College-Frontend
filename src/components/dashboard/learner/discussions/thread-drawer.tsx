"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquare, ThumbsUp, X, Send } from "lucide-react";

import type { Thread } from "./types";

export function ThreadDrawer({
  thread,
  onClose,
  onLikeThread,
  onLikeReply,
  onAddReply,
}: {
  thread: Thread;
  onClose: () => void;
  onLikeThread: (id: number) => void;
  onLikeReply: (threadId: number, replyId: number) => void;
  onAddReply: (threadId: number, body: string) => void;
}) {
  const [replyText, setReplyText] = useState("");

  const submitReply = () => {
    const t = replyText.trim();
    if (!t) return;
    onAddReply(thread.id, t);
    setReplyText("");
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-50 w-full max-w-xl bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-(--gray-200)">
          <h2 className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-(--text-title) line-clamp-1 pr-4">
            {thread.title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Original post */}
          <div className="bg-(--primary-50) border border-(--primary-100) rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-(--gray-100)">
                <Image
                  src={thread.avatar}
                  alt={thread.author}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-(--text-title)">
                  {thread.author}
                </p>
                <p className="text-[12px] text-(--gray-400)">
                  {thread.time} · {thread.course}
                </p>
              </div>
            </div>
            <p className="text-[12px] text-(--gray-700) leading-relaxed mb-3">
              {thread.body}
            </p>
            {thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {thread.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-white text-(--gray-500) border border-(--gray-200)"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => onLikeThread(thread.id)}
              className={`flex items-center gap-1.5 text-[14px] font-medium transition-colors cursor-pointer ${thread.liked ? "text-(--primary-600)" : "text-(--gray-400) hover:text-(--primary-600)"}`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${thread.liked ? "fill-current" : ""}`}
              />
              {thread.likes}
            </button>
          </div>

          {/* Replies */}
          {thread.replies.length > 0 && (
            <div className="space-y-3">
              <p className="text-[12px] font-semibold text-(--gray-500) uppercase tracking-wide">
                {thread.replies.length}{" "}
                {thread.replies.length === 1 ? "Reply" : "Replies"}
              </p>
              {thread.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="bg-white rounded-xl border border-(--gray-200) p-4"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-(--gray-100)">
                      <Image
                        src={reply.avatar}
                        alt={reply.author}
                        width={28}
                        height={28}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-(--text-title)">
                        {reply.author}
                      </span>
                      {reply.isInstructor && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-(--primary-100) text-(--primary-600)">
                          Instructor
                        </span>
                      )}
                      <span className="text-[12px] text-(--gray-400) ml-auto">
                        {reply.time}
                      </span>
                    </div>
                  </div>
                  <p className="text-[12px] text-(--gray-600) leading-relaxed mb-2">
                    {reply.body}
                  </p>
                  <button
                    onClick={() => onLikeReply(thread.id, reply.id)}
                    className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors cursor-pointer ${reply.liked ? "text-(--primary-600)" : "text-(--gray-400) hover:text-(--primary-600)"}`}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${reply.liked ? "fill-current" : ""}`}
                    />
                    {reply.likes}
                  </button>
                </div>
              ))}
            </div>
          )}

          {thread.replies.length === 0 && (
            <div className="py-8 text-center text-(--gray-400)">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-[14px]">No replies yet. Be the first!</p>
            </div>
          )}
        </div>

        {/* Reply input */}
        <div className="shrink-0 px-5 py-4 border-t border-(--gray-200) flex items-end gap-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={1}
            className="flex-1 px-3 py-2.5 rounded-lg border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors "
          />
          <button
            onClick={submitReply}
            disabled={!replyText.trim()}
            className="w-10 h-10 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
