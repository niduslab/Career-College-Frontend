"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function NewThreadModal({
  courseTitle,
  submitting,
  onClose,
  onSubmit,
}: {
  courseTitle: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (title: string, body: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // The write serializer accepts only title, body and an optional
  // related_content_id — no category, no tags.
  const canSubmit = title.trim().length > 5 && body.trim().length > 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--gray-200)">
          <h2 className="text-[16px] font-semibold text-(--text-title)">
            Ask a question
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-[12px] text-(--gray-500)">
            Posting to{" "}
            <span className="font-semibold text-(--text-title)">
              {courseTitle}
            </span>
            . The course instructors will be notified.
          </p>

          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-1.5 block">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="What's your question?"
              className="w-full h-10 px-3 rounded-lg border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-1.5 block">
              Details
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide context, code snippets, or what you've tried so far..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-(--gray-200) flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-(--gray-200) text-[14px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(title, body)}
            disabled={!canSubmit || submitting}
            className="h-9 px-4 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting…" : "Post Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
