"use client";

import { useState } from "react";
import { X, Upload, ChevronDown } from "lucide-react";
import type { Lesson, LessonType } from "./types";
import { LESSON_TYPES, VIDEO_TYPES } from "./constants";

export default function LessonModal({
  onSave,
  onClose,
}: {
  onSave: (lesson: Omit<Lesson, "id">) => void;
  onClose: () => void;
}) {
  const [lessonType, setLessonType] = useState<LessonType>("Video");
  const [title, setTitle] = useState("");
  const [videoType, setVideoType] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("Follow my instruction");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      type: lessonType,
      title: title.trim(),
      videoType,
      duration,
      description,
      isFreePreview: videoType === "Free Preview",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] font-semibold text-(--text-title)">Add Lesson</h3>
          <button onClick={onClose} className="text-(--gray-400) hover:text-(--gray-600) cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Lesson Type */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-(--text-title)">Lesson Type</label>
            <div className="flex flex-wrap gap-2">
              {LESSON_TYPES.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLessonType(key)}
                  className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-[13px] font-medium cursor-pointer border transition-colors ${
                    lessonType === key
                      ? "bg-(--primary-600) text-white border-(--primary-600)"
                      : "border-(--gray-200) text-(--gray-600) hover:border-(--primary-300) hover:bg-(--primary-50)"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Video Title + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-(--text-title)">Video Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write video title"
                className="w-full h-11 px-3 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-(--text-title)">Type</label>
              <div className="relative">
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                  className="w-full h-11 px-3 pr-8 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) appearance-none cursor-pointer transition-shadow"
                >
                  <option value="">Select type</option>
                  {VIDEO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400) pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Video Duration */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-(--text-title)">Video Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Write video duration"
              className="w-full h-11 px-3 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-(--text-title)">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
            />
          </div>

          {/* Upload Video */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-(--text-title)">Upload Video</label>
            <div className="w-full rounded-lg border-2 border-dashed border-(--gray-200) bg-(--gray-50) flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-(--primary-300) hover:bg-(--primary-50) transition-colors">
              <Upload className="w-5 h-5 text-(--gray-400)" />
              <p className="text-[12px] text-(--gray-400)">Upload m4 Video</p>
            </div>
            <p className="text-[11px] text-(--gray-400)">
              Note: All files should be at least 720p and less than 4.0 GB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-(--gray-100)">
          <button
            onClick={onClose}
            className="px-5 h-10 text-[13px] font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 h-10 text-[13px] font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg cursor-pointer transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
