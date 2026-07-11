"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import RichTextEditor from "@/components/common/rich-text-editor";
import {
  SelectDropdown,
  type SelectOption,
} from "@/components/common/select-dropdown";
import CustomSelect from "./custom-select";
import { LEVELS, LANGUAGES } from "./constants";
import { getCourseCategories, type CourseCategory } from "@/lib/course-api";
import { notify } from "@/lib/toast";

export interface SetupForm {
  title: string;
  categoryId: number | null;
  category: string; // display label, kept for the preview drawer
  level: string;
  language: string;
  description: string;
  price: string;
  learningObjectives: string;
  prerequisites: string;
  audiences: string;
  thumbnailFile: File | null;
  thumbnailUrl: string | null;
}

/** Flatten the 2-level category tree into indented options for a flat dropdown. */
function flattenCategories(tree: CourseCategory[]): SelectOption[] {
  const options: SelectOption[] = [];
  for (const parent of tree) {
    options.push({ value: String(parent.id), label: parent.name });
    for (const child of parent.children) {
      options.push({ value: String(child.id), label: `— ${child.name}` });
    }
  }
  return options;
}

export default function SetupTab({
  form,
  setForm,
  onContinue,
  saving,
}: {
  form: SetupForm;
  setForm: React.Dispatch<React.SetStateAction<SetupForm>>;
  onContinue: () => void;
  saving?: boolean;
}) {
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    categoryId?: string;
    description?: string;
  }>({});

  useEffect(() => {
    let active = true;
    getCourseCategories()
      .then((tree) => {
        if (active) setCategoryOptions(flattenCategories(tree));
      })
      .catch(() => {
        notify.error("Failed to load categories.");
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const set = <K extends keyof SetupForm>(key: K, value: SetupForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "title" || key === "description") {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const setCategory = (idStr: string) => {
    const option = categoryOptions.find((o) => o.value === idStr);
    setForm((prev) => ({
      ...prev,
      categoryId: Number(idStr),
      category: option?.label.replace(/^—\s*/, "") ?? prev.category,
    }));
    setErrors((prev) => ({ ...prev, categoryId: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (form.title.trim().length < 5) {
      next.title = "Title must be at least 5 characters.";
    }
    if (!form.categoryId) {
      next.categoryId = "Please select a category.";
    }
    if (!form.description.trim()) {
      next.description = "Description is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      notify.error("Please fix the highlighted fields.");
      return;
    }
    onContinue();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      set("thumbnailFile", file);
      set("thumbnailUrl", URL.createObjectURL(file));
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      set("thumbnailFile", file);
      set("thumbnailUrl", URL.createObjectURL(file));
    }
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
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Full Stack Web Development"
              className={`w-full h-12 px-3 text-[14px] mt-1 border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow ${
                errors.title
                  ? "border-red-400 focus:ring-red-400"
                  : "border-(--gray-200) focus:ring-(--primary-700)"
              }`}
            />
            {errors.title && (
              <p className="text-[12px] text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-1">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-(--text-title)">
                Category <span className="text-red-500">*</span>
              </label>
              <SelectDropdown
                value={form.categoryId ? String(form.categoryId) : ""}
                onChange={setCategory}
                options={categoryOptions}
                placeholder={
                  loadingCategories ? "Loading categories…" : "Select category"
                }
              />
              {errors.categoryId && (
                <p className="text-[12px] text-red-500 mt-1">
                  {errors.categoryId}
                </p>
              )}
            </div>
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
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-(--text-title)">
                Price ($)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <RichTextEditor
                value={form.description}
                onChange={(html) => set("description", html)}
                placeholder="Write your course description..."
                minHeight="160px"
              />
            </div>
            {errors.description && (
              <p className="text-[12px] text-red-500 mt-1">
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Learning Objectives
              </label>
              <textarea
                value={form.learningObjectives}
                onChange={(e) => set("learningObjectives", e.target.value)}
                rows={4}
                placeholder={
                  "One per line, e.g.\nBuild production REST APIs.\nContainerize with Docker."
                }
                className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Prerequisites
              </label>
              <textarea
                value={form.prerequisites}
                onChange={(e) => set("prerequisites", e.target.value)}
                rows={4}
                placeholder={"One per line, e.g.\nComfortable with Python."}
                className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Audiences
              </label>
              <textarea
                value={form.audiences}
                onChange={(e) => set("audiences", e.target.value)}
                rows={4}
                placeholder={"One per line, e.g.\nBackend engineers."}
                className="w-full px-3 py-2.5 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
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
            {form.thumbnailUrl ? (
              <Image
                src={form.thumbnailUrl}
                alt="Cover"
                width={400}
                height={225}
                unoptimized
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
          {form.thumbnailUrl && (
            <button
              onClick={() => {
                set("thumbnailFile", null);
                set("thumbnailUrl", null);
              }}
              className="text-[12px] text-(--gray-400) hover:text-red-500 transition-colors"
            >
              Remove image
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-start gap-3">
        <button
          onClick={handleContinue}
          disabled={saving}
          className="px-5 h-12 text-[14px] cursor-pointer font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving…" : "Continue"}
          {!saving && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
