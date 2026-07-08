"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import CoursesFilterBar from "./filter-bar";
import RowActionsMenu from "./row-actions-menu";
import { Pagination } from "@/components/common/pagination";
import { COURSES, CourseCategory, CourseStatus } from "./data";

const PAGE_SIZE = 6;

const STATUS_BADGE: Record<CourseStatus, string> = {
  Published: "bg-emerald-50 text-emerald-600",
  Draft: "bg-(--gray-100) text-(--gray-500)",
  Pending: "bg-blue-50 text-blue-600",
  Flagged: "bg-red-50 text-red-500",
};

export default function CoursesTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CourseCategory | "All">("All");
  const [status, setStatus] = useState<CourseStatus | "All">("All");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COURSES.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q);
      const matchesCategory = category === "All" || c.category === category;
      const matchesStatus = status === "All" || c.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updateAndResetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <CoursesFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        category={category}
        onCategoryChange={(v) => {
          updateAndResetPage(setCategory)(v);
          setCategoryOpen(false);
        }}
        status={status}
        onStatusChange={(v) => {
          updateAndResetPage(setStatus)(v);
          setStatusOpen(false);
        }}
        categoryOpen={categoryOpen}
        onCategoryToggle={() => {
          setCategoryOpen((v) => !v);
          setStatusOpen(false);
        }}
        statusOpen={statusOpen}
        onStatusToggle={() => {
          setStatusOpen((v) => !v);
          setCategoryOpen(false);
        }}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-190 border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Course</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Instructor</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Category</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Status</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">Enrolled</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">Rating</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">Revenue</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {pageRows.map((c) => (
                <tr key={c.id} className="hover:bg-(--gray-50) transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                        {c.initials}
                      </div>
                      <p className="text-[13px] font-semibold text-(--text-title) truncate">{c.title}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-[13px] text-(--gray-600) truncate">{c.instructor}</td>
                  <td className="py-3 pr-3 text-[12px] text-(--gray-500) truncate">{c.category}</td>
                  <td className="py-3 pr-3">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-[13px] text-(--gray-600) text-right">
                    {c.enrolled > 0 ? c.enrolled.toLocaleString() : "—"}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {c.rating > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-(--text-title)">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {c.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-[13px] text-(--gray-400)">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-[13px] text-(--text-title) text-right font-medium">{c.revenue}</td>
                  <td className="py-3 text-right">
                    <RowActionsMenu
                      course={c}
                      open={openMenuId === c.id}
                      onToggle={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                      setRef={(el) => menuRefs.current.set(c.id, el)}
                      onView={(course) => console.log("view", course.id)}
                      onEdit={(course) => console.log("edit", course.id)}
                      onToggleUnpublish={(course) => console.log("toggle-publish", course.id)}
                      onDelete={(course) => console.log("delete", course.id)}
                    />
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[13px] text-(--gray-400)">
                    No courses match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-(--gray-100)">
          <p className="text-[12px] text-(--gray-400)">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} courses
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              setOpenMenuId(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
