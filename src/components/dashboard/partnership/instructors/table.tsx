"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Search,
  ChevronDown,
  GraduationCap,
  Loader2,
} from "lucide-react";
import type { AffiliationStatus, Department, Expert } from "./types";
import InstructorStatusBadge from "./status-badge";
import InstructorActionMenu from "./action-menu";
import { setExpertActive } from "@/lib/partner-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import dynamic from "next/dynamic";
const AddInstructorDrawer = dynamic(() => import("./add-drawer"), { ssr: false });

const COLS = "grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_70px_90px_40px]";

const STATUS_OPTIONS: ("All" | AffiliationStatus)[] = ["All", "active", "removed"];
const STATUS_LABEL: Record<"All" | AffiliationStatus, string> = {
  All: "All",
  active: "Active",
  removed: "Removed",
};

interface TableProps {
  experts: Expert[];
  departments: Department[];
  loading: boolean;
  onRefresh: () => void;
}

export default function InstructorsTable({
  experts,
  departments,
  loading,
  onRefresh,
}: TableProps) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<"All" | number>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | AffiliationStatus>(
    "All",
  );
  const [deptOpen, setDeptOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

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
  }, [search, deptFilter, statusFilter, experts]);

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
    setStatusOpen(false);
  };

  const filtered = experts.filter((inst) => {
    const matchSearch =
      inst.full_name.toLowerCase().includes(search.toLowerCase()) ||
      inst.email.toLowerCase().includes(search.toLowerCase());
    const matchDept =
      deptFilter === "All" || inst.department?.id === deptFilter;
    const matchStatus =
      statusFilter === "All" || inst.affiliation_status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleToggleActive = async (expert: Expert) => {
    setTogglingId(expert.id);
    setOpenMenuId(null);
    try {
      await setExpertActive(expert.id, expert.affiliation_status !== "active");
      notify.success(
        expert.affiliation_status === "active"
          ? "Expert deactivated."
          : "Expert reactivated.",
      );
      onRefresh();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update expert.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
          Expert List
          <span className="ml-2 text-[12px] font-normal text-(--gray-500)">
            ({filtered.length})
          </span>
        </p>
        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEditingExpert(null);
              setDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) cursor-pointer transition-colors"
          >
            Onboard Expert
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

        <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:ml-auto">
          {/* Department */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDeptOpen((v) => !v);
                setStatusOpen(false);
              }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left truncate">
                {deptFilter === "All"
                  ? "Department"
                  : departments.find((d) => d.id === deptFilter)?.name ?? "Department"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${deptOpen ? "rotate-180" : ""}`}
              />
            </button>
            {deptOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-44 max-h-52 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setDeptFilter("All");
                    closeAllFilters();
                  }}
                  className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${deptFilter === "All" ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                >
                  All Departments
                </button>
                {departments.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDeptFilter(d.id);
                      closeAllFilters();
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${d.id === deptFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {d.name}
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
              }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left">{STATUS_LABEL[statusFilter]}</span>
              <ChevronDown
                className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`}
              />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-32">
                {STATUS_OPTIONS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      closeAllFilters();
                    }}
                    className={`w-full text-left px-4 py-2 text-[12px] cursor-pointer transition-colors ${st === statusFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {STATUS_LABEL[st]}
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
          <div
            className={`grid ${COLS} px-3 pb-2 border-b border-(--gray-100)`}
          >
            {["Expert", "Department", "Specialization", "Courses", "Status"].map(
              (h) => (
                <p
                  key={h}
                  className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase"
                >
                  {h}
                </p>
              ),
            )}
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-center">
              Action
            </p>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-(--gray-400) mx-auto mb-2 animate-spin" />
              <p className="text-[14px] text-(--gray-500)">Loading experts…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <GraduationCap className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
              <p className="text-[14px] text-(--gray-500)">
                No experts match your filters.
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
                  {/* Expert */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-(--primary-50) flex items-center justify-center shrink-0 text-[13px] font-semibold text-(--primary-600)">
                      {inst.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-(--text-title) truncate">
                        {inst.full_name}
                      </p>
                      <p className="text-[12px] text-(--gray-500) truncate">
                        {inst.email}
                      </p>
                    </div>
                  </div>

                  {/* Department */}
                  <p className="text-[12px] text-(--gray-600) truncate">
                    {inst.department?.name ?? "—"}
                  </p>

                  {/* Specialization */}
                  <p className="text-[12px] text-(--gray-600) truncate">
                    {inst.specialization.length > 0
                      ? inst.specialization.join(", ")
                      : "—"}
                  </p>

                  {/* Courses */}
                  <p className="text-[13px] font-semibold text-(--text-title)">
                    {inst.course_count}
                  </p>

                  {/* Status */}
                  <InstructorStatusBadge status={inst.affiliation_status} />

                  {/* Action */}
                  <div className="flex justify-center">
                    <InstructorActionMenu
                      open={openMenuId === inst.id}
                      onToggle={() =>
                        setOpenMenuId(openMenuId === inst.id ? null : inst.id)
                      }
                      setRef={(el) => menuRefs.current.set(inst.id, el)}
                      status={inst.affiliation_status}
                      busy={togglingId === inst.id}
                      onEdit={() => {
                        setEditingExpert(inst);
                        setDrawerOpen(true);
                        setOpenMenuId(null);
                      }}
                      onToggleActive={() => handleToggleActive(inst)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <AddInstructorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        departments={departments}
        editingExpert={editingExpert}
        onSaved={onRefresh}
      />
    </div>
  );
}
