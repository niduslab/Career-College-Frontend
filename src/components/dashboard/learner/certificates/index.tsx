"use client";

import { useEffect, useRef } from "react";
import {
  GraduationCap,
  BadgeCheck,
  Download,
  Link2,
  Share2,
  QrCode,
} from "lucide-react";
import gsap from "gsap";

interface Certificate {
  id: string;
  title: string;
  awardedTo: string;
  issued: string;
  credentialId: string;
  gradient: string;
  accentText: string;
}

const CERTIFICATES: Certificate[] = [
  {
    id: "1",
    title: "Deep Learning Foundations",
    awardedTo: "Ayesha Rahman",
    issued: "May 2026",
    credentialId: "CC-DL-2026-0847",
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    accentText: "text-blue-100",
  },
  {
    id: "2",
    title: "SQL for Data Analytics",
    awardedTo: "Ayesha Rahman",
    issued: "Apr 2026",
    credentialId: "CC-SQL-2026-1120",
    gradient: "from-emerald-400 via-teal-500 to-green-600",
    accentText: "text-emerald-100",
  },
  {
    id: "3",
    title: "Statistics for ML",
    awardedTo: "Ayesha Rahman",
    issued: "Feb 2026",
    credentialId: "CC-STAT-2026-0331",
    gradient: "from-orange-400 via-red-400 to-rose-500",
    accentText: "text-orange-100",
  },
  {
    id: "4",
    title: "Python Programming",
    awardedTo: "Ayesha Rahman",
    issued: "Jan 2026",
    credentialId: "CC-PY-2026-0099",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    accentText: "text-violet-100",
  },
  {
    id: "5",
    title: "Intro to Data Science",
    awardedTo: "Ayesha Rahman",
    issued: "Nov 2025",
    credentialId: "CC-DS-2025-2245",
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    accentText: "text-cyan-100",
  },
  {
    id: "6",
    title: "Git & Version Control",
    awardedTo: "Ayesha Rahman",
    issued: "Oct 2025",
    credentialId: "CC-GIT-2025-1876",
    gradient: "from-pink-500 via-fuchsia-500 to-purple-600",
    accentText: "text-pink-100",
  },
];

function CertificateCard({ cert }: { cert: Certificate }) {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card face */}
      <div
        className={`relative bg-linear-to-br ${cert.gradient} p-5 h-44 overflow-hidden`}
      >
        {/* diagonal stripe pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 2px, transparent 2px, transparent 18px)",
          }}
        />

        {/* Top row */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-white" />
            <span className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-white tracking-widest uppercase">
              Career College
            </span>
          </div>
          <span className="flex items-center gap-1 text-[12px] font-semibold text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <BadgeCheck className="w-3 h-4" />
            Verified
          </span>
        </div>

        {/* Body */}
        <div className="relative">
          <p
            className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${cert.accentText}`}
          >
            Certificate of Completion
          </p>
          <h3 className="text-[16px] md:text-[20px] lg:text-[20px] font-semibold text-white leading-tight mb-4">
            {cert.title}
          </h3>
          <div className="flex items-end justify-between">
            <div>
              <p className={`text-[10px] font-medium ${cert.accentText}`}>
                Awarded to
              </p>
              <p className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-white">
                {cert.awardedTo}
              </p>
            </div>
            {/* QR placeholder */}
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6 text-(--gray-600)" />
            </div>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between px-4 sm:px-5 pt-3 pb-1">
        <div>
          <p className="text-[12px] text-(--gray-500)">Issued</p>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] font-medium text-(--text-title)">
            {cert.issued}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-(--gray-500)">Credential ID</p>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] font-medium text-(--text-title)">
            {cert.credentialId}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3">
        <button className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-(--primary-700) hover:bg-(--primary-900) text-white text-[12px] md:text-[14px] lg:text-[14px] font-medium transition-colors cursor-pointer">
          <Download className="w-4 h-4" />
          PDF
        </button>
        <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-(--gray-200) text-(--gray-500) hover:bg-(--gray-50) text-[12px] md:text-[14px] lg:text-[14px] font-medium transition-colors cursor-pointer">
          <Link2 className="w-4 h-4" />
          LinkedIn
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-(--gray-200) text-(--gray-500) hover:bg-(--gray-50) transition-colors cursor-pointer shrink-0">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
    gsap.fromTo(
      gridRef.current ? Array.from(gridRef.current.children) : [],
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.07,
        ease: "power3.out",
        delay: 0.15,
      },
    );
  }, []);

  return (
    <div>
      {/* Header */}
      <div ref={headerRef} className="opacity-0 mb-6 sm:mb-8">
        <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
          Certificates
        </h1>
        <p className="text-[14px] text-(--gray-500) mt-1">
          <span className="font-medium ml-1  ">{CERTIFICATES.length}</span>{" "}
          verified credentials · Share them with employers &amp; on LinkedIn.
        </p>
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
      >
        {CERTIFICATES.map((cert) => (
          <CertificateCard key={cert.id} cert={cert} />
        ))}
      </div>
    </div>
  );
}
