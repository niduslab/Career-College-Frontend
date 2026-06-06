"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X, CheckCircle2, ChevronDown } from "lucide-react";
import DatePicker from "@/components/common/date-picker";

const PLATFORMS = ["Zoom", "Google Meet", "Microsoft Teams", "YouTube Live"];

export interface SessionFormData {
  title: string;
  date: string;
  time: string;
  duration: string;
  platform: string;
  link: string;
}

export default function CreateSessionModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: SessionFormData) => void;
}) {
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [platform, setPlatform] = useState("Zoom");
  const [platformOpen, setPlatformOpen] = useState(false);
  const [link, setLink] = useState("");

  const handleSave = () => {
    const dateStr = selected ? format(selected, "yyyy-MM-dd") : "";
    if (!title.trim() || !dateStr || !time) return;
    onSave({
      title: title.trim(),
      date: dateStr,
      time,
      duration: `${duration} min`,
      platform,
      link,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            Create Live Session
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-700) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React Hooks Live Workshop"
              className="w-full mt-1 h-11 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Date"
              value={selected}
              onChange={setSelected}
              placeholder="Pick a date"
              disablePast
            />
            <div className="space-y-1.5">
              <label className="text-[14px]  font-medium text-(--text-title)">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full mt-1  h-11 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
          </div>

          {/* Duration + Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-(--text-title)">
                Duration (min)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min={15}
                className="w-full mt-1 h-11 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-(--text-title)">
                Platform
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPlatformOpen((v) => !v)}
                  className="flex items-center w-full h-11 mt-1 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors"
                >
                  <span className="flex-1 text-left text-(--text-title)">
                    {platform}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-(--gray-400) transition-transform duration-200 ${platformOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {platformOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-50 py-1">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPlatform(p);
                          setPlatformOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[14px] cursor-pointer transition-colors ${p === platform ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Link */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Session Link
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full mt-1 h-11 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 ">
          <button
            onClick={onClose}
            className="px-5 h-11 text-[14px] font-normal border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 h-11 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Schedule Session
          </button>
        </div>
      </div>
    </div>
  );
}
