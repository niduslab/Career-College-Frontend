"use client";

import { MessageSquare, ThumbsUp, Reply, Pin, Trash2 } from "lucide-react";

import type { QaQuestion } from "@/lib/course-qa-api";

export interface ThreadCardProps {
  thread: QaQuestion;
  /** True once this session has upvoted — the backend has no per-viewer vote
   *  row, so the state is local and only prevents a double-count. */
  hasUpvoted: boolean;
  onUpvote: (id: number) => void;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
}

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

/** Author initials stand in for the avatar the API doesn't return. */
function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function ThreadCard({
  thread,
  hasUpvoted,
  onUpvote,
  onOpen,
  onDelete,
}: ThreadCardProps) {
  return (
    <div
      className="discussion-card opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onOpen(thread.id)}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full shrink-0 bg-(--primary-100) text-(--primary-600) flex items-center justify-center text-[12px] font-semibold">
          {initials(thread.author_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[13px] font-semibold text-(--text-title)">
              {thread.author_name}
            </span>
            {thread.is_own && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-(--gray-100) text-(--gray-500)">
                You
              </span>
            )}
            <span className="text-[12px] text-(--gray-400)">
              {relativeTime(thread.created_at)}
            </span>
            {thread.is_pinned && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 ml-auto">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>
          {thread.related_content && (
            <div className="flex items-center gap-1.5 text-[12px] text-(--gray-400) capitalize">
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                on a {thread.related_content.item_type}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 mb-3">
        <h3 className="text-[15px] font-semibold text-(--text-title) leading-snug mb-1.5 line-clamp-2">
          {thread.title}
        </h3>
        <p className="text-[13px] text-(--gray-500) leading-relaxed line-clamp-2">
          {thread.body}
        </p>
      </div>

      <div className="flex items-center gap-4 pt-3 border-t border-(--gray-100)">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpvote(thread.id);
          }}
          disabled={hasUpvoted}
          title={hasUpvoted ? "You've upvoted this" : "Upvote"}
          className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors cursor-pointer disabled:cursor-default ${hasUpvoted ? "text-(--primary-600)" : "text-(--gray-400) hover:text-(--primary-600)"}`}
        >
          <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-current" : ""}`} />
          {thread.upvote_count}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(thread.id);
          }}
          className="flex items-center gap-1.5 text-[13px] font-medium text-(--gray-400) hover:text-(--primary-600) transition-colors cursor-pointer"
        >
          <Reply className="w-4 h-4" />
          {thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}
        </button>
        {thread.is_own && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(thread.id);
            }}
            className="ml-auto flex items-center gap-1.5 text-[12px] font-medium text-(--gray-400) hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
