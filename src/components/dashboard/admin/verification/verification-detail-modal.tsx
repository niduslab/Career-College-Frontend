"use client";

import { useState, type ReactNode } from "react";
import { X, Loader2, FileText, ImageOff } from "lucide-react";
import Image from "next/image";
import StatusBadge from "./status-badge";
import {
  useIdentityVerificationDetail,
  useInstitutionVerificationDetail,
} from "@/hooks/use-admin-verification";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { mediaUrl } from "../../settings-shared/helpers";
import { RichHtml } from "../../settings-shared/ui";

interface VerificationDetailModalProps {
  kind: "identity" | "institution";
  id: number;
  onClose: () => void;
}

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

const EXT_BADGE_COLORS: Record<string, string> = {
  pdf: "from-red-500 to-red-600",
  png: "from-orange-400 to-orange-500",
  jpg: "from-orange-400 to-orange-500",
  jpeg: "from-orange-400 to-orange-500",
  webp: "from-orange-400 to-orange-500",
  gif: "from-orange-400 to-orange-500",
};

function DocumentTile({ label, url }: { label: string; url: string | null }) {
  const [failed, setFailed] = useState(false);
  const resolved = mediaUrl(url);

  if (!resolved) {
    return (
      <div>
        <p className="text-[12px] font-medium text-(--gray-500) mb-1.5">{label}</p>
        <div className="w-full aspect-square max-w-32 rounded-xl border-2 border-dashed border-(--gray-200) bg-(--gray-50) flex items-center justify-center">
          <p className="text-[11px] text-(--gray-400) text-center px-2">Not provided</p>
        </div>
      </div>
    );
  }
  const name = fileNameFromUrl(resolved);
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = isImageName(name);

  return (
    <div className="min-w-0">
      <p className="text-[12px] font-medium text-(--gray-500) mb-1.5">{label}</p>
      <a
        href={resolved}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {isImage ? (
          failed ? (
            <div className="w-full aspect-square max-w-32 rounded-xl border border-(--gray-200) bg-(--gray-50) flex flex-col items-center justify-center gap-1 text-(--gray-400)">
              <ImageOff className="w-5 h-5" />
              <span className="text-[11px]">Failed to load</span>
            </div>
          ) : (
            <div className="relative w-full aspect-square max-w-32 rounded-xl border border-(--gray-200) bg-(--gray-50) overflow-hidden shadow-sm group-hover:shadow-md group-hover:border-(--primary-300) transition-all duration-200">
              <Image
                src={resolved}
                alt={`${label} preview`}
                width={128}
                height={128}
                unoptimized
                onError={() => setFailed(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          )
        ) : (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-(--gray-200) bg-white min-w-0 shadow-sm group-hover:shadow-md group-hover:border-(--primary-300) transition-all duration-200">
            <div
              className={`w-9 h-9 rounded-md bg-linear-to-br ${EXT_BADGE_COLORS[ext] ?? "from-(--gray-400) to-(--gray-500)"} text-white flex items-center justify-center text-[13px] font-bold uppercase shrink-0 shadow-sm`}
            >
              {ext.slice(0, 1) || <FileText className="w-4 h-4" />}
            </div>
            <p className="text-[13px] font-medium text-(--text-title) truncate min-w-0">
              {name}
            </p>
          </div>
        )}
      </a>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-xl border border-(--gray-100) bg-(--gray-50)/60 px-3.5 py-3">
      <p className="text-[10px] font-semibold tracking-widest text-(--gray-400) uppercase">
        {label}
      </p>
      <p className="text-[13px] font-medium text-(--text-title) mt-1">
        {value?.trim() || "—"}
      </p>
    </div>
  );
}

function RichTextField({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50/60"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/60"
        : "border-(--gray-200) bg-(--gray-50)";
  return (
    <div className={`rounded-xl border px-4 py-3.5 ${toneClass}`}>
      <p className="text-[11px] font-semibold tracking-widest text-(--gray-500) uppercase mb-1.5">
        {label}
      </p>
      <RichHtml html={value} />
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4">
      <div className="animate-menu-in bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100) sticky top-0 bg-linear-to-b from-(--primary-50) to-white z-10">
          <h3 className="text-[17px] font-semibold text-(--text-title)">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-(--gray-400) hover:text-(--gray-600) transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function IdentityDetailBody({ id }: { id: number }) {
  const { data, isLoading, isError } = useIdentityVerificationDetail(id);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-[13px] text-(--gray-400)">
        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
        Loading details…
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="py-16 text-center text-[13px] text-red-500">
        Failed to load verification details.
      </div>
    );
  }

  return (
    <div className="px-6 py-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-dashed border-(--gray-200)">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-linear-to-br from-(--primary-500) to-(--primary-600) text-white flex items-center justify-center text-[15px] font-semibold shrink-0 shadow-sm">
            {data.instructor_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-(--text-title) truncate">{data.instructor_name}</p>
            <p className="text-[12px] text-(--gray-500) truncate">{data.instructor_email}</p>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoField label="Document Type" value={data.document_type?.replace(/_/g, " ")} />
        <InfoField label="Document Number" value={data.document_number} />
        <InfoField label="Issuing Country" value={data.issuing_country} />
        <InfoField label="Expiry Date" value={data.expiry_date} />
        <InfoField label="Submitted" value={data.submitted_at?.slice(0, 10)} />
        <InfoField label="Reviewed By" value={data.reviewed_by_email} />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-(--text-title) mb-3">Documents</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DocumentTile label="Document Front" url={data.document_front} />
          <DocumentTile label="Document Back" url={data.document_back} />
          <DocumentTile label="Selfie" url={data.selfie} />
          <DocumentTile label="Resume" url={data.resume} />
        </div>
      </div>

      {data.rejection_reason && (
        <RichTextField label="Rejection Reason" value={data.rejection_reason} tone="danger" />
      )}
      {data.action_required_reason && (
        <RichTextField label="Action Required" value={data.action_required_reason} tone="warning" />
      )}
      {data.admin_notes && <InfoField label="Admin Notes" value={data.admin_notes} />}
    </div>
  );
}

function InstitutionDetailBody({ id }: { id: number }) {
  const { data, isLoading, isError } = useInstitutionVerificationDetail(id);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-[13px] text-(--gray-400)">
        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
        Loading details…
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="py-16 text-center text-[13px] text-red-500">
        Failed to load verification details.
      </div>
    );
  }

  return (
    <div className="px-6 py-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-dashed border-(--gray-200)">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-linear-to-br from-(--primary-500) to-(--primary-600) text-white flex items-center justify-center text-[15px] font-semibold shrink-0 shadow-sm">
            {data.institution_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-(--text-title) truncate">
              {data.institution_name}
            </p>
            <p className="text-[12px] text-(--gray-500) truncate">{data.official_email}</p>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoField label="Registration No." value={data.registration_number} />
        <InfoField label="Issuing Authority" value={data.issuing_authority} />
        <InfoField label="Submitted" value={data.submitted_at?.slice(0, 10)} />
        <InfoField label="Reviewed By" value={data.reviewed_by_email} />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-(--text-title) mb-3">Documents</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DocumentTile label="Accreditation Document" url={data.accreditation_document} />
          <DocumentTile label="Authorization Letter" url={data.authorization_letter} />
        </div>
      </div>

      {data.rejection_reason && (
        <RichTextField label="Rejection Reason" value={data.rejection_reason} tone="danger" />
      )}
      {data.action_required_reason && (
        <RichTextField label="Action Required" value={data.action_required_reason} tone="warning" />
      )}
      {data.admin_notes && <InfoField label="Admin Notes" value={data.admin_notes} />}
    </div>
  );
}

export default function VerificationDetailModal({
  kind,
  id,
  onClose,
}: VerificationDetailModalProps) {
  useLockBodyScroll();

  return (
    <ModalShell
      title={kind === "identity" ? "Instructor Verification" : "Institution Verification"}
      onClose={onClose}
    >
      {kind === "identity" ? (
        <IdentityDetailBody id={id} />
      ) : (
        <InstitutionDetailBody id={id} />
      )}
    </ModalShell>
  );
}
