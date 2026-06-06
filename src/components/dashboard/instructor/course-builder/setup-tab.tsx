"use client";

import { useRef, useState } from "react";
import { ChevronRight, Upload } from "lucide-react";
import RichTextEditor from "@/components/common/rich-text-editor";
import CustomSelect from "./custom-select";
import { CATEGORIES, LEVELS, LANGUAGES } from "./constants";
import Image from "next/image";

interface SetupForm {
  title: string;
  category: string;
  level: string;
  language: string;
  tagline: string;
  description: string;
}

export default function SetupTab({
  form,
  setForm,
  onContinue,
}: {
  form: SetupForm;
  setForm: React.Dispatch<React.SetStateAction<SetupForm>>;
  onContinue: () => void;
}) {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof SetupForm, value: string) =>
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
    <>
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left — Form */}
        <div className="flex-1 bg-white border border-(--gray-200) rounded-xl p-6 space-y-5">
          <h2 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            Course Setup
          </h2>

          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Course Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>

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

          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Tagline
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>

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
        <div className="w-full lg:w-72 shrink-0 bg-white border border-(--gray-200) rounded-xl p-5 space-y-3 h-auto">
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
              <Image
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

      {/* Footer */}
      <div className="flex justify-start gap-3">
        <button className="px-5 h-12 text-[14px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors">
          Save Draft
        </button>
        <button
          onClick={onContinue}
          className="px-5 h-12 text-[14px] cursor-pointer font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
