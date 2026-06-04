"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import type { Lesson } from "./types";

export default function CodingExerciseModal({
  initialLesson,
  onSave,
  onClose,
}: {
  initialLesson?: Omit<Lesson, "id">;
  onSave: (lesson: Omit<Lesson, "id">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialLesson?.title ?? "");
  const [duration, setDuration] = useState(initialLesson?.duration ?? "");
  const [description, setDescription] = useState(
    initialLesson?.description ?? "",
  );
  const [starterCode, setStarterCode] = useState(
    "function solution(input) {\n  // your code here\n}",
  );
  const [expectedOutput, setExpectedOutput] = useState(
    "solution([1,2,3]) // = 6",
  );

  const isEdit = !!initialLesson;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      type: "Coding Exercise",
      title: title.trim(),
      videoType: "",
      duration,
      description,
      isFreePreview: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[94vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            {isEdit ? "Edit Coding Exercise" : "Add Coding Exercise"}
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

          {/* Lesson Title + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Lesson Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New Coding Exercise"
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="12.10"
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What will learn student in this lesson"
              className="w-full px-3 py-3 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
            />
          </div>

          {/* Starter Code */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Starter Code
            </label>
            <textarea
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              rows={5}
              spellCheck={false}
              className="w-full px-3 py-3 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
            />
          </div>

          {/* Expected output / test cases */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Expected output / test cases
            </label>
            <textarea
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              rows={4}
              spellCheck={false}
              className="w-full px-3 py-3 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-(--gray-100)">
          {isEdit ? (
            <button className="flex items-center gap-2 text-[14px] font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete Quiz
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleSave}
              className="px-5 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors"
            >
              Save Lesson
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
