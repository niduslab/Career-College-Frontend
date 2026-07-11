"use client";

import { useState } from "react";
import { X, BookOpen, Trash, Trash2 } from "lucide-react";

export default function ModuleModal({
  module,
  lessonCount,
  onSave,
  onDelete,
  onClose,
}: {
  module: { title: string; summary: string } | null;
  lessonCount?: number;
  onSave: (title: string, summary: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(module?.title ?? "");
  const [summary, setSummary] = useState(module?.summary ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col ">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            {module ? "Edit module" : "Add Module"}
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="  px-6 py-5 space-y-5 flex-1">
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Module Title
            </label>
            <input
              type="text"
              value={title}
              placeholder="e.g. Introduction to React"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 mt-1 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-(--gray-50) text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              placeholder="e.g. An introduction to the fundamentals of React..."
              className="w-full mt-1 px-3 py-2.5 text-[14px] border border-(--gray-200) rounded-lg bg-(--gray-50) text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow "
            />
          </div>

          {module && typeof lessonCount === "number" && (
            <p className="text-[14px] text-(--gray-500) flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {lessonCount} lesson{lessonCount !== 1 ? "s" : ""} inside this
              module.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between  px-6 py-4">
          {module && onDelete ? (
            <button
              onClick={onDelete}
              className="text-[14px] text-red-500 font-normal hover:text-red-600 cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete module
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-500) hover:bg-(--gray-50) cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (title.trim()) onSave(title.trim(), summary.trim());
              }}
              className="px-4 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors"
            >
              {module ? "Update module" : "Save module"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
