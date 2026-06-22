"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Search, ChevronDown, CalendarDays } from "lucide-react";
import { COHORTS, DEPARTMENTS, MODES, STATUSES } from "./data";
import { CohortStatus, CohortDepartment, CohortMode } from "./types";
import CohortStatusBadge from "./status-badge";
import CohortActionMenu from "./action-menu";

const COLS = "grid-cols-[2fr_1fr_1fr_80px_100px_110px_40px]";

const MODE_STYLE: Record<CohortMode, string> = {
  Online: "text-blue-600 bg-blue-50",
  Hybrid: "text-purple-600 bg-purple-50",
  "In-Person": "text-orange-500 bg-orange-50",
};

export default function CohortsTable() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<"All" | CohortDepartment>("All");
  const [modeFilter, setModeFilter] = useState<"All" | CohortMode>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | CohortStatus>("All");
  const [deptOpen, setDeptOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
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
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          delay: i * 0.05,
          ease: "power2.out",
        },
      );
    });
  }, [search, deptFilter, modeFilter, statusFilter]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenuId === null) return;
      const target = e.target as Node;
      const el = menuRefs.current.get(openMenuId);
      const insideWrapper = el?.contains(target) ?? false;
      const insidePortal = !!(target as HTMLElement).closest?.(
        "[data-action-portal]",
      );
      if (!insideWrapper && !insidePortal) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const closeAllFilters = () => {
    setDeptOpen(false);
    setModeOpen(false);
    setStatusOpen(false);
  };

  const filtered = COHORTS.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.course.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || c.department === deptFilter;
    const matchMode = modeFilter === "All" || c.mode === modeFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchDept && matchMode && matchStatus;
  });

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
        All Cohorts
        <span className="ml-2 text-[12px] font-normal text-(--gray-500)">
          ({filtered.length})
        </span>
      </p>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:flex-1 lg:flex-none lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, course or instructor..."
            className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
          />
        </div>

        <div className="grid grid-cols-3 md:flex md:items-center gap-2 md:ml-auto">
          {/* Department */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDeptOpen((v) => !v);
                setModeOpen(false);
                setStatusOpen(false);
              }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left truncate">
                {deptFilter === "All" ? "Department" : deptFilter}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${deptOpen ? "rotate-180" : ""}`}
              />
            </button>
            {deptOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-44">
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDeptFilter(d);
                      closeAllFilters();
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${d === deptFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {d === "All" ? "All Departments" : d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setModeOpen((v) => !v);
                setDeptOpen(false);
                setStatusOpen(false);
              }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left truncate">
                {modeFilter === "All" ? "Mode" : modeFilter}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${modeOpen ? "rotate-180" : ""}`}
              />
            </button>
            {modeOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-36">
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setModeFilter(m);
                      closeAllFilters();
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${m === modeFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {m === "All" ? "All Modes" : m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStatusOpen((v) => !v);
                setDeptOpen(false);
                setModeOpen(false);
              }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left">
                {statusFilter === "All" ? "Status" : statusFilter}
              </span>
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
                      closeAllFilters();
                    }}
                    className={`w-full text-left px-4 py-2 text-[12px] cursor-pointer transition-colors ${st === statusFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {st === "All" ? "All Statuses" : st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-200">
          {/* Header */}
          <div
            className={`grid ${COLS} px-3 pb-2 border-b border-(--gray-100)`}
          >
            {[
              "Cohort",
              "Department",
              "Instructor",
              "Mode",
              "Enrolled",
              "Status",
            ].map((h) => (
              <p
                key={h}
                className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase"
              >
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
              <CalendarDays className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
              <p className="text-[14px] text-(--gray-500)">
                No cohorts match your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              {filtered.map((c, i) => {
                const fillPct =
                  c.capacity > 0
                    ? Math.round((c.enrolled / c.capacity) * 100)
                    : 0;
                return (
                  <div
                    key={c.id}
                    ref={(el) => {
                      rowsRef.current[i] = el;
                    }}
                    className={`opacity-0 grid ${COLS} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors`}
                  >
                    {/* Cohort name + course thumbnail + dates */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={c.courseThumbnail}
                          alt={c.course}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-(--text-title) truncate leading-snug">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-(--gray-400) truncate">
                          {c.startDate} – {c.endDate}
                        </p>
                      </div>
                    </div>

                    {/* Department */}
                    <p className="text-[12px] text-(--gray-600) truncate">
                      {c.department}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={c.instructorAvatar}
                          alt={c.instructor}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[12px] text-(--gray-600) truncate">
                        {c.instructor}
                      </p>
                    </div>

                    {/* Mode badge */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${MODE_STYLE[c.mode]}`}
                    >
                      {c.mode}
                    </span>

                    {/* Enrolled / capacity with mini progress bar */}
                    <div className="space-y-1">
                      <p className="text-[12px] font-semibold text-(--text-title)">
                        {c.enrolled}
                        <span className="text-(--gray-400) font-normal">
                          /{c.capacity}
                        </span>
                      </p>
                      <div className="h-1.5 bg-(--gray-100) rounded-full overflow-hidden w-16">
                        <div
                          className={`h-full rounded-full ${fillPct >= 100 ? "bg-emerald-500" : fillPct >= 75 ? "bg-(--primary-600)" : "bg-(--gray-300)"}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <CohortStatusBadge status={c.status} />

                    {/* Action */}
                    <div className="flex justify-center">
                      <CohortActionMenu
                        open={openMenuId === c.id}
                        onToggle={() =>
                          setOpenMenuId(openMenuId === c.id ? null : c.id)
                        }
                        setRef={(el) => menuRefs.current.set(c.id, el)}
                      />
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
