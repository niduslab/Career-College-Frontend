"use client";

import { useState } from "react";
import {
  ChevronLeft,
  CheckCircle2,
  Rocket,
  BookOpen,
  TvMinimalPlay,
} from "lucide-react";

type Visibility = "Public" | "Unlisted" | "Private";

const VISIBILITY_OPTIONS: { key: Visibility; label: string; sub: string }[] = [
  { key: "Public", label: "Public", sub: "listed in catalog" },
  { key: "Unlisted", label: "Unlisted", sub: "link only" },
  { key: "Private", label: "Private", sub: "invite only" },
];

const MARKETING_ITEMS = [
  "SEO title & description set",
  "Add a launch email",
  "Connect affiliate program",
];

interface ReviewModule {
  title: string;
  lessons: number;
  videos: number;
}

interface ReviewData {
  category: string;
  level: string;
  language: string;
  title: string;
  description: string;
  modules: ReviewModule[];
  totalLessons: number;
  totalVideos: number;
  price: string;
}

export default function ReviewTab({
  data,
  onBack,
  onPublish,
}: {
  data: ReviewData;
  onBack: () => void;
  onPublish?: () => void;
}) {
  const [visibility, setVisibility] = useState<Visibility>("Public");

  const checks = [
    {
      label: "Course title & description",
      ready: !!(data.title && data.description),
    },
    { label: "At least 1 module added", ready: data.modules.length >= 1 },
    { label: "At least 3 lessons", ready: data.totalLessons >= 3 },
    { label: "Pricing configured", ready: !!data.price },
    { label: "Preview lesson set (free)", ready: true },
  ];

  const allReady = checks.every((c) => c.ready);

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ── Left — main content ── */}
      <div className="flex-1 space-y-5">
        <div className="bg-white border border-(--gray-200) rounded-xl p-6 space-y-5">
          {/* Header */}
          <div>
            <h2 className="text-[16px] lg:text-[18px] font-semibold text-(--text-title)">
              Pre-flight review
            </h2>
            <p className="text-[14px] text-(--gray-500) mt-0.5">
              Confirm everything looks right before you publish.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            {checks.map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between px-4 py-3 border border-(--gray-200) rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`w-5 h-5 shrink-0 ${c.ready ? "text-green-500" : "text-(--gray-300)"}`}
                  />
                  <span
                    className={`text-[13px] ${c.ready ? "text-(--text-title)" : "text-(--gray-400)"}`}
                  >
                    {c.label}
                  </span>
                </div>
                {c.ready && (
                  <span className="text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                    Ready
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Course Summary */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
              Course Summary
            </p>
            <div className="border border-(--gray-200) rounded-xl p-5 space-y-3">
              <p className="text-[12px] text-(--gray-400)">
                {data.category} · {data.level} · {data.language}
              </p>
              <h3 className="text-[18px] font-bold text-(--text-title) leading-snug">
                {data.title || "Untitled Course"}
              </h3>
              <p className="text-[13px] text-(--gray-500) leading-relaxed">
                {data.description}
              </p>
              <div className="grid grid-cols-4 gap-3 pt-1 border-t border-(--gray-100)">
                {[
                  { label: "Modules", value: data.modules.length },
                  { label: "Lessons", value: data.totalLessons },
                  { label: "Videos", value: data.totalVideos },
                  {
                    label: "Price",
                    value: data.price ? `$${data.price}` : "Free",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold tracking-widest text-(--gray-400) uppercase">
                      {label}
                    </p>
                    <p className="text-[18px] font-bold text-(--text-title) mt-0.5">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Curriculum Outline */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
              Curriculum Outline
            </p>
            <div className="space-y-2">
              {data.modules.map((mod, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 border border-(--gray-200) rounded-xl"
                >
                  <div className="w-7 h-7 rounded-full bg-(--primary-700) text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-(--text-title) truncate">
                      {mod.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-(--gray-400)">
                        <BookOpen className="w-3 h-3" />
                        {mod.lessons} lesson{mod.lessons !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-(--gray-400)">
                        <TvMinimalPlay className="w-3 h-3" />
                        {mod.videos} video{mod.videos !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 h-12 text-[14px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Curriculum
          </button>
          <button
            onClick={onPublish}
            disabled={!allReady}
            className="flex items-center gap-2 px-6 h-12 text-[14px] cursor-pointer font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Rocket className="w-4 h-4" />
            Publish course
          </button>
        </div>
      </div>

      {/* ── Right — sidebar ── */}
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        {/* Visibility */}
        <div className="bg-white border border-(--gray-200) rounded-xl p-5 space-y-3">
          <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
            Visibility
          </p>
          <div className="space-y-2.5">
            {VISIBILITY_OPTIONS.map(({ key, label, sub }) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === key}
                  onChange={() => setVisibility(key)}
                  className="w-4 h-4 accent-(--primary-600) cursor-pointer"
                />
                <span className="text-[13px] text-(--text-title)">
                  {label} <span className="text-(--gray-400)">— {sub}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Marketing */}
        <div className="bg-white border border-(--gray-200) rounded-xl p-5 space-y-3">
          <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
            Marketing
          </p>
          <div className="space-y-2">
            {MARKETING_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-[13px] text-(--primary-600)">⇌</span>
                <p className="text-[12px] text-(--gray-500)">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Post-publish */}
        <div className="bg-white border border-(--gray-200) rounded-xl p-5 space-y-2">
          <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
            Post-Publish
          </p>
          <p className="text-[12px] text-(--gray-500) leading-relaxed">
            After{" "}
            <span className="text-(--primary-600) font-medium">publishing</span>{" "}
            you&apos;ll get a shareable URL, social cards, and a launch
            checklist.
          </p>
        </div>
      </div>
    </div>
  );
}
