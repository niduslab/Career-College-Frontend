"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, Trash2, PenLine } from "lucide-react";

import { ApiError } from "@/lib/api";
import { MAX_SIGNATURE_BYTES } from "@/lib/profile-api";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { notify } from "@/lib/toast";

interface SignatureUploadProps {
  /** Current stored signature path, or null. */
  value: string | null;
  /** Upload handler. Receives null when the user clears the signature. */
  onUpload: (file: File | null) => Promise<void>;
  label?: string;
  hint?: string;
}

/**
 * Signature image picker used by the instructor, partner-institution and admin
 * settings screens.
 *
 * Enforces the same 2 MB cap as the backend validator so an oversized file is
 * rejected before the round trip. Changing the signature only affects
 * certificates issued from now on — already-issued ones carry their own frozen
 * copy, which the hint text says out loud so nobody expects a retroactive fix.
 */
export function SignatureUpload({
  value,
  onUpload,
  label = "Signature",
  hint = "Transparent PNG works best. Max 2MB.",
}: SignatureUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const src = mediaUrl(value);

  async function run(file: File | null, successMsg: string) {
    setBusy(true);
    try {
      await onUpload(file);
      notify.success(successMsg);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update signature.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset first so re-picking the same file still fires onChange.
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_SIGNATURE_BYTES) {
      notify.error("Signature must be 2MB or smaller.");
      return;
    }
    await run(file, "Signature updated.");
  }

  return (
    <div>
      <label className="block text-[14px] font-medium text-(--text-title) mb-1.5">
        {label}
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <div className="w-44 h-20 rounded-lg border border-dashed border-(--gray-300) bg-(--gray-50) flex items-center justify-center overflow-hidden shrink-0">
          {src ? (
            <Image
              src={src}
              alt={label}
              width={176}
              height={80}
              unoptimized
              className="max-h-20 w-auto object-contain"
            />
          ) : (
            <PenLine className="w-5 h-5 text-(--gray-400)" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-(--gray-200) text-[12px] md:text-[14px] font-medium text-(--text-title) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {src ? "Replace" : "Upload"}
            </button>

            {src ? (
              <button
                type="button"
                onClick={() => run(null, "Signature removed.")}
                disabled={busy}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-(--gray-200) text-[12px] md:text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            ) : null}
          </div>

          <p className="text-[12px] text-(--gray-500) mt-2 max-w-xs">{hint}</p>
          <p className="text-[12px] text-(--gray-400) mt-1 max-w-xs">
            Applies to certificates issued from now on. Existing certificates
            keep the signature they were issued with.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
