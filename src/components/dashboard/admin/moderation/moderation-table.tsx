"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Search, ChevronDown, Flag, Check, X, Eye } from "lucide-react";
import { REPORTS, CONTENT_TYPES, REASONS, STATUSES } from "./data";
import { ReportContentType, ReportReason, ReportStatus } from "./types";
import StatusBadge from "./status-badge";
import ReasonBadge from "./reason-badge";

const COLS = "grid-cols-[2.4fr_1fr_1fr_1fr_1fr_120px_100px]";

export default function ModerationTable() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | ReportContentType>("All");
  const [reasonFilter, setReasonFilter] = useState<"All" | ReportReason>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ReportStatus>("All");
  const [typeOpen, setTypeOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, ReportStatus>>({});
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.35, delay: i * 0.05, ease: "power2.out" },
      );
    });
  }, [search, typeFilter, reasonFilter, statusFilter]);

  const rows = useMemo(
    () => REPORTS.map((r) => ({ ...r, status: decisions[r.id] ?? r.status })),
    [decisions],
  );

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.content.toLowerCase().includes(q) ||
      r.reportedUser.toLowerCase().includes(q) ||
      r.reporter.toLowerCase().includes(q);
    const matchType = typeFilter === "All" || r.contentType === typeFilter;
    const matchReason = reasonFilter === "All" || r.reason === reasonFilter;
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchType && matchReason && matchStatus;
  });

  const decide = (id: string, next: ReportStatus) => {
    setDecisions((prev) => ({ ...prev, [id]: next }));
  };

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
        All Reports
        <span className="ml-2 text-[12px] font-normal text-(--gray-500)">({filtered.length})</span>
      </p>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:flex-1 lg:flex-none lg:w-75">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by content or user..."
            className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
          />
        </div>

        <div className="grid grid-cols-3 md:flex md:items-center gap-3 md:ml-auto">
          {/* Content type filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setTypeOpen((v) => !v); setReasonOpen(false); setStatusOpen(false); }}
              className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left truncate">
                {typeFilter === "All" ? "All Content" : typeFilter}
              </span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${typeOpen ? "rotate-180" : ""}`} />
            </button>
            {typeOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-40">
                {CONTENT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTypeFilter(t); setTypeOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                      t === typeFilter
                        ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                        : "text-(--gray-600) hover:bg-(--gray-50)"
                    }`}
                  >
                    {t === "All" ? "All Content" : t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setReasonOpen((v) => !v); setTypeOpen(false); setStatusOpen(false); }}
              className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left truncate">
                {reasonFilter === "All" ? "All Reasons" : reasonFilter}
              </span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${reasonOpen ? "rotate-180" : ""}`} />
            </button>
            {reasonOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-40">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setReasonFilter(r); setReasonOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                      r === reasonFilter
                        ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                        : "text-(--gray-600) hover:bg-(--gray-50)"
                    }`}
                  >
                    {r === "All" ? "All Reasons" : r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setStatusOpen((v) => !v); setTypeOpen(false); setReasonOpen(false); }}
              className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left">{statusFilter}</span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`} />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-32">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => { setStatusFilter(st); setStatusOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[12px] cursor-pointer transition-colors ${
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

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-210">
          {/* Header */}
          <div className={`grid ${COLS} gap-3 px-3 pb-2 border-b border-(--gray-100)`}>
            {["Reported Content", "Type", "Reported User", "Reporter", "Reason", "Status"].map((h) => (
              <p key={h} className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                {h}
              </p>
            ))}
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right">
              Action
            </p>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Flag className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
              <p className="text-[14px] text-(--gray-500)">No reports match your filters.</p>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              {filtered.map((r, i) => {
                const actionable = r.status === "Open";
                return (
                  <div
                    key={r.id}
                    ref={(el) => { rowsRef.current[i] = el; }}
                    className={`opacity-0 grid ${COLS} gap-3 items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors`}
                  >
                    <p className="text-[13px] text-(--text-title) truncate">{r.content}</p>
                    <p className="text-[12px] text-(--gray-600)">{r.contentType}</p>
                    <p className="text-[13px] font-semibold text-(--text-title) truncate">{r.reportedUser}</p>
                    <p className="text-[12px] text-(--gray-500) truncate">{r.reporter}</p>
                    <div>
                      <ReasonBadge reason={r.reason} />
                    </div>
                    <div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      {actionable ? (
                        <>
                          <button
                            onClick={() => decide(r.id, "Resolved")}
                            title="Resolve"
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => decide(r.id, "Dismissed")}
                            title="Dismiss"
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          title="View details"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
