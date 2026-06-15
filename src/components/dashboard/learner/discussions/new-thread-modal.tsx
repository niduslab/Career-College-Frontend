"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type { ThreadCategory } from "./types";
import { CATEGORIES } from "./data";

export function NewThreadModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (title: string, body: string, category: ThreadCategory) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ThreadCategory>("General");

  const canSubmit = title.trim().length > 5 && body.trim().length > 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--gray-200)">
          <h2 className="text-[16px] font-semibold text-(--text-title)">
            Start a Discussion
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Category */}
          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-1.5 block">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium border transition-colors cursor-pointer ${category === c ? "bg-(--primary-600) text-white border-(--primary-600)" : "bg-white text-(--gray-600) border-(--gray-200) hover:border-(--primary-300)"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-1.5 block">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              className="w-full h-10 px-3 rounded-lg border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors"
            />
          </div>

          {/* Body */}
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

        {/* Footer */}
        <div className="px-5 py-4 border-t border-(--gray-200) flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-(--gray-200) text-[14px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (canSubmit) {
                onSubmit(title, body, category);
                onClose();
              }
            }}
            disabled={!canSubmit}
            className="h-9 px-4 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Post Discussion
          </button>
        </div>
      </div>
    </div>
  );
}
