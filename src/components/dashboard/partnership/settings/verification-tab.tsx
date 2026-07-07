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
  getMyInstitutionVerifications,
  createDraftInstitutionVerification,
  updateInstitutionVerification,
  uploadInstitutionVerificationDocs,
  submitInstitutionVerification,
  type InstitutionVerification,
} from "@/lib/institution-verification-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { mediaUrl } from "../../settings-shared/helpers";
import {
  SectionCard,
  Field,
  Input,
  AsyncSaveButton,
} from "../../settings-shared/ui";

const EDITABLE_STATUSES: InstitutionVerification["status"][] = [
  "draft",
  "action_required",
];

const STATUS_META: Record<
  InstitutionVerification["status"],
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
};

function StatusBadge({
  status,
}: {
  status: InstitutionVerification["status"];
}) {
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
  const [verification, setVerification] =
    useState<InstitutionVerification | null>(null);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    Partial<Record<"accreditation_document" | "authorization_letter", File>>
  >({});

  const [form, setForm] = useState({
    registration_number: "",
    issuing_authority: "",
    official_email: "",
  });

  const load = () => {
    setLoading(true);
    getMyInstitutionVerifications()
      .then((list) => {
        const latest = list[0] ?? null;
        setVerification(latest);
        if (latest) {
          setForm({
            registration_number: latest.registration_number,
            issuing_authority: latest.issuing_authority,
            official_email: latest.official_email,
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
      const v = await createDraftInstitutionVerification({});
      setVerification(v);
      setForm({
        registration_number: v.registration_number,
        issuing_authority: v.issuing_authority,
        official_email: v.official_email,
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
      const v = await updateInstitutionVerification(verification.id, {
        registration_number: form.registration_number,
        issuing_authority: form.issuing_authority,
        official_email: form.official_email,
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
    field: "accreditation_document" | "authorization_letter",
    file: File,
  ) => {
    if (!verification) return;
    setUploadingField(field);
    try {
      const v = await uploadInstitutionVerificationDocs(verification.id, {
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
    setSubmitting(true);
    try {
      const v = await submitInstitutionVerification(verification.id);
      setVerification(v);
      notify.success("Verification submitted for review.");
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.message
          : "Failed to submit verification.",
      );
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
      <SectionCard title="Institution Verification">
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <ShieldCheck className="w-10 h-10 text-(--primary-600)" />
          <p className="text-[15px] font-medium text-(--text-title)">
            Verify your institution to unlock course creation and expert
            management.
          </p>
          <p className="text-[13px] text-(--gray-500) max-w-md">
            You&apos;ll need your registration number, issuing authority, and an
            accreditation document. Verified institutions get a badge on their
            public profile.
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
            Your institution has been verified. No further action is needed.
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
          title="Institution Details"
          description={
            editable
              ? "Fill in your registration details, then upload the required documents below."
              : undefined
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Registration number">
              <Input
                value={form.registration_number}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    registration_number: e.target.value,
                  }))
                }
                disabled={!editable}
                placeholder="e.g. REG-2026-001"
              />
            </Field>
            <Field label="Issuing authority">
              <Input
                value={form.issuing_authority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, issuing_authority: e.target.value }))
                }
                disabled={!editable}
                placeholder="e.g. Ministry of Education"
              />
            </Field>
            <Field label="Official email">
              <Input
                type="email"
                value={form.official_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, official_email: e.target.value }))
                }
                disabled={!editable}
                placeholder="e.g. registrar@institution.edu"
              />
            </Field>
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
            label="Accreditation document"
            required
            currentUrl={mediaUrl(verification.accreditation_document)}
            currentFile={selectedFiles.accreditation_document ?? null}
            uploading={uploadingField === "accreditation_document"}
            readOnly={!editable}
            onSelect={(f) => handleFileUpload("accreditation_document", f)}
          />
          <FileRow
            label="Authorization letter (optional)"
            currentUrl={mediaUrl(verification.authorization_letter)}
            currentFile={selectedFiles.authorization_letter ?? null}
            uploading={uploadingField === "authorization_letter"}
            readOnly={!editable}
            onSelect={(f) => handleFileUpload("authorization_letter", f)}
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
