"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Search, ChevronDown, BookOpen, Star } from "lucide-react";
import { COURSES, CATEGORIES, LEVELS, STATUSES } from "./data";
import { CourseStatus, CourseCategory, CourseLevel } from "./types";
import CourseStatusBadge from "./status-badge";
import CourseActionMenu from "./action-menu";

const COLS = "grid-cols-[2fr_1fr_1fr_90px_80px_110px_40px]";

const LEVEL_COLOR: Record<CourseLevel, string> = {
  Beginner: "text-green-600 bg-green-50",
  Intermediate: "text-blue-600 bg-blue-50",
  Advanced: "text-orange-500 bg-orange-50",
};

export default function CoursesTable() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | CourseCategory>("All");
  const [levelFilter, setLevelFilter] = useState<"All" | CourseLevel>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | CourseStatus>("All");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
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
  }, [search, categoryFilter, levelFilter, statusFilter]);

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

  const closeAllFilters = () => {
    setCategoryOpen(false);
    setLevelOpen(false);
    setStatusOpen(false);
  };

  const filtered = COURSES.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || c.category === categoryFilter;
    const matchLevel = levelFilter === "All" || c.level === levelFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchCat && matchLevel && matchStatus;
  });

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
        All Courses
        <span className="ml-2 text-[12px] font-normal text-(--gray-500)">({filtered.length})</span>
      </p>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:flex-1 lg:flex-none lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or instructor..."
            className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
          />
        </div>

        <div className="grid grid-cols-3 md:flex md:items-center gap-2 md:ml-auto">
          {/* Category */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setCategoryOpen((v) => !v); setLevelOpen(false); setStatusOpen(false); }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left truncate">{categoryFilter === "All" ? "Category" : categoryFilter}</span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${categoryOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-44">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button"
                    onClick={() => { setCategoryFilter(cat); closeAllFilters(); }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${cat === categoryFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {cat === "All" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Level */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setLevelOpen((v) => !v); setCategoryOpen(false); setStatusOpen(false); }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left truncate">{levelFilter === "All" ? "Level" : levelFilter}</span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${levelOpen ? "rotate-180" : ""}`} />
            </button>
            {levelOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-40">
                {LEVELS.map((lv) => (
                  <button key={lv} type="button"
                    onClick={() => { setLevelFilter(lv); closeAllFilters(); }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${lv === levelFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {lv === "All" ? "All Levels" : lv}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setStatusOpen((v) => !v); setCategoryOpen(false); setLevelOpen(false); }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left">{statusFilter === "All" ? "Status" : statusFilter}</span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`} />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-36">
                {STATUSES.map((st) => (
                  <button key={st} type="button"
                    onClick={() => { setStatusFilter(st); closeAllFilters(); }}
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
          <div className={`grid ${COLS} px-3 pb-2 border-b border-(--gray-100)`}>
            {["Course", "Category", "Instructor", "Enrolled", "Rating", "Status"].map((h) => (
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
              <BookOpen className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
              <p className="text-[14px] text-(--gray-500)">No courses match your filters.</p>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              {filtered.map((c, i) => (
                <div
                  key={c.id}
                  ref={(el) => { rowsRef.current[i] = el; }}
                  className={`opacity-0 grid ${COLS} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors`}
                >
                  {/* Course title + thumbnail + level */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-(--text-title) truncate leading-snug">{c.title}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${LEVEL_COLOR[c.level]}`}>
                        {c.level}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <p className="text-[12px] text-(--gray-600) truncate">{c.category}</p>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                      <Image src={c.instructorAvatar} alt={c.instructor} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[12px] text-(--gray-600) truncate">{c.instructor}</p>
                  </div>

                  {/* Enrolled */}
                  <p className="text-[13px] font-semibold text-(--text-title)">
                    {c.enrolled > 0 ? c.enrolled.toLocaleString() : "—"}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {c.rating > 0 ? (
                      <>
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        <span className="text-[13px] font-semibold text-(--text-title)">{c.rating}</span>
                      </>
                    ) : (
                      <span className="text-[12px] text-(--gray-400)">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <CourseStatusBadge status={c.status} />

                  {/* Action */}
                  <div className="flex justify-center">
                    <CourseActionMenu
                      open={openMenuId === c.id}
                      onToggle={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                      setRef={(el) => menuRefs.current.set(c.id, el)}
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
