"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Video, Loader2, Upload } from "lucide-react";
import { createWebinar } from "@/lib/webinar-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import DateTimeField from "@/components/common/datetime-field";
import { SelectDropdown } from "@/components/common/select-dropdown";

const PROVIDER_OPTIONS = [
  { value: "zoom", label: "Zoom" },
  { value: "meet", label: "Google Meet" },
  { value: "jitsi", label: "Jitsi" },
  { value: "other", label: "Other" },
];

interface AddWebinarDrawerProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  title: string;
  description: string;
  scheduled_at: string;
  timezone: string;
  duration_minutes: string;
  max_capacity: string;
  price: string;
  meeting_provider: string;
  meeting_url: string;
}

const INITIAL: FormState = {
  title: "",
  description: "",
  scheduled_at: "",
  timezone: "Asia/Dhaka",
  duration_minutes: "60",
  max_capacity: "",
  price: "0.00",
  meeting_provider: "zoom",
  meeting_url: "",
};

export default function AddWebinarDrawer({
  open,
  onClose,
  onSaved,
}: AddWebinarDrawerProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    null,
  );
  const firstInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (open) {
      document.body.style.overflow = "hidden";
      t = setTimeout(() => firstInputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "";
      t = setTimeout(() => {
        setForm(INITIAL);
        setErrors({});
        setThumbnailFile(null);
        setThumbnailPreview(null);
      }, 300);
    }
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.scheduled_at)
      errs.scheduled_at = "Schedule date/time is required";
    else if (new Date(form.scheduled_at) <= new Date())
      errs.scheduled_at = "Must be in the future";
    if (!form.duration_minutes || Number(form.duration_minutes) <= 0)
      errs.duration_minutes = "Duration must be greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createWebinar({
        title: form.title,
        description: form.description,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        timezone: form.timezone,
        duration_minutes: Number(form.duration_minutes),
        max_capacity: form.max_capacity ? Number(form.max_capacity) : null,
        price: form.price || "0.00",
        meeting_provider: form.meeting_provider as
          | "zoom"
          | "meet"
          | "jitsi"
          | "other",
        meeting_url: form.meeting_url || undefined,
        ...(thumbnailFile ? { thumbnail: thumbnailFile } : {}),
      });
      notify.success("Webinar created.");
      onSaved();
      onClose();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to create webinar.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-100 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-101 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--gray-200) shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-(--primary-50) flex items-center justify-center">
              <Video className="w-4 h-4 text-(--primary-600)" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-(--text-title)">
                New Webinar
              </p>
              <p className="text-[12px] text-(--gray-500)">
                Created as a draft — assign a host before publishing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-500) cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }));
                if (errors.title)
                  setErrors((err) => ({ ...err, title: undefined }));
              }}
              placeholder="e.g. Scaling Django for High Traffic"
              className={`w-full h-12 px-3 text-[14px] border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow ${errors.title ? "border-red-400" : "border-(--gray-200)"}`}
            />
            {errors.title && (
              <p className="text-[12px] text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => {
                setForm((f) => ({ ...f, description: e.target.value }));
                if (errors.description)
                  setErrors((err) => ({ ...err, description: undefined }));
              }}
              placeholder="What will this live session cover?"
              className={`w-full px-3 py-2.5 text-[14px] border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none ${errors.description ? "border-red-400" : "border-(--gray-200)"}`}
            />
            {errors.description && (
              <p className="text-[12px] text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Thumbnail{" "}
              <span className="text-[12px] text-(--gray-400) font-normal">
                (optional)
              </span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="w-full aspect-video rounded-lg border-2 border-dashed border-(--gray-200) bg-(--gray-50) flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-(--primary-300) hover:bg-(--primary-50) transition-colors overflow-hidden"
            >
              {thumbnailPreview ? (
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
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
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            {thumbnailPreview && (
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                }}
                className="text-[12px] text-(--gray-400) hover:text-red-500 transition-colors cursor-pointer"
              >
                Remove image
              </button>
            )}
          </div>

          <DateTimeField
            label="Date & Time"
            required
            value={form.scheduled_at}
            disablePast
            onChange={(next) => {
              setForm((f) => ({ ...f, scheduled_at: next }));
              if (errors.scheduled_at)
                setErrors((err) => ({ ...err, scheduled_at: undefined }));
            }}
            error={errors.scheduled_at}
          />

          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Timezone
            </label>
            <input
              type="text"
              value={form.timezone}
              onChange={(e) =>
                setForm((f) => ({ ...f, timezone: e.target.value }))
              }
              placeholder="e.g. Asia/Dhaka"
              className="w-full h-12 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-(--text-title)">
                Duration (min)
              </label>
              <input
                type="number"
                min={1}
                value={form.duration_minutes}
                onChange={(e) => {
                  setForm((f) => ({ ...f, duration_minutes: e.target.value }));
                  if (errors.duration_minutes)
                    setErrors((err) => ({
                      ...err,
                      duration_minutes: undefined,
                    }));
                }}
                className={`w-full h-12 px-3 text-[14px] border rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow ${errors.duration_minutes ? "border-red-400" : "border-(--gray-200)"}`}
              />
              {errors.duration_minutes && (
                <p className="text-[12px] text-red-500">
                  {errors.duration_minutes}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-(--text-title)">
                Max Capacity{" "}
                <span className="text-[12px] text-(--gray-400) font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="number"
                min={1}
                value={form.max_capacity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, max_capacity: e.target.value }))
                }
                placeholder="Unlimited"
                className="w-full h-12 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Price (BDT){" "}
              <span className="text-[12px] text-(--gray-400) font-normal">
                (0.00 = free)
              </span>
            </label>
            <input
              type="text"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="0.00"
              className="w-full h-12 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-(--text-title)">
                Provider
              </label>
              <SelectDropdown
                value={form.meeting_provider}
                onChange={(value) =>
                  setForm((f) => ({ ...f, meeting_provider: value }))
                }
                options={PROVIDER_OPTIONS}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-(--text-title)">
                Meeting URL{" "}
                <span className="text-[12px] text-(--gray-400) font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="url"
                value={form.meeting_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meeting_url: e.target.value }))
                }
                placeholder="https://zoom.us/j/..."
                className="w-full h-12 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
          </div>

          <p className="text-[12px] text-(--gray-400)">
            Required before publishing: description, meeting URL, and an
            assigned host — add these on the webinar&apos;s detail page after
            creating it.
          </p>
        </form>

        <div className="px-6 py-4 border-t border-(--gray-200) flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-lg border border-(--gray-200) text-[14px] font-medium text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-lg bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) cursor-pointer transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Webinar
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
