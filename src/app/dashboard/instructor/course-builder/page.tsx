"use client";

import { useState, useRef } from "react";
import RichTextEditor from "@/components/common/rich-text-editor";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  BookOpen,
  DollarSign,
  Rocket,
  Upload,
  Eye,
} from "lucide-react";

type Step = "Setup" | "Curriculum" | "Pricing" | "Review";

const steps: { key: Step; icon: React.ElementType }[] = [
  { key: "Setup", icon: Settings },
  { key: "Curriculum", icon: BookOpen },
  { key: "Pricing", icon: DollarSign },
  { key: "Review", icon: Rocket },
];

const CATEGORIES = [
  "Design",
  "Development",
  "Marketing",
  "Business",
  "Photography",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Arabic"];

// Custom dropdown — same pattern as university-partnership-form
function CustomSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-(--text-title)">
        {label}
      </label>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full h-12 px-3 rounded-lg cursor-pointer border border-(--gray-200) bg-white text-[13px] text-(--gray-500) focus:outline-none focus:ring-2 focus:ring-(--primary-700) text-left flex items-center justify-between transition-shadow"
        >
          <span className={value ? "text-(--text-title)" : "text-(--gray-400)"}>
            {value || `Select ${label.toLowerCase()}`}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-(--gray-500) pointer-events-none" />
          ) : (
            <ChevronDown className="w-4 h-4 text-(--gray-500) pointer-events-none" />
          )}
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-[14px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors hover:bg-purple-50 ${
                  opt === value
                    ? "bg-purple-50 text-(--primary-700) font-medium"
                    : "text-gray-500"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourseBuilderPage() {
  const [activeStep, setActiveStep] = useState<Step>("Setup");
  const [form, setForm] = useState({
    title: "Advanced UI/UX Course",
    category: "Design",
    level: "Intermediate",
    language: "English",
    tagline: "Working Draft",
    description:
      "A studio course on shaping narrative through architectural form, light, and material.",
  });
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/"))
      setCoverImage(URL.createObjectURL(file));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCoverImage(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            Course Builder
          </h1>
          <p className="text-[13px] text-[#4a5565] mt-1">
            Advanced — Working Draft
          </p>
        </div>
        <button className="flex items-center gap-2 bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold px-4 h-10 rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Step Tabs */}
      <div className="bg-white border border-(--gray-200) rounded-xl px-5 py-3 flex items-center gap-2 flex-wrap">
        {steps.map(({ key, icon: Icon }, i) => {
          const isActive = activeStep === key;
          const isPast = steps.findIndex((s) => s.key === activeStep) > i;
          return (
            <div key={key} className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(key)}
                className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-(--primary-600) text-white"
                    : isPast
                      ? "text-(--primary-600) hover:bg-(--primary-50)"
                      : "text-(--gray-400) hover:bg-(--gray-50)"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {key}
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-(--gray-300)" />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      {activeStep === "Setup" && (
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left — Form */}
          <div className="flex-1 bg-white border border-(--gray-200) rounded-xl p-6 space-y-5">
            <h2 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
              Course Setup
            </h2>

            {/* Course Title */}
            <div className="space-y-1.5">
              <label className="text-[14px]  font-normal text-(--text-title)">
                Course Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>

            {/* Category / Level / Language — custom dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
              <CustomSelect
                label="Category"
                value={form.category}
                options={CATEGORIES}
                onChange={(v) => set("category", v)}
              />
              <CustomSelect
                label="Level"
                value={form.level}
                options={LEVELS}
                onChange={(v) => set("level", v)}
              />
              <CustomSelect
                label="Language"
                value={form.language}
                options={LANGUAGES}
                onChange={(v) => set("language", v)}
              />
            </div>

            {/* Tagline */}
            <div className="space-y-1.5">
              <label className="text-[14px]  font-normal text-(--text-title)">
                Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Description
              </label>
              <div className="mt-1">
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => set("description", html)}
                  placeholder="Write your course description..."
                  minHeight="160px"
                />
              </div>
            </div>
          </div>

          {/* Right — Cover Image */}
          <div className="w-full lg:w-72 shrink-0 bg-white border  border-(--gray-200) rounded-xl p-5 space-y-3 h-auto">
            <h2 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
              Cover Image
            </h2>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video rounded-lg border-2 border-dashed border-(--gray-200) bg-(--gray-50) flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-(--primary-300) hover:bg-(--primary-50) transition-colors overflow-hidden"
            >
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-(--gray-400)" />
                  <p className="text-[12px] text-(--gray-400) text-center leading-snug">
                    Drop Image
                    <br />
                    (1920x1080)
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            {coverImage && (
              <button
                onClick={() => setCoverImage(null)}
                className="text-[12px] text-(--gray-400) hover:text-red-500 transition-colors"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
      )}

      {/* Placeholder for other steps */}
      {activeStep !== "Setup" && (
        <div className="bg-white border border-(--gray-200) rounded-xl p-10 flex items-center justify-center">
          <p className="text-[14px] text-(--gray-400)">
            {activeStep} section — coming soon
          </p>
        </div>
      )}

      {/* Footer Actions */}
      {activeStep === "Setup" && (
        <div className="flex justify-start gap-3">
          <button className="px-5 h-12 text-[14px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors">
            Save Draft
          </button>
          <button
            onClick={() => setActiveStep("Curriculum")}
            className="px-5 h-12 text-[14px] cursor-pointer font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors flex items-center gap-2"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
