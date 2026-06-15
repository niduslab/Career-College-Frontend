"use client";

import Image from "next/image";
import { MessageSquare, ThumbsUp, Reply, Pin, BookOpen } from "lucide-react";

import type { Thread } from "./types";

export interface ThreadCardProps {
  thread: Thread;
  onLike: (id: number) => void;
  onOpen: (id: number) => void;
}

export function ThreadCard({ thread, onLike, onOpen }: ThreadCardProps) {
  return (
    <div
      className="discussion-card opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onOpen(thread.id)}
    >
      {/* Top */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-(--gray-100)">
          <Image
            src={thread.avatar}
            alt={thread.author}
            width={36}
            height={36}
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[13px] font-semibold text-(--text-title)">
              {thread.author}
            </span>
            {thread.isInstructor && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-(--primary-100) text-(--primary-600)">
                Instructor
              </span>
            )}
            <span className="text-[12px] text-(--gray-400)">{thread.time}</span>
            {thread.pinned && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 ml-auto">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-(--gray-400)">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{thread.course}</span>
          </div>
        </div>
        {/* Category chip */}
        <span className="shrink-0 text-[12px] font-medium px-2.5 py-1 rounded-full bg-(--primary-50) text-(--primary-600) border border-(--primary-100)">
          {thread.category}
        </span>
      </div>

      {/* Title + body */}
      <div className="mt-3 mb-3">
        <h3 className="text-[15px] font-semibold text-(--text-title) leading-snug mb-1.5 line-clamp-2">
          {thread.title}
        </h3>
        <p className="text-[13px] text-(--gray-500) leading-relaxed line-clamp-2">
          {thread.body}
        </p>
      </div>

      {/* Tags */}
      {thread.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {thread.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-(--gray-100) text-(--gray-500)"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 border-t border-(--gray-100)">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(thread.id);
          }}
          className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors cursor-pointer ${thread.liked ? "text-(--primary-600)" : "text-(--gray-400) hover:text-(--primary-600)"}`}
        >
          <ThumbsUp
            className={`w-4 h-4 ${thread.liked ? "fill-current" : ""}`}
          />
          {thread.likes}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(thread.id);
          }}
          className="flex items-center gap-1.5 text-[13px] font-medium text-(--gray-400) hover:text-(--primary-600) transition-colors cursor-pointer"
        >
          <Reply className="w-4 h-4" />
          {thread.replies.length}{" "}
          {thread.replies.length === 1 ? "reply" : "replies"}
        </button>
        <span className="ml-auto flex items-center gap-1.5 text-[12px] text-(--gray-400)">
          <MessageSquare className="w-3.5 h-3.5" />
          View thread
        </span>
      </div>
    </div>
  );
}
