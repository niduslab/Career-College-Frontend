"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Award,
  Clock,
  ShieldCheck,
  TrendingUp,
  Search,
  Plus,
  ChevronDown,
  MoreVertical,
  Download,
  Eye,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Calendar,
  BookOpen,
  Hash,
  User,
} from "lucide-react";

// Types

type CertStatus = "Issued" | "Pending" | "Expired" | "Revoked";

interface Certificate {
  id: string;
  student: string;
  avatar: string;
  course: string;
  issueDate: string;
  expiryDate: string | null;
  status: CertStatus;
  certId: string;
}

//  Seed Data

const SEED: Certificate[] = [
  {
    id: "c1",
    student: "James Carter",
    avatar: "JC",
    course: "UI/UX Design Fundamentals",
    issueDate: "Mar 20, 2026",
    expiryDate: null,
    status: "Issued",
    certId: "CERT-2026-0041",
  },
  {
    id: "c2",
    student: "Sophia Nguyen",
    avatar: "SN",
    course: "React for Beginners",
    issueDate: "Mar 18, 2026",
    expiryDate: null,
    status: "Issued",
    certId: "CERT-2026-0040",
  },
  {
    id: "c3",
    student: "Daniel Osei",
    avatar: "DO",
    course: "Figma Mastery 2026",
    issueDate: "—",
    expiryDate: null,
    status: "Pending",
    certId: "CERT-2026-0039",
  },
  {
    id: "c4",
    student: "Lena Hoffmann",
    avatar: "LH",
    course: "Career Kickstart Bootcamp",
    issueDate: "Jan 10, 2026",
    expiryDate: "Jan 10, 2027",
    status: "Issued",
    certId: "CERT-2026-0031",
  },
  {
    id: "c5",
    student: "Marcus Webb",
    avatar: "MW",
    course: "Python for Data Science",
    issueDate: "Dec 5, 2025",
    expiryDate: "Dec 5, 2026",
    status: "Expired",
    certId: "CERT-2025-0098",
  },
  {
    id: "c6",
    student: "Aisha Patel",
    avatar: "AP",
    course: "UI/UX Design Fundamentals",
    issueDate: "—",
    expiryDate: null,
    status: "Pending",
    certId: "CERT-2026-0042",
  },
  {
    id: "c7",
    student: "Tom Richards",
    avatar: "TR",
    course: "React for Beginners",
    issueDate: "Feb 14, 2026",
    expiryDate: null,
    status: "Revoked",
    certId: "CERT-2026-0035",
  },
  {
    id: "c8",
    student: "Yuki Tanaka",
    avatar: "YT",
    course: "Figma Mastery 2026",
    issueDate: "Mar 22, 2026",
    expiryDate: null,
    status: "Issued",
    certId: "CERT-2026-0043",
  },
];

const STATS = [
  {
    label: "Total Issued",
    value: "124",
    change: "+12 this month",
    icon: Award,
  },
  {
    label: "Pending Approval",
    value: "8",
    change: "Awaiting review",
    icon: Clock,
  },
  {
    label: "Verification Rate",
    value: "98.4%",
    change: "+1.2% vs last month",
    icon: ShieldCheck,
  },
  {
    label: "Expiring Soon",
    value: "5",
    change: "Within 30 days",
    icon: TrendingUp,
  },
];

const COURSES = [
  "All Courses",
  ...Array.from(new Set(SEED.map((c) => c.course))),
];

const STATUSES: ("All" | CertStatus)[] = [
  "All",
  "Issued",
  "Pending",
  "Expired",
  "Revoked",
];

//  Sub-components

function StatusBadge({ status }: { status: CertStatus }) {
  const map: Record<CertStatus, { cls: string; icon: React.ReactNode }> = {
    Issued: {
      cls: "text-green-600 bg-green-50 border-green-200",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    Pending: {
      cls: "text-orange-500 bg-orange-50 border-orange-200",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    Expired: {
      cls: "text-gray-500 bg-gray-50 border-gray-200",
      icon: <XCircle className="w-3 h-3" />,
    },
    Revoked: {
      cls: "text-red-500 bg-red-50 border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
  };
  const { cls, icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-full border ${cls}`}
    >
      {icon}
      {status}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-(--primary-100) text-(--primary-700) text-[12px] font-semibold flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

function CertificateModal({
  cert,
  onClose,
}: {
  cert: Certificate;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--gray-100)">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-(--primary-50) flex items-center justify-center">
              <Award className="w-5 h-5 text-(--primary-600)" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-(--text-title)">
                Certificate Details
              </p>
              <p className="text-[11px] text-(--gray-400)">{cert.certId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-(--gray-100) text-(--gray-400) hover:text-(--gray-600) transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate preview */}
        <div className="mx-6 mt-5 rounded-xl border-2 border-dashed border-(--primary-200) bg-(--primary-50) px-6 py-8 text-center">
          <Award className="w-10 h-10 text-(--primary-600) mx-auto mb-3" />
          <p className="text-[11px] font-semibold tracking-widest text-(--primary-400) uppercase mb-1">
            Certificate of Completion
          </p>
          <p className="text-[18px] font-bold text-(--text-title) leading-snug">
            {cert.course}
          </p>
          <p className="text-[13px] text-(--gray-500) mt-1">
            Awarded to{" "}
            <span className="font-semibold text-(--text-title)">
              {cert.student}
            </span>
          </p>
        </div>

        {/* Details */}
        <div className="px-6 py-4 space-y-3">
          {[
            { icon: User, label: "Student", value: cert.student },
            { icon: BookOpen, label: "Course", value: cert.course },
            { icon: Hash, label: "Certificate ID", value: cert.certId },
            { icon: Calendar, label: "Issue Date", value: cert.issueDate },
            {
              icon: Calendar,
              label: "Expiry Date",
              value: cert.expiryDate ?? "No expiry",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-(--gray-50) flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-(--gray-400)" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <span className="text-[12px] text-(--gray-400)">{label}</span>
                <span className="text-[13px] font-medium text-(--text-title) truncate text-right">
                  {value}
                </span>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-(--gray-50) flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-(--gray-400)" />
            </div>
            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="text-[12px] text-(--gray-400)">Status</span>
              <StatusBadge status={cert.status} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-6 pb-5">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function RowMenu({
  open,
  onToggle,
  onView,
  setRef,
  status,
}: {
  open: boolean;
  onToggle: () => void;
  onView: () => void;
  setRef: (el: HTMLDivElement | null) => void;
  status: CertStatus;
}) {
  const items: {
    icon: React.ElementType;
    label: string;
    danger?: boolean;
    action?: () => void;
  }[] = [
    { icon: Eye, label: "View Certificate", action: onView },
    { icon: Download, label: "Download PDF" },
    { icon: Send, label: "Send to Student" },
    ...(status === "Pending" ? [{ icon: CheckCircle2, label: "Approve" }] : []),
    { icon: Trash2, label: "Revoke", danger: true },
  ];

  return (
    <div ref={setRef} className="relative">
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg hover:bg-(--primary-50) text-(--gray-500) hover:text-(--primary-600) cursor-pointer transition-colors"
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-30 py-1 min-w-48">
          {items.map(({ icon: Icon, label, danger, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                danger
                  ? "text-red-500 hover:bg-red-50"
                  : "text-(--gray-600) hover:bg-(--gray-50)"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Page

export default function CertificatesPage() {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState<"All" | CertStatus>("All");
  const [courseOpen, setCourseOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewCert, setViewCert] = useState<Certificate | null>(null);

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          delay: i * 0.08,
          ease: "back.out(1.4)",
        },
      );
    });
  }, []);

  useEffect(() => {
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          delay: i * 0.05,
          ease: "power2.out",
        },
      );
    });
  }, [search, courseFilter, statusFilter]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenuId === null) return;
      const el = menuRefs.current.get(openMenuId);
      if (el && !el.contains(e.target as Node)) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const filtered = SEED.filter((c) => {
    const matchSearch =
      c.student.toLowerCase().includes(search.toLowerCase()) ||
      c.certId.toLowerCase().includes(search.toLowerCase());
    const matchCourse =
      courseFilter === "All Courses" || c.course === courseFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchCourse && matchStatus;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* ── Left ── */}
      <div className="flex-1 space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className="opacity-0 bg-white border border-(--gray-200) rounded-2xl p-6 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-(--gray-500) font-medium mb-2">
                      {s.label}
                    </p>
                    <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                      {s.value}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-(--primary-600)" />
                  </div>
                </div>
                <div className="border border-dashed border-gray-200" />
                <p className="text-[12px] font-medium text-(--gray-500)">
                  {s.change}
                </p>
              </div>
            );
          })}
        </div>

        {/* Certificates table */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
                All Certificates
                <span className="ml-2 text-[12px] font-normal text-(--gray-500)">
                  ({filtered.length})
                </span>
              </p>
              <button
                type="button"
                className="flex items-center gap-1.5 h-10 px-4 rounded-md bg-(--primary-700) text-white text-[13px] font-medium cursor-pointer hover:bg-(--primary-600) transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Issue Certificate
              </button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative md:flex-1 lg:flex-none lg:w-75">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student or cert ID..."
                  className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:ml-auto">
                {/* Course filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setCourseOpen((v) => !v);
                      setStatusOpen(false);
                    }}
                    className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
                  >
                    <span className="flex-1 text-left truncate max-w-36">
                      {courseFilter}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${courseOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {courseOpen && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-56">
                      {COURSES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCourseFilter(c);
                            setCourseOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors truncate ${
                            c === courseFilter
                              ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                              : "text-(--gray-600) hover:bg-(--gray-50)"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusOpen((v) => !v);
                      setCourseOpen(false);
                    }}
                    className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
                  >
                    <span className="flex-1 text-left">{statusFilter}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {statusOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-36">
                      {STATUSES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setStatusFilter(st);
                            setStatusOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                            st === statusFilter
                              ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                              : "text-(--gray-600) hover:bg-(--gray-50)"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-5 px-5">
            <div className="min-w-180">
              {/* Header */}
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_40px] gap-3 px-3 pb-2 border-b border-(--gray-100)">
                {["Student", "Course", "Cert ID", "Issued", "Status", ""].map(
                  (h) => (
                    <p
                      key={h}
                      className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase"
                    >
                      {h}
                    </p>
                  ),
                )}
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <Award className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
                  <p className="text-[14px] text-(--gray-500)">
                    No certificates match your filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  {filtered.map((cert, i) => (
                    <div
                      key={cert.id}
                      ref={(el) => {
                        rowsRef.current[i] = el;
                      }}
                      className={`grid grid-cols-[2fr_2fr_1fr_1fr_1fr_40px] gap-3 items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors relative ${openMenuId === cert.id ? "z-20" : "z-0"}`}
                    >
                      {/* Student */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar initials={cert.avatar} />
                        <p className="text-[14px] font-semibold text-(--text-title) truncate">
                          {cert.student}
                        </p>
                      </div>

                      {/* Course */}
                      <p className="text-[12px] text-(--gray-600) truncate">
                        {cert.course}
                      </p>

                      {/* Cert ID */}
                      <p className="text-[11px] font-mono text-(--gray-500)">
                        {cert.certId}
                      </p>

                      {/* Issued */}
                      <p className="text-[12px] text-(--gray-500)">
                        {cert.issueDate}
                      </p>

                      {/* Status */}
                      <StatusBadge status={cert.status} />

                      {/* Actions */}
                      <div className="flex justify-end">
                        <RowMenu
                          open={openMenuId === cert.id}
                          onToggle={() =>
                            setOpenMenuId(
                              openMenuId === cert.id ? null : cert.id,
                            )
                          }
                          onView={() => {
                            setViewCert(cert);
                            setOpenMenuId(null);
                          }}
                          setRef={(el) => menuRefs.current.set(cert.id, el)}
                          status={cert.status}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate modal */}
      {viewCert && (
        <CertificateModal cert={viewCert} onClose={() => setViewCert(null)} />
      )}

      {/* ── Right sidebar ── */}
      <div className="w-full xl:w-72 shrink-0 space-y-4">
        {/* Status Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Status Breakdown
          </p>
          <div className="space-y-2.5">
            {(["Issued", "Pending", "Expired", "Revoked"] as CertStatus[]).map(
              (st) => {
                const count = SEED.filter((c) => c.status === st).length;
                const pct = Math.round((count / SEED.length) * 100);
                const color =
                  st === "Issued"
                    ? "bg-green-500"
                    : st === "Pending"
                      ? "bg-orange-400"
                      : st === "Expired"
                        ? "bg-gray-400"
                        : "bg-red-500";
                const text =
                  st === "Issued"
                    ? "text-green-600"
                    : st === "Pending"
                      ? "text-orange-500"
                      : st === "Expired"
                        ? "text-gray-500"
                        : "text-red-500";
                return (
                  <div key={st} className="flex items-center gap-3">
                    <span className="text-[12px] text-(--gray-600) w-16 shrink-0">
                      {st}
                    </span>
                    <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={`text-[12px] font-semibold ${text} w-8 text-right shrink-0`}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Recent Activity
          </p>
          <div className="space-y-3">
            {[
              {
                label: "Certificate issued to Yuki Tanaka",
                time: "2h ago",
                color: "bg-green-500",
              },
              {
                label: "Pending approval — Aisha Patel",
                time: "5h ago",
                color: "bg-orange-400",
              },
              {
                label: "Certificate issued to James Carter",
                time: "1d ago",
                color: "bg-green-500",
              },
              {
                label: "Revoked — Tom Richards",
                time: "2d ago",
                color: "bg-red-500",
              },
              {
                label: "Certificate issued to Sophia Nguyen",
                time: "3d ago",
                color: "bg-green-500",
              },
            ].map(({ label, time, color }) => (
              <div key={label} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-(--text-title) leading-snug">
                    {label}
                  </p>
                  <p className="text-[11px] text-(--gray-400) mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses by Certs */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Top Courses by Certs
          </p>
          <div className="space-y-3">
            {[
              { course: "UI/UX Design Fundamentals", count: 42 },
              { course: "React for Beginners", count: 35 },
              { course: "Career Kickstart Bootcamp", count: 28 },
              { course: "Figma Mastery 2026", count: 19 },
            ].map((item, i) => {
              const pct = Math.round((item.count / 42) * 100);
              return (
                <div key={item.course} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-(--primary-700) text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[12px] font-medium text-(--text-title) truncate">
                      {item.course}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-(--primary-600)"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-(--gray-500) shrink-0">
                        {item.count}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
