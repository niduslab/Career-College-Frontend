"use client";

import { useState } from "react";
import { MessageSquare, ThumbsUp, X, Send, Trash2 } from "lucide-react";

import type { QaQuestionDetail } from "@/lib/course-qa-api";

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.round(days / 7)}w ago`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function ThreadDrawer({
  thread,
  isLoading,
  submitting,
  onClose,
  onUpvoteQuestion,
  onUpvoteReply,
  onAddReply,
  onDeleteReply,
}: {
  thread: QaQuestionDetail | null;
  isLoading: boolean;
  submitting: boolean;
  onClose: () => void;
  onUpvoteQuestion: (id: number) => void;
  onUpvoteReply: (id: number) => void;
  onAddReply: (questionId: number, body: string) => void;
  onDeleteReply: (id: number) => void;
}) {
  const [replyText, setReplyText] = useState("");

  const submitReply = () => {
    const body = replyText.trim();
    if (!body || !thread) return;
    onAddReply(thread.id, body);
    setReplyText("");
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-xl bg-white h-full flex flex-col shadow-2xl">
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-(--gray-200)">
          <h2 className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-(--text-title) line-clamp-1 pr-4">
            {thread?.title ?? "Loading…"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {isLoading || !thread ? (
            <p className="py-10 text-center text-[14px] text-(--gray-400)">
              Loading question…
            </p>
          ) : (
            <>
              <div className="bg-(--primary-50) border border-(--primary-100) rounded-2xl p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full shrink-0 bg-(--primary-100) text-(--primary-600) flex items-center justify-center text-[12px] font-semibold">
                    {initials(thread.author_name)}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-(--text-title)">
                      {thread.author_name}
                    </p>
                    <p className="text-[12px] text-(--gray-400)">
                      {relativeTime(thread.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-(--gray-700) leading-relaxed mb-3 whitespace-pre-line">
                  {thread.body}
                </p>
                <button
                  onClick={() => onUpvoteQuestion(thread.id)}
                  className="flex items-center gap-1.5 text-[14px] font-medium text-(--gray-400) hover:text-(--primary-600) transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {thread.upvote_count}
                </button>
              </div>

              {thread.replies.length > 0 ? (
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
                        <div className="w-7 h-7 rounded-full shrink-0 bg-(--gray-100) text-(--gray-600) flex items-center justify-center text-[11px] font-semibold">
                          {initials(reply.author_name)}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                          <span className="text-[13px] font-semibold text-(--text-title)">
                            {reply.author_name}
                          </span>
                          {reply.is_instructor_reply && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-(--primary-100) text-(--primary-600)">
                              Instructor
                            </span>
                          )}
                          <span className="text-[12px] text-(--gray-400) ml-auto">
                            {relativeTime(reply.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-[12px] text-(--gray-600) leading-relaxed mb-2 whitespace-pre-line">
                        {reply.body}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onUpvoteReply(reply.id)}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-(--gray-400) hover:text-(--primary-600) transition-colors cursor-pointer"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {reply.upvote_count}
                        </button>
                        {reply.is_own && (
                          <button
                            onClick={() => onDeleteReply(reply.id)}
                            className="flex items-center gap-1.5 text-[12px] font-medium text-(--gray-400) hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-(--gray-400)">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-[14px]">No replies yet. Be the first!</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-(--gray-200) flex items-end gap-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={1}
            className="flex-1 px-3 py-2.5 rounded-lg border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors"
          />
          <button
            onClick={submitReply}
            disabled={!replyText.trim() || submitting || !thread}
            className="w-10 h-10 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
