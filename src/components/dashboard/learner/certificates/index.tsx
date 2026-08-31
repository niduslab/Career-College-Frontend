"use client";

import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  BadgeCheck,
  Download,
  Link2,
  Award,
  ShieldX,
} from "lucide-react";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";
import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/common/query-states";
import Link from "next/link";
import { useMyCertificates } from "@/hooks/use-certificates";
import {
  certificateUrl,
  certificateVerifyPath,
  type LearnerCertificate,
} from "@/lib/certificates-api";

const PAGE_SIZE = 6;

function formatIssued(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });
}

/** Fallback for pre-migration rows that have no credential ID yet. */
function shortCredentialId(uid: string): string {
  return uid.split("-")[0].toUpperCase();
}

export function CertificateCard({ cert }: { cert: LearnerCertificate }) {
  // The public verify page lives on THIS app, not the backend API route — it is
  // what the PDF prints and the QR encodes.
  const verifyHref = certificateVerifyPath(cert);
  const downloadHref = certificateUrl(cert.download_url);
  const isRevoked = cert.status === "revoked";

  return (
    <div className="relative bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Certificate frame — a double rule just inside the card edge, the
          way a printed certificate is bordered, kept flat/subtle rather
          than an ornate gold-foil treatment. */}
      <div className="pointer-events-none absolute inset-2.5 rounded-xl border border-(--primary-100)" />

      <div className="relative bg-linear-to-br from-(--primary-50) to-white p-5 pb-4">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-(--primary-600)" />
            <span className="text-[12px] font-semibold text-(--primary-600) tracking-widest uppercase">
              Career College
            </span>
          </div>
          {isRevoked ? (
            <span className="flex items-center gap-1 text-[12px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              <ShieldX className="w-3 h-4" />
              Revoked
            </span>
          ) : (
            <Link
              href={verifyHref}
              className="flex items-center gap-1 text-[12px] font-semibold text-(--primary-600) bg-white px-2.5 py-1 rounded-full border border-(--primary-100) hover:bg-(--primary-50) transition-colors"
            >
              <BadgeCheck className="w-3 h-4" />
              Verify
            </Link>
          )}
        </div>

        <div className="flex items-start gap-3">
          {/* Seal — the certificate's visual anchor, standing in for a wax
              seal/ribbon without going skeuomorphic. */}
          <div className="shrink-0 mt-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-(--primary-600) text-white shadow-sm ring-4 ring-(--primary-100)">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-(--primary-500) mb-1">
              Certificate of Completion
            </p>
            {/* The frozen snapshot, not the live course title — this is the
                record of what was awarded. */}
            <h3 className="text-[18px] md:text-[20px] font-bold text-(--text-title) leading-snug line-clamp-2">
              {cert.course_title}
            </h3>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-dashed border-(--primary-100)">
          <p className="text-[10px] font-medium uppercase tracking-wide text-(--gray-400)">
            Awarded to
          </p>
          <p className="text-[14px] font-semibold text-(--text-title)">
            {cert.learner_name}
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-between px-5 py-3 bg-(--gray-50)">
        <div>
          <p className="text-[11px] text-(--gray-500)">Issued</p>
          <p className="text-[13px] font-medium text-(--text-title)">
            {formatIssued(cert.issued_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-(--gray-500)">Credential ID</p>
          <p
            className="text-[13px] font-medium text-(--text-title) font-mono"
            title={cert.certificate_id ?? cert.certificate_uid}
          >
            {cert.certificate_id ?? shortCredentialId(cert.certificate_uid)}
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-2 px-5 py-3">
        <a
          href={downloadHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-(--primary-700) hover:bg-(--primary-900) text-white text-[13px] font-medium transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          PDF
        </a>
        <Link
          href={verifyHref}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-(--gray-200) text-(--gray-500) hover:bg-white text-[13px] font-medium transition-colors cursor-pointer"
        >
          <Link2 className="w-4 h-4" />
          Public link
        </Link>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, refetch } = useMyCertificates({
    page: currentPage,
    page_size: PAGE_SIZE,
  });

  const certificates = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    gsap.fromTo(
      Array.from(gridRef.current.children),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power3.out" },
    );
  }, [certificates.length, currentPage]);

  return (
    <div>
      <div ref={headerRef} className="opacity-0 mb-6 sm:mb-8">
        <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
          Certificates
        </h1>
        <p className="text-[14px] text-(--gray-500) mt-1">
          <span className="font-medium">{isLoading ? "—" : total}</span>{" "}
          verified credential{total === 1 ? "" : "s"} · Share the public link
          with employers.
        </p>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your certificates"
          onRetry={() => refetch()}
        />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="w-6 h-6" />}
          title="No certificates yet"
          description="Finish a course to earn your first verified credential."
        />
      ) : (
        <>
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          >
            {certificates.map((cert) => (
              <CertificateCard key={cert.certificate_uid} cert={cert} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
