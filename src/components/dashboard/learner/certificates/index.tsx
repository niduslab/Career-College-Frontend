"use client";

import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  BadgeCheck,
  Download,
  Link2,
  Award,
} from "lucide-react";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";
import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/common/query-states";
import { useMyCertificates } from "@/hooks/use-certificates";
import { certificateUrl, type LearnerCertificate } from "@/lib/certificates-api";

const PAGE_SIZE = 6;

function formatIssued(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });
}

/** Short, human-readable form of the certificate UUID. The full value is
 *  still what the verify URL carries. */
function shortCredentialId(uid: string): string {
  return uid.split("-")[0].toUpperCase();
}

export function CertificateCard({ cert }: { cert: LearnerCertificate }) {
  const verifyHref = certificateUrl(cert.verify_url);
  const downloadHref = certificateUrl(cert.download_url);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative p-5 border-b border-(--gray-100)">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-(--primary-600)" />
            <span className="text-[12px] font-semibold text-(--primary-600) tracking-widest uppercase">
              Career College
            </span>
          </div>
          <a
            href={verifyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[12px] font-semibold text-(--primary-600) bg-(--primary-50) px-2.5 py-1 rounded-full hover:bg-(--primary-100) transition-colors"
          >
            <BadgeCheck className="w-3 h-4" />
            Verify
          </a>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-(--gray-400)">
          Certificate of Completion
        </p>
        {/* The frozen snapshot, not the live course title — this is the
            record of what was awarded. */}
        <h3 className="text-[16px] md:text-[18px] font-semibold text-(--text-title) leading-tight mb-4 line-clamp-2">
          {cert.course_title}
        </h3>
        <div>
          <p className="text-[10px] font-medium text-(--gray-400)">Awarded to</p>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-(--text-title)">
            {cert.learner_name}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 sm:px-5 pt-3 pb-1">
        <div>
          <p className="text-[12px] text-(--gray-500)">Issued</p>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] font-medium text-(--text-title)">
            {formatIssued(cert.issued_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-(--gray-500)">Credential ID</p>
          <p
            className="text-[12px] md:text-[14px] lg:text-[14px] font-medium text-(--text-title) font-mono"
            title={cert.certificate_uid}
          >
            {shortCredentialId(cert.certificate_uid)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 sm:px-5 py-3">
        <a
          href={downloadHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-(--primary-700) hover:bg-(--primary-900) text-white text-[12px] md:text-[14px] lg:text-[14px] font-medium transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          PDF
        </a>
        <a
          href={verifyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-(--gray-200) text-(--gray-500) hover:bg-(--gray-50) text-[12px] md:text-[14px] lg:text-[14px] font-medium transition-colors cursor-pointer"
        >
          <Link2 className="w-4 h-4" />
          Public link
        </a>
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
          <span className="font-medium">{isLoading ? "—" : total}</span> verified
          credential{total === 1 ? "" : "s"} · Share the public link with
          employers.
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
