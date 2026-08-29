"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { updateWebinar, type Webinar } from "@/lib/webinar-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import DateTimeField, { isoToLocalInput } from "@/components/common/datetime-field";
import { SelectDropdown } from "@/components/common/select-dropdown";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";

const PROVIDER_OPTIONS = [
  { value: "zoom", label: "Zoom" },
  { value: "meet", label: "Google Meet" },
  { value: "jitsi", label: "Jitsi" },
  { value: "other", label: "Other" },
];

interface MetadataFormProps {
  webinar: Webinar;
  editable: boolean;
  onChanged: () => void;
}

export default function MetadataForm({ webinar, editable, onChanged }: MetadataFormProps) {
  const [form, setForm] = useState({
    title: webinar.title,
    description: webinar.description,
    scheduled_at: isoToLocalInput(webinar.scheduled_at),
    timezone: webinar.timezone,
    duration_minutes: String(webinar.duration_minutes),
    max_capacity: webinar.max_capacity != null ? String(webinar.max_capacity) : "",
    price: webinar.price,
    meeting_provider: webinar.meeting_provider,
    meeting_url: webinar.meeting_url ?? "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    webinar.thumbnail,
  );
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pickFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWebinar(webinar.id, {
        title: form.title,
        description: form.description,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        timezone: form.timezone,
        duration_minutes: Number(form.duration_minutes),
        max_capacity: form.max_capacity ? Number(form.max_capacity) : null,
        price: form.price,
        meeting_provider: form.meeting_provider,
        meeting_url: form.meeting_url,
        ...(thumbnailFile ? { thumbnail: thumbnailFile } : {}),
      });
      notify.success("Webinar updated.");
      onChanged();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to update webinar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl p-5 space-y-4">
      <p className="text-[14px] font-semibold text-(--text-title)">Details</p>

      {!editable && (
        <p className="text-[12px] text-(--gray-400)">
          This webinar is published — editing is locked. Archive it to make changes.
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-(--text-title)">
          Thumbnail
        </label>
        <div
          onClick={() => editable && fileRef.current?.click()}
          onDrop={(e) => {
            if (!editable) return;
            e.preventDefault();
            pickFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => editable && e.preventDefault()}
          className={`w-full max-h-56 rounded-lg border-2 border-dashed border-(--gray-200) bg-(--gray-50) flex flex-col items-center justify-center gap-2 overflow-hidden transition-colors ${
            editable
              ? "cursor-pointer hover:border-(--primary-300) hover:bg-(--primary-50)"
              : "opacity-70"
          }`}
        >
          {thumbnailPreview ? (
            <Image
              src={mediaUrl(thumbnailPreview) as string}
              alt="Webinar thumbnail"
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
          disabled={!editable}
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        {thumbnailPreview && editable && (
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

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-(--text-title)">Title</label>
        <input
          type="text"
          value={form.title}
          disabled={!editable}
          onChange={(e) => set("title", e.target.value)}
          className="w-full h-10 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500)"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-(--text-title)">Description</label>
        <textarea
          rows={3}
          value={form.description}
          disabled={!editable}
          onChange={(e) => set("description", e.target.value)}
          className="w-full px-3 py-2.5 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none disabled:bg-(--gray-50) disabled:text-(--gray-500)"
        />
      </div>

      <DateTimeField
        label="Date & Time"
        value={form.scheduled_at}
        disabled={!editable}
        onChange={(next) => set("scheduled_at", next)}
      />

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-(--text-title)">Timezone</label>
        <input
          type="text"
          value={form.timezone}
          disabled={!editable}
          onChange={(e) => set("timezone", e.target.value)}
          className="w-full h-10 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500)"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-(--text-title)">Duration (min)</label>
          <input
            type="number"
            min={1}
            value={form.duration_minutes}
            disabled={!editable}
            onChange={(e) => set("duration_minutes", e.target.value)}
            className="w-full h-10 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500)"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-(--text-title)">Max Capacity</label>
          <input
            type="number"
            min={1}
            value={form.max_capacity}
            disabled={!editable}
            placeholder="Unlimited"
            onChange={(e) => set("max_capacity", e.target.value)}
            className="w-full h-10 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500)"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-(--text-title)">Price (BDT)</label>
        <input
          type="text"
          value={form.price}
          disabled={!editable}
          onChange={(e) => set("price", e.target.value)}
          className="w-full h-10 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500)"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-(--text-title)">Provider</label>
          <SelectDropdown
            value={form.meeting_provider}
            disabled={!editable}
            onChange={(value) => set("meeting_provider", value as typeof form.meeting_provider)}
            options={PROVIDER_OPTIONS}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-(--text-title)">Meeting URL</label>
          <input
            type="url"
            value={form.meeting_url}
            disabled={!editable}
            onChange={(e) => set("meeting_url", e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full h-12 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500)"
          />
        </div>
      </div>

      {editable && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 h-10 px-5 rounded-lg bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
