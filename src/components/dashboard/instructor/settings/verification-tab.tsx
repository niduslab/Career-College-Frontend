"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  getMyVerifications,
  createDraftVerification,
  updateVerification,
  uploadVerificationDocs,
  submitVerification,
  DOCUMENT_TYPE_OPTIONS,
  type Verification,
} from "@/lib/verification-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { mediaUrl } from "../../settings-shared/helpers";
import { SelectDropdown } from "@/components/common/select-dropdown";
import { CountrySelect } from "@/components/common/country-select";
import DatePicker from "@/components/common/date-picker";
import {
  SectionCard,
  Field,
  Input,
  AsyncSaveButton,
} from "../../settings-shared/ui";
import { isoToDate, dateToIso } from "../../settings-shared/helpers";

const EDITABLE_STATUSES: Verification["status"][] = [
  "draft",
  "action_required",
];

const STATUS_META: Record<
  Verification["status"],
  { label: string; icon: React.ElementType; className: string }
> = {
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-(--gray-100) text-(--gray-600)",
  },
  submitted: {
    label: "Waiting for review",
    icon: Clock,
    className: "bg-amber-50 text-amber-700",
  },
  under_review: {
    label: "Under review",
    icon: Clock,
    className: "bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Verified",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-50 text-red-700",
  },
  action_required: {
    label: "Action required",
    icon: AlertTriangle,
    className: "bg-amber-50 text-amber-700",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    className: "bg-(--gray-100) text-(--gray-600)",
  },
};

function StatusBadge({ status }: { status: Verification["status"] }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium ${meta.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
}

/** Colored letter-badge per extension, similar to OS file-picker chips. */
const EXT_BADGE_COLORS: Record<string, string> = {
  pdf: "bg-red-500",
  png: "bg-orange-500",
  jpg: "bg-orange-500",
  jpeg: "bg-orange-500",
  webp: "bg-orange-500",
  gif: "bg-orange-500",
};

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").pop() || url);
  } catch {
    return url.split("/").pop() || url;
  }
}

function isImageName(name: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}

function FileChip({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const badgeColor = EXT_BADGE_COLORS[ext] ?? "bg-(--gray-400)";
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-(--gray-200) bg-white w-fit">
      <div
        className={`w-9 h-9 rounded-md ${badgeColor} text-white flex items-center justify-center text-[13px] font-bold uppercase shrink-0`}
      >
        {ext.slice(0, 1) || <FileText className="w-4 h-4" />}
      </div>
      <p className="text-[13px] font-medium text-(--text-title) truncate max-w-55">
        {name}
      </p>
    </div>
  );
}

function ImagePreview({ src, name }: { src: string; name: string }) {
  return (
    <div className="w-24 h-24 rounded-lg border border-(--gray-200) bg-(--gray-50) overflow-hidden">
      <Image
        src={src}
        alt={`${name} preview`}
        width={96}
        height={96}
        unoptimized
        className="w-full h-full object-cover"
      />
    </div>
  );
}

interface FileRowProps {
  label: string;
  required?: boolean;
  currentUrl: string | null;
  /** The raw File just chosen in this session, if any — used to show its real filename. */
  currentFile: File | null;
  uploading: boolean;
  readOnly?: boolean;
  onSelect: (file: File) => void;
}

function FileRow({
  label,
  required,
  currentUrl,
  currentFile,
  uploading,
  readOnly,
  onSelect,
}: FileRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayName = currentFile
    ? currentFile.name
    : currentUrl
      ? fileNameFromUrl(currentUrl)
      : null;

  // Prefer a local object URL for a freshly-picked file (instant preview,
  const localPreviewUrl = useMemo(() => {
    if (!currentFile) return null;
    return URL.createObjectURL(currentFile);
  }, [currentFile]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const previewUrl = localPreviewUrl ?? currentUrl;
  const showImagePreview =
    previewUrl && displayName && isImageName(displayName);

  return (
    <div className="py-3 border-b border-(--gray-100) last:border-0 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-(--text-title)">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </p>
        {!readOnly && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-60 shrink-0"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {currentUrl ? "Replace" : "Upload"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onSelect(file);
              }}
            />
          </>
        )}
      </div>

      {displayName ? (
        <a
          href={currentUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
        >
          {showImagePreview ? (
            <ImagePreview src={previewUrl} name={displayName} />
          ) : (
            <FileChip name={displayName} />
          )}
        </a>
      ) : (
        <p className="text-[12px] text-(--gray-400)">No file uploaded</p>
      )}
    </div>
  );
}

export function VerificationTab() {
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    Partial<
      Record<"document_front" | "document_back" | "selfie" | "resume", File>
    >
  >({});

  const [form, setForm] = useState({
    document_type: "",
    document_number: "",
    issuing_country: "",
    expiry_date: "",
  });
  const [errors, setErrors] = useState<
    Partial<
      Record<"document_type" | "document_number" | "issuing_country", string>
    >
  >({});

  const load = () => {
    setLoading(true);
    getMyVerifications()
      .then((list) => {
        const latest = list[0] ?? null;
        setVerification(latest);
        if (latest) {
          setForm({
            document_type: latest.document_type,
            document_number: latest.document_number,
            issuing_country: latest.issuing_country,
            expiry_date: latest.expiry_date ?? "",
          });
        }
      })
      .catch((err) => {
        notify.error(
          err instanceof ApiError
            ? err.message
            : "Failed to load your verification status.",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      const v = await createDraftVerification({});
      setVerification(v);
      setForm({
        document_type: v.document_type,
        document_number: v.document_number,
        issuing_country: v.issuing_country,
        expiry_date: v.expiry_date ?? "",
      });
      notify.success("Verification draft created.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to start verification.",
      );
    } finally {
      setStarting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!verification) return;
    setSaving(true);
    try {
      const v = await updateVerification(verification.id, {
        document_type: form.document_type,
        document_number: form.document_number,
        issuing_country: form.issuing_country,
        expiry_date: form.expiry_date || null,
      });
      setVerification(v);
      notify.success("Draft saved.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save draft.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    field: "document_front" | "document_back" | "selfie" | "resume",
    file: File,
  ) => {
    if (!verification) return;
    setUploadingField(field);
    try {
      const v = await uploadVerificationDocs(verification.id, {
        [field]: file,
      });
      setVerification(v);
      setSelectedFiles((prev) => ({ ...prev, [field]: file }));
      notify.success("File uploaded.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to upload file.",
      );
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async () => {
    if (!verification) return;

    const nextErrors: typeof errors = {};
    if (!form.document_type)
      nextErrors.document_type = "Document type is required.";
    if (!form.document_number.trim())
      nextErrors.document_number = "Document number is required.";
    if (!form.issuing_country.trim())
      nextErrors.issuing_country = "Issuing country is required.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      notify.error("Please fill in all required fields before submitting.");
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const v = await submitVerification(verification.id);
      setVerification(v);
      notify.success("Verification submitted for review.");
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.profile) {
        notify.error(
          "Please complete your profile (headline, bio, specialization, experience, title) before submitting.",
        );
      } else if (
        err instanceof ApiError &&
        Object.keys(err.fieldErrors).length > 0
      ) {
        setErrors(err.fieldErrors as typeof errors);
        notify.error(err.detail);
      } else {
        notify.error(
          err instanceof ApiError
            ? err.message
            : "Failed to submit verification.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading your verification status…
      </div>
    );
  }

  // No verification started yet.
  if (!verification) {
    return (
      <SectionCard title="Instructor Verification">
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <ShieldCheck className="w-10 h-10 text-(--primary-600)" />
          <p className="text-[15px] font-medium text-(--text-title)">
            Verify your identity to become a verified instructor.
          </p>
          <p className="text-[13px] text-(--gray-500) max-w-md">
            You&apos;ll need a government-issued ID and a selfie. Verified
            instructors get a badge on their public profile and courses.
          </p>
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="mt-2 flex items-center gap-1.5 h-10 px-5 rounded-md bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
          >
            {starting && <Loader2 className="w-4 h-4 animate-spin" />}
            {starting ? "Starting…" : "Start Verification"}
          </button>
        </div>
      </SectionCard>
    );
  }

  const editable = EDITABLE_STATUSES.includes(verification.status);
  const readOnlyBanner =
    verification.status === "submitted" ||
    verification.status === "under_review";

  return (
    <div className="space-y-4">
      <SectionCard title="Verification Status">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <StatusBadge status={verification.status} />
          {verification.submitted_at && (
            <p className="text-[13px] text-(--gray-500)">
              Submitted{" "}
              {new Date(verification.submitted_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {verification.status === "action_required" &&
          verification.action_required_reason && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-amber-800">
                  The admin has requested changes:
                </p>
                <p className="text-[13px] text-amber-700 mt-0.5">
                  {verification.action_required_reason}
                </p>
              </div>
            </div>
          )}

        {verification.status === "rejected" &&
          verification.rejection_reason && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200">
              <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-red-800">
                  Your verification was rejected:
                </p>
                <p className="text-[13px] text-red-700 mt-0.5">
                  {verification.rejection_reason}
                </p>
              </div>
            </div>
          )}

        {readOnlyBanner && (
          <p className="text-[13px] text-(--gray-500)">
            Your submission is being reviewed. We&apos;ll notify you once a
            decision has been made.
          </p>
        )}

        {verification.status === "approved" && (
          <p className="text-[13px] text-(--gray-500)">
            Your identity has been verified. No further action is needed.
          </p>
        )}

        {verification.status === "rejected" && (
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="flex items-center gap-1.5 h-10 px-5 rounded-md bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
          >
            {starting && <Loader2 className="w-4 h-4 animate-spin" />}
            {starting ? "Starting…" : "Start New Verification"}
          </button>
        )}
      </SectionCard>

      {(editable || readOnlyBanner || verification.status === "approved") && (
        <SectionCard
          title="Document Information"
          description={
            editable
              ? "Fill in your ID details, then upload the required documents below."
              : undefined
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Document type"
              required={editable}
              error={errors.document_type}
            >
              {editable ? (
                <SelectDropdown
                  value={form.document_type}
                  onChange={(v) => {
                    setForm((f) => ({
                      ...f,
                      document_type: v,
                      // Hidden for national_id — clear so a leftover value
                      // from a previous document type never gets submitted.
                      expiry_date: v === "national_id" ? "" : f.expiry_date,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      document_type: undefined,
                    }));
                  }}
                  options={DOCUMENT_TYPE_OPTIONS}
                  placeholder="Select document type"
                />
              ) : (
                <Input
                  value={
                    DOCUMENT_TYPE_OPTIONS.find(
                      (o) => o.value === verification.document_type,
                    )?.label ?? verification.document_type
                  }
                  disabled
                />
              )}
            </Field>
            <Field
              label="Document number"
              required={editable}
              error={errors.document_number}
            >
              <Input
                value={form.document_number}
                onChange={(e) => {
                  setForm((f) => ({ ...f, document_number: e.target.value }));
                  setErrors((prev) => ({
                    ...prev,
                    document_number: undefined,
                  }));
                }}
                disabled={!editable}
                placeholder="e.g. AB1234567"
              />
            </Field>
            <Field
              label="Issuing country"
              required={editable}
              error={errors.issuing_country}
            >
              <CountrySelect
                value={form.issuing_country}
                onChange={(country) => {
                  setForm((f) => ({ ...f, issuing_country: country }));
                  setErrors((prev) => ({
                    ...prev,
                    issuing_country: undefined,
                  }));
                }}
                disabled={!editable}
                placeholder="Search issuing country..."
              />
            </Field>
            {/* National ID cards don't carry an expiry date in Bangladesh —
                only show the field for document types that actually expire. */}
            {form.document_type !== "national_id" && (
              <Field label="Expiry date (optional)">
                <DatePicker
                  value={isoToDate(form.expiry_date)}
                  onChange={(d) =>
                    setForm((f) => ({ ...f, expiry_date: dateToIso(d) }))
                  }
                  placeholder="Select expiry date"
                  disabled={!editable}
                  disablePast={false}
                  captionDropdown
                  fromYear={new Date().getFullYear()}
                  toYear={new Date().getFullYear() + 30}
                />
              </Field>
            )}
          </div>

          {editable && (
            <div className="flex justify-start pt-2">
              <AsyncSaveButton
                onClick={handleSaveDraft}
                saving={saving}
                saved={saved}
              />
            </div>
          )}
        </SectionCard>
      )}

      {(editable || readOnlyBanner || verification.status === "approved") && (
        <SectionCard title="Documents">
          <FileRow
            label="Document front"
            required
            currentUrl={mediaUrl(verification.document_front)}
            currentFile={selectedFiles.document_front ?? null}
            uploading={uploadingField === "document_front"}
            readOnly={!editable}
            onSelect={(f) => handleFileUpload("document_front", f)}
          />
          <FileRow
            label="Document back"
            currentUrl={mediaUrl(verification.document_back)}
            currentFile={selectedFiles.document_back ?? null}
            uploading={uploadingField === "document_back"}
            readOnly={!editable}
            onSelect={(f) => handleFileUpload("document_back", f)}
          />
          <FileRow
            label="Selfie"
            required
            currentUrl={mediaUrl(verification.selfie)}
            currentFile={selectedFiles.selfie ?? null}
            uploading={uploadingField === "selfie"}
            readOnly={!editable}
            onSelect={(f) => handleFileUpload("selfie", f)}
          />
          <FileRow
            label="Resume (optional)"
            currentUrl={mediaUrl(verification.resume)}
            currentFile={selectedFiles.resume ?? null}
            uploading={uploadingField === "resume"}
            readOnly={!editable}
            onSelect={(f) => handleFileUpload("resume", f)}
          />

          {editable && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 h-10 px-5 rounded-md bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting…" : "Submit for Review"}
              </button>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
