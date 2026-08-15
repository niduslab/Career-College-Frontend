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
  pdf: "bg-red-500",
  png: "bg-orange-500",
  jpg: "bg-orange-500",
  jpeg: "bg-orange-500",
  webp: "bg-orange-500",
  gif: "bg-orange-500",
};

function DocumentTile({ label, url }: { label: string; url: string | null }) {
  const [failed, setFailed] = useState(false);
  const resolved = mediaUrl(url);

  if (!resolved) {
    return (
      <div>
        <p className="text-[12px] font-medium text-(--gray-500) mb-1.5">{label}</p>
        <div className="w-full aspect-square max-w-32 rounded-lg border border-dashed border-(--gray-200) bg-(--gray-50) flex items-center justify-center">
          <p className="text-[12px] text-(--gray-400)">Not provided</p>
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
      <a href={resolved} target="_blank" rel="noopener noreferrer" className="block">
        {isImage ? (
          failed ? (
            <div className="w-full aspect-square max-w-32 rounded-lg border border-(--gray-200) bg-(--gray-50) flex flex-col items-center justify-center gap-1 text-(--gray-400)">
              <ImageOff className="w-5 h-5" />
              <span className="text-[11px]">Failed to load</span>
            </div>
          ) : (
            <div className="w-full aspect-square max-w-32 rounded-lg border border-(--gray-200) bg-(--gray-50) overflow-hidden">
              <Image
                src={resolved}
                alt={`${label} preview`}
                width={128}
                height={128}
                unoptimized
                onError={() => setFailed(true)}
                className="w-full h-full object-cover"
              />
            </div>
          )
        ) : (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-(--gray-200) bg-white min-w-0">
            <div
              className={`w-9 h-9 rounded-md ${EXT_BADGE_COLORS[ext] ?? "bg-(--gray-400)"} text-white flex items-center justify-center text-[13px] font-bold uppercase shrink-0`}
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
    <div>
      <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
        {label}
      </p>
      <p className="text-[13px] text-(--text-title) mt-0.5">{value?.trim() || "—"}</p>
    </div>
  );
}

function RichTextField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase mb-1">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100) sticky top-0 bg-white">
          <h3 className="text-[16px] font-semibold text-(--text-title)">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) transition-colors cursor-pointer"
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[14px] font-semibold text-(--text-title)">{data.instructor_name}</p>
          <p className="text-[12px] text-(--gray-500)">{data.instructor_email}</p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
        <RichTextField label="Rejection Reason" value={data.rejection_reason} />
      )}
      {data.action_required_reason && (
        <RichTextField label="Action Required" value={data.action_required_reason} />
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[14px] font-semibold text-(--text-title)">
            {data.institution_name}
          </p>
          <p className="text-[12px] text-(--gray-500)">{data.official_email}</p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
        <RichTextField label="Rejection Reason" value={data.rejection_reason} />
      )}
      {data.action_required_reason && (
        <RichTextField label="Action Required" value={data.action_required_reason} />
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
