"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  ShieldX,
  GraduationCap,
  Download,
} from "lucide-react";
import gsap from "gsap";
import { QRCodeSVG } from "qrcode.react";

import {
  certificateUrl,
  certificateDownloadUrl,
  type PublicCertificate,
  type CertificateSignatory,
} from "@/lib/certificates-api";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  // Locale is pinned: passing `undefined` resolves to the *server's* locale
  // during SSR and the *browser's* on hydration, which produced
  // "August 30, 2026" vs "30 August 2026" and a hydration mismatch. A
  // credential date must also read identically for every viewer.
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** One signature column. The image is the copy frozen at issue time, so it
 *  never changes when the signatory later updates their signature.
 *
 *  `role` is what distinguishes the two columns — without it they are
 *  identically shaped and a reader cannot tell which is the instructor. */
function SignatoryBlock({
  role,
  signatory,
  issuer,
}: {
  role: string;
  signatory: CertificateSignatory;
  issuer: string;
}) {
  if (!signatory.name) return null;

  return (
    <div className="flex-1 min-w-45">
      <div className="h-14 flex items-end mb-1">
        {signatory.signature_url ? (
          <Image
            src={certificateUrl(signatory.signature_url)}
            alt={`${signatory.name} signature`}
            width={160}
            height={56}
            unoptimized
            className="max-h-14 w-auto object-contain object-left"
          />
        ) : null}
      </div>
      <div className="border-t border-dotted border-(--gray-300) pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-(--primary-600) mb-0.5">
          {role}
        </p>
        <p className="text-[14px] font-semibold text-(--text-title)">
          {signatory.name}
        </p>
        {signatory.designation ? (
          <p className="text-[12px] text-(--gray-500)">
            {signatory.designation}
          </p>
        ) : null}
        <p className="text-[12px] text-(--gray-500)">{issuer}</p>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-(--gray-500)">{label}</p>
      <p className="text-[14px] font-medium text-(--text-title)">{value}</p>
    </div>
  );
}

export function VerifyCertificate({ cert }: { cert: PublicCertificate }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isValid = cert.status === "valid";
  const issuer = cert.issuer.name || "Career College";

  useEffect(() => {
    gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  return (
    <div ref={rootRef} className="opacity-0 max-w-4xl mx-auto px-4 py-10">
      {/* Verdict banner — the single thing a verifier came here for. */}
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 mb-6 ${
          isValid
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        {isValid ? (
          <BadgeCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldX className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p
            className={`text-[16px] md:text-[18px] font-semibold ${
              isValid ? "text-green-800" : "text-red-800"
            }`}
          >
            {isValid ? "Verified certificate" : "This certificate is revoked"}
          </p>
          <p
            className={`text-[12px] md:text-[14px] mt-0.5 ${
              isValid ? "text-green-700" : "text-red-700"
            }`}
          >
            {/* Short and factual: a verifier reads this in a couple of seconds
                and moves on. The long attestation sentence belongs on the PDF,
                which is the artifact; repeating it here just costs space. */}
            {isValid
              ? `Issued by ${issuer} on ${formatDate(cert.issue_date)}.`
              : `Issued by ${issuer}, then revoked${
                  cert.revoked_at ? ` on ${formatDate(cert.revoked_at)}` : ""
                }. This credential is no longer valid.`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-(--gray-200) overflow-hidden">
        <div className="p-5 sm:p-8 border-b border-(--gray-100)">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-5 h-5 text-(--primary-600)" />
            <span className="text-[12px] font-semibold text-(--primary-600) tracking-widest uppercase">
              {issuer}
            </span>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-(--gray-400) mb-1">
            Certificate of Completion
          </p>
          <p className="text-[12px] md:text-[14px] text-(--gray-500) mb-1">
            This is to certify that
          </p>
          <h1 className="text-[24px] md:text-[32px] font-semibold text-(--text-title) leading-tight mb-3">
            {cert.student.name}
          </h1>
          <p className="text-[12px] md:text-[14px] text-(--gray-500) mb-1">
            has successfully completed
          </p>
          <h2 className="text-[18px] md:text-[22px] font-medium text-(--text-title) leading-snug">
            {cert.course.name}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5 sm:px-8 py-5 border-b border-(--gray-100)">
          <MetaRow label="Certificate ID" value={cert.certificate_id} />
          <MetaRow
            label="Completion Date"
            value={formatDate(cert.completion_date)}
          />
          {cert.course.learning_hours ? (
            <MetaRow
              label="Learning Hours"
              value={`${cert.course.learning_hours} Hours`}
            />
          ) : null}
          {cert.course.duration ? (
            <MetaRow label="Course Duration" value={cert.course.duration} />
          ) : null}
        </div>

        <div className="flex flex-col md:flex-row gap-8 px-5 sm:px-8 py-6">
          <SignatoryBlock
            role="Course Instructor"
            signatory={cert.instructor}
            issuer={issuer}
          />
          <SignatoryBlock
            role="Authorized Signatory"
            signatory={cert.authorized_signatory}
            issuer={issuer}
          />
          <div className="flex flex-col items-center justify-end shrink-0">
            <div className="bg-white p-2 rounded-lg border border-(--gray-200)">
              <QRCodeSVG value={cert.verification_url} size={88} level="M" />
            </div>
            <p className="text-[10px] text-(--gray-400) mt-1.5 text-center">
              Scan to verify
            </p>
          </div>
        </div>

        {/* Issue and revocation dates live in the banner, not here — repeating
            them made the card read as two separate summaries of the same fact. */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-8 py-4 bg-(--gray-50) border-t border-(--gray-100)">
          <p className="text-[12px] text-(--gray-500)">
            Anyone can verify this credential at this address.
          </p>
          <a
            href={certificateDownloadUrl(cert.certificate_uid)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-(--primary-700) hover:bg-(--primary-900) text-white text-[12px] md:text-[14px] font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
