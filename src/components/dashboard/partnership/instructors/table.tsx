"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  Search,
  ChevronDown,
  GraduationCap,
  Star,
  Plus,
  Upload,
  Mail,
} from "lucide-react";
import { INSTRUCTORS, DEPARTMENTS, SPECIALIZATIONS, STATUSES } from "./data";
import { InstructorStatus, Department, Specialization } from "./types";
import InstructorStatusBadge from "./status-badge";
import InstructorActionMenu from "./action-menu";

const COLS = "grid-cols-[2fr_1fr_1fr_70px_80px_90px_40px]";

export default function InstructorsTable() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<"All" | Department>("All");
  const [specFilter, setSpecFilter] = useState<"All" | Specialization>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | InstructorStatus>(
    "All",
  );
  const [deptOpen, setDeptOpen] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);
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
  }, [search, deptFilter, specFilter, statusFilter]);

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
    setSpecOpen(false);
    setStatusOpen(false);
  };

  const filtered = INSTRUCTORS.filter((inst) => {
    const matchSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || inst.department === deptFilter;
    const matchSpec =
      specFilter === "All" || inst.specialization === specFilter;
    const matchStatus = statusFilter === "All" || inst.status === statusFilter;
    return matchSearch && matchDept && matchSpec && matchStatus;
  });

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
          Instructor List
          <span className="ml-2 text-[12px] font-normal text-(--gray-500)">
            ({filtered.length})
          </span>
        </p>
        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-(--gray-200) bg-white text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            Bulk Add
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-(--primary-600) text-(--primary-600) bg-white text-[13px] font-medium hover:bg-(--primary-50) cursor-pointer transition-colors"
          >
            <Mail className="w-4 h-4" />
            Invite
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Instructor
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:flex-1 lg:flex-none lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
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
                setSpecOpen(false);
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

          {/* Specialization */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSpecOpen((v) => !v);
                setDeptOpen(false);
                setStatusOpen(false);
              }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left truncate">
                {specFilter === "All" ? "Specialization" : specFilter}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${specOpen ? "rotate-180" : ""}`}
              />
            </button>
            {specOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-40">
                {SPECIALIZATIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSpecFilter(s);
                      closeAllFilters();
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${s === specFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {s === "All" ? "All Specializations" : s}
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
                setSpecOpen(false);
              }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left">{statusFilter}</span>
              <ChevronDown
                className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`}
              />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-32">
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
        <div className="min-w-180">
          {/* Header */}
          <div
            className={`grid ${COLS} px-3 pb-2 border-b border-(--gray-100)`}
          >
            {[
              "Instructor",
              "Department",
              "Specialization",
              "Courses",
              "Rating",
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
              <GraduationCap className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
              <p className="text-[14px] text-(--gray-500)">
                No instructors match your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              {filtered.map((inst, i) => (
                <div
                  key={inst.id}
                  ref={(el) => {
                    rowsRef.current[i] = el;
                  }}
                  className={`opacity-0 grid ${COLS} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors`}
                >
                  {/* Instructor */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={inst.avatar}
                        alt={inst.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-(--text-title) truncate">
                        {inst.name}
                      </p>
                      <p className="text-[12px] text-(--gray-500) truncate">
                        {inst.email}
                      </p>
                    </div>
                  </div>

                  {/* Department */}
                  <p className="text-[12px] text-(--gray-600) truncate">
                    {inst.department}
                  </p>

                  {/* Specialization */}
                  <p className="text-[12px] text-(--gray-600) truncate">
                    {inst.specialization}
                  </p>

                  {/* Courses */}
                  <p className="text-[13px] font-semibold text-(--text-title)">
                    {inst.courses}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {inst.rating > 0 ? (
                      <>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                        <span className="text-[13px] font-semibold text-(--text-title)">
                          {inst.rating}
                        </span>
                      </>
                    ) : (
                      <span className="text-[12px] text-(--gray-400)">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <InstructorStatusBadge status={inst.status} />

                  {/* Action */}
                  <div className="flex justify-center">
                    <InstructorActionMenu
                      open={openMenuId === inst.id}
                      onToggle={() =>
                        setOpenMenuId(openMenuId === inst.id ? null : inst.id)
                      }
                      setRef={(el) => menuRefs.current.set(inst.id, el)}
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
