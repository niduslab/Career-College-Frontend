"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Loader2,
  Upload,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import Image from "next/image";
import RichTextEditor from "@/components/common/rich-text-editor";
import {
  SelectDropdown,
  type SelectOption,
} from "@/components/common/select-dropdown";
import CustomSelect from "./custom-select";
import SearchableSelect from "./searchable-select";
import { LEVELS } from "./constants";
import { LANGUAGES } from "./languages";
import { getCourseCategories, type CourseCategory } from "@/lib/course-api";
import { notify } from "@/lib/toast";

interface OutlineWeek {
  id: number;
  topic: string;
}

let outlineRowId = 0;
function nextOutlineRowId() {
  outlineRowId += 1;
  return outlineRowId;
}

/** "Week 1: HTML/CSS\nWeek 2: JavaScript" -> rows. Falls back to one row per line for text that doesn't match the "Week N: " pattern (e.g. a legacy freeform outline). */
function parseOutline(text: string): OutlineWeek[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return [];
  return lines.map((line) => {
    const match = line.match(/^Week\s+\d+:\s*(.*)$/i);
    return { id: nextOutlineRowId(), topic: match ? match[1] : line };
  });
}

function serializeOutline(weeks: OutlineWeek[]): string {
  return weeks.map((w, i) => `Week ${i + 1}: ${w.topic}`).join("\n");
}

function WeekOutlineEditor({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (next: string) => void;
  hasError?: boolean;
}) {
  const [weeks, setWeeks] = useState<OutlineWeek[]>(() => parseOutline(value));

  const [lastCommitted, setLastCommitted] = useState(value);

  if (value !== lastCommitted) {
    setLastCommitted(value);
    setWeeks(parseOutline(value));
  }

  const commit = (next: OutlineWeek[]) => {
    const serialized = serializeOutline(next);
    setLastCommitted(serialized);
    setWeeks(next);
    onChange(serialized);
  };

  const addWeek = () => {
    commit([...weeks, { id: nextOutlineRowId(), topic: "" }]);
  };

  const removeWeek = (id: number) => {
    commit(weeks.filter((w) => w.id !== id));
  };

  const updateWeek = (id: number, topic: string) => {
    commit(weeks.map((w) => (w.id === id ? { ...w, topic } : w)));
  };

  return (
    <div className="space-y-2">
      {weeks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-(--gray-200) bg-(--gray-50) py-6 text-center">
          <p className="text-[13px] text-(--gray-400)">No weeks added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {weeks.map((week, i) => (
            <div key={week.id} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-(--gray-300) shrink-0" />
              <span className="w-16 shrink-0 text-[13px] font-medium text-(--gray-500)">
                Week {i + 1}
              </span>
              <input
                type="text"
                value={week.topic}
                onChange={(e) => updateWeek(week.id, e.target.value)}
                placeholder="e.g. HTML & CSS fundamentals"
                className={`flex-1 h-10 px-3 text-[14px] border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow ${
                  hasError && !week.topic.trim()
                    ? "border-red-400 focus:ring-red-400"
                    : "border-(--gray-200) focus:ring-(--primary-700)"
                }`}
              />
              <button
                type="button"
                onClick={() => removeWeek(week.id)}
                className="shrink-0 p-2 text-(--gray-400) hover:text-red-500 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={addWeek}
        className="flex items-center gap-2 text-[13px] font-medium text-(--primary-700) hover:text-(--primary-900) cursor-pointer transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Week
      </button>
    </div>
  );
}

export interface SetupForm {
  title: string;
  categoryId: number | null;
  category: string; // display label, kept for the preview drawer
  level: string;
  language: string;
  description: string;
  price: string;
  durationMinutes: string;
  learningObjectives: string;
  prerequisites: string;
  audiences: string;
  thumbnailFile: File | null;
  thumbnailUrl: string | null;
  /** Set once at creation and immutable afterward — not editable here after the course exists. */
  deliveryMode: "self_paced" | "scheduled";
  /** Only required (non-blank) before submission when deliveryMode is "scheduled". */
  courseOutline: string;
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

/** True when rich-text HTML has no visible text (e.g. "" or "<p></p>"). */
function isBlankHtml(html: string): boolean {
  return !html.replace(/<[^>]*>/g, "").trim();
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
    price?: string;
    learningObjectives?: string;
    prerequisites?: string;
    audiences?: string;
    courseOutline?: string;
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
    if (
      key === "title" ||
      key === "description" ||
      key === "price" ||
      key === "learningObjectives" ||
      key === "prerequisites" ||
      key === "audiences"
    ) {
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
    if (isBlankHtml(form.description)) {
      next.description = "Description is required.";
    }
    if (form.price.trim() === "" || isNaN(Number(form.price)) || Number(form.price) < 0) {
      next.price = "Enter a valid price (0 or more).";
    }
    if (isBlankHtml(form.learningObjectives)) {
      next.learningObjectives = "Learning objectives are required.";
    }
    if (isBlankHtml(form.prerequisites)) {
      next.prerequisites = "Prerequisites are required.";
    }
    if (isBlankHtml(form.audiences)) {
      next.audiences = "Audiences are required.";
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-1">
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
            <SearchableSelect
              label="Language"
              value={form.language}
              options={LANGUAGES}
              onChange={(v) => set("language", v)}
            />
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-(--text-title)">
                Price (BDT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
                className={`w-full h-12 px-3 text-[14px] mt-1 border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  errors.price
                    ? "border-red-400 focus:ring-red-400"
                    : "border-(--gray-200) focus:ring-(--primary-700)"
                }`}
              />
              {errors.price && (
                <p className="text-[12px] text-red-500 mt-1">{errors.price}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-(--text-title)">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={0}
                value={form.durationMinutes}
                onChange={(e) => set("durationMinutes", e.target.value)}
                placeholder="e.g. 240"
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

          {form.deliveryMode === "scheduled" && (
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Course Outline <span className="text-red-500">*</span>
                <span className="text-[12px] text-(--gray-400) font-normal ml-1">
                  (required before submitting a scheduled course)
                </span>
              </label>
              <div className="mt-1">
                <WeekOutlineEditor
                  value={form.courseOutline}
                  onChange={(next) => {
                    set("courseOutline", next);
                    setErrors((prev) => ({
                      ...prev,
                      courseOutline: undefined,
                    }));
                  }}
                  hasError={!!errors.courseOutline}
                />
              </div>
              {errors.courseOutline && (
                <p className="text-[12px] text-red-500 mt-1">
                  {errors.courseOutline}
                </p>
              )}
              <p className="text-[12px] text-(--gray-500)">
                A written outline stands in for a fully-built curriculum on
                scheduled courses — you can still add real sections/lessons, but
                they aren&apos;t required before submitting.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Learning Objectives <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <RichTextEditor
                  value={form.learningObjectives}
                  onChange={(html) => set("learningObjectives", html)}
                  placeholder={
                    "One per line, e.g.\nBuild production REST APIs.\nContainerize with Docker."
                  }
                  minHeight="120px"
                />
              </div>
              <p className="text-[12px] text-(--gray-500)">
                Use a bullet list if you have more than one.
              </p>
              {errors.learningObjectives && (
                <p className="text-[12px] text-red-500 mt-1">
                  {errors.learningObjectives}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Prerequisites <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <RichTextEditor
                  value={form.prerequisites}
                  onChange={(html) => set("prerequisites", html)}
                  placeholder={"One per line, e.g.\nComfortable with Python."}
                  minHeight="120px"
                />
              </div>
              <p className="text-[12px] text-(--gray-500)">
                Use a bullet list if you have more than one.
              </p>
              {errors.prerequisites && (
                <p className="text-[12px] text-red-500 mt-1">
                  {errors.prerequisites}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Audiences <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <RichTextEditor
                  value={form.audiences}
                  onChange={(html) => set("audiences", html)}
                  placeholder={"One per line, e.g.\nBackend engineers."}
                  minHeight="120px"
                />
              </div>
              <p className="text-[12px] text-(--gray-500)">
                Use a bullet list if you have more than one.
              </p>
              {errors.audiences && (
                <p className="text-[12px] text-red-500 mt-1">
                  {errors.audiences}
                </p>
              )}
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
