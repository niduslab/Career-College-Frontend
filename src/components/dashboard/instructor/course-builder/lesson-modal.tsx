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
  const [typeDropOpen, setTypeDropOpen] = useState(false);
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
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            Add Lesson
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Lesson Type */}
          <div className="space-y-2">
            <label className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
              Lesson Type
            </label>
            <div className="flex flex-wrap gap-2">
              {LESSON_TYPES.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLessonType(key)}
                  className={`flex items-center gap-2 mt-1 px-3 h-10 rounded-md text-[14px]  cursor-pointer border transition-colors ${
                    lessonType === key
                      ? "bg-(--primary-700) text-white border-(--primary-700) font-semibold"
                      : "border-(--gray-200) text-(--text-paragraph) hover:border-(--primary-300) hover:bg-(--primary-50) font-normal"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Video Title + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write video title"
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Type
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTypeDropOpen((v) => !v)}
                  className="flex items-center w-full h-12 mt-1 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors"
                >
                  <span
                    className={`flex-1 text-left ${videoType ? "text-(--text-title)" : "text-(--gray-400)"}`}
                  >
                    {videoType || "Select type"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-(--gray-500) transition-transform duration-200 ${typeDropOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {typeDropOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-50 py-1">
                    {VIDEO_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setVideoType(t);
                          setTypeDropOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[14px] transition-colors ${
                          t === videoType
                            ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                            : "text-(--gray-600) hover:bg-(--gray-50)"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Duration */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Video Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Write video duration"
              className="w-full h-12 px-3 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Write video description"
              className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow "
            />
          </div>

          {/* Upload Video */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Upload Video
            </label>
            <div className="w-full rounded-lg border mt-1 border-dashed border-(--gray-200) bg-(--gray-50) flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-(--primary-300) hover:bg-(--primary-50) transition-colors">
              <Upload className="w-5 h-5 text-(--gray-400)" />
              <p className="text-[12px] text-(--gray-500)">Upload m4 Video</p>
            </div>
            <p className="text-[12px] text-(--gray-500)">
              Note: All files should be at least 720p and less than 4.0 GB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 ">
          <button
            onClick={onClose}
            className="px-5 h-10 text-[16px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 h-10 text-[16px] font-normal bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
