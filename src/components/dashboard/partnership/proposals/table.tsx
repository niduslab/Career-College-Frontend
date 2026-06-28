"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Search, ChevronDown, FileText, Tag } from "lucide-react";
import { PROPOSALS, CATEGORIES, STATUSES } from "./data";
import { ProposalStatus, ProposalCategory } from "./types";
import ProposalStatusBadge from "./status-badge";
import ProposalActionMenu from "./action-menu";

const COLS = "grid-cols-[2fr_1fr_1fr_100px_100px_40px]";

export default function ProposalsTable() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | ProposalCategory>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ProposalStatus>("All");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.35, delay: i * 0.05, ease: "power2.out" },
      );
    });
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenuId === null) return;
      const target = e.target as Node;
      const el = menuRefs.current.get(openMenuId);
      const insideWrapper = el?.contains(target) ?? false;
      const insidePortal = !!(target as HTMLElement).closest?.("[data-action-portal]");
      if (!insideWrapper && !insidePortal) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const filtered = PROPOSALS.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.organization.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
        All Proposals
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
            placeholder="Search by title or organization..."
            className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
          />
        </div>

        <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:ml-auto">
          {/* Category filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setCategoryOpen((v) => !v); setStatusOpen(false); }}
              className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <Tag className="w-4 h-4 text-(--gray-500) shrink-0" />
              <span className="flex-1 text-left truncate">
                {categoryFilter === "All" ? "All Categories" : categoryFilter}
              </span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${categoryOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-44">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setCategoryFilter(cat); setCategoryOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                      cat === categoryFilter
                        ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                        : "text-(--gray-600) hover:bg-(--gray-50)"
                    }`}
                  >
                    {cat === "All" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setStatusOpen((v) => !v); setCategoryOpen(false); }}
              className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
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
        <div className="min-w-160">
          {/* Header */}
          <div className={`grid ${COLS} px-3 pb-2 border-b border-(--gray-100)`}>
            {["Proposal", "Category", "Value", "Submitted", "Status"].map((h) => (
              <p key={h} className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                {h}
              </p>
            ))}
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-center">
              Action
            </p>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
              <p className="text-[14px] text-(--gray-500)">No proposals match your filters.</p>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  ref={(el) => { rowsRef.current[i] = el; }}
                  className={`opacity-0 grid ${COLS} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors`}
                >
                  {/* Proposal */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image src={p.avatar} alt={p.organization} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-(--text-title) truncate">{p.title}</p>
                      <p className="text-[12px] text-(--gray-500) truncate">{p.organization}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <p className="text-[12px] text-(--gray-600) truncate">{p.category}</p>

                  {/* Value */}
                  <p className="text-[13px] font-semibold text-(--text-title)">{p.value}</p>

                  {/* Submitted */}
                  <p className="text-[12px] text-(--gray-500)">{p.submittedDate}</p>

                  {/* Status */}
                  <ProposalStatusBadge status={p.status} />

                  {/* Action */}
                  <div className="flex justify-center">
                    <ProposalActionMenu
                      open={openMenuId === p.id}
                      onToggle={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                      setRef={(el) => menuRefs.current.set(p.id, el)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
