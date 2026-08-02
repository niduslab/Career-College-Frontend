"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { Search, ChevronDown, BookOpen, Loader2 } from "lucide-react";
import type { Course, CourseCategory, CourseStatus } from "./types";
import CourseStatusBadge from "./status-badge";
import CourseActionMenu from "./action-menu";
import {
  STATUS_OPTIONS,
  STATUS_LABEL,
  LEVEL_OPTIONS,
  LEVEL_LABEL,
} from "./data";
import { archiveCourse, reworkCourse } from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const COLS = "grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_90px_80px_130px_40px]";

const LEVEL_COLOR: Record<string, string> = {
  beginner: "text-green-600 bg-green-50",
  intermediate: "text-blue-600 bg-blue-50",
  advanced: "text-orange-500 bg-orange-50",
};

interface TableProps {
  courses: Course[];
  categories: CourseCategory[];
  loading: boolean;
  onRefresh: () => void;
}

export default function CoursesTable({
  courses,
  categories,
  loading,
  onRefresh,
}: TableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | number>("All");
  const [levelFilter, setLevelFilter] = useState<
    "All" | "beginner" | "intermediate" | "advanced"
  >("All");
  const [statusFilter, setStatusFilter] = useState<"All" | CourseStatus>("All");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.35, delay: i * 0.05, ease: "power2.out" },
      );
    });
  }, [search, categoryFilter, levelFilter, statusFilter, courses]);

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

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || c.category?.id === categoryFilter;
    const matchLevel = levelFilter === "All" || c.level === levelFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchCat && matchLevel && matchStatus;
  });

  const handleArchive = async (course: Course) => {
    setBusyId(course.id);
    setOpenMenuId(null);
    try {
      await archiveCourse(course.id);
      notify.success("Course archived.");
      onRefresh();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to archive course.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRework = async (course: Course) => {
    setBusyId(course.id);
    setOpenMenuId(null);
    try {
      await reworkCourse(course.id);
      notify.success("Course moved back to draft.");
      onRefresh();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to rework course.");
    } finally {
      setBusyId(null);
    }
  };

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
            placeholder="Search by title..."
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
              <span className="flex-1 text-left truncate">
                {categoryFilter === "All"
                  ? "Category"
                  : categories.find((c) => c.id === categoryFilter)?.name ?? "Category"}
              </span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${categoryOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-44 max-h-52 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setCategoryFilter("All"); closeAllFilters(); }}
                  className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${categoryFilter === "All" ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} type="button"
                    onClick={() => { setCategoryFilter(cat.id); closeAllFilters(); }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${cat.id === categoryFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {cat.name}
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
              <span className="flex-1 text-left truncate">{LEVEL_LABEL[levelFilter]}</span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${levelOpen ? "rotate-180" : ""}`} />
            </button>
            {levelOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-40">
                {LEVEL_OPTIONS.map((lv) => (
                  <button key={lv} type="button"
                    onClick={() => { setLevelFilter(lv); closeAllFilters(); }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${lv === levelFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {LEVEL_LABEL[lv]}
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
              <span className="flex-1 text-left truncate">{STATUS_LABEL[statusFilter]}</span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`} />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-40">
                {STATUS_OPTIONS.map((st) => (
                  <button key={st} type="button"
                    onClick={() => { setStatusFilter(st); closeAllFilters(); }}
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
        <div className="min-w-220">
          {/* Header */}
          <div className={`grid ${COLS} px-3 pb-2 border-b border-(--gray-100)`}>
            {["Course", "Category", "Instructors", "Level", "Price", "Status"].map((h) => (
              <p key={h} className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                {h}
              </p>
            ))}
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-center">
              Action
            </p>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-(--gray-400) mx-auto mb-2 animate-spin" />
              <p className="text-[14px] text-(--gray-500)">Loading courses…</p>
            </div>
          ) : filtered.length === 0 ? (
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
                  className={`opacity-0 grid ${COLS} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors cursor-pointer`}
                  onClick={() => router.push(`/dashboard/partnership/courses/${c.id}`)}
                >
                  {/* Course title + thumbnail + level */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-(--gray-100) flex items-center justify-center">
                      {c.thumbnail ? (
                        <Image
                          src={c.thumbnail}
                          alt={c.title}
                          width={40}
                          height={40}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-5 h-5 text-(--gray-400)" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-(--text-title) truncate leading-snug">{c.title}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${LEVEL_COLOR[c.level]}`}>
                        {LEVEL_LABEL[c.level]}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <p className="text-[12px] text-(--gray-600) truncate">{c.category?.name ?? "—"}</p>

                  {/* Instructors */}
                  <p className="text-[12px] text-(--gray-600) truncate">
                    {c.instructors.length > 0
                      ? c.instructors.map((i2) => i2.full_name).join(", ")
                      : "—"}
                  </p>

                  {/* Level (duplicated column intentionally removed; showing price next) */}
                  <p className="text-[12px] text-(--gray-600)">{LEVEL_LABEL[c.level]}</p>

                  {/* Price */}
                  <p className="text-[13px] font-semibold text-(--text-title)">
                    {Number(c.price) > 0 ? `BDT ${c.price}` : "Free"}
                  </p>

                  {/* Status */}
                  <CourseStatusBadge status={c.status} />

                  {/* Action */}
                  <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <CourseActionMenu
                      open={openMenuId === c.id}
                      onToggle={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                      setRef={(el) => menuRefs.current.set(c.id, el)}
                      status={c.status}
                      busy={busyId === c.id}
                      onView={() => {
                        setOpenMenuId(null);
                        router.push(`/dashboard/partnership/courses/${c.id}`);
                      }}
                      onEdit={() => {
                        setOpenMenuId(null);
                        router.push(`/dashboard/instructor/course-builder?courseId=${c.id}`);
                      }}
                      onArchive={() => handleArchive(c)}
                      onRework={() => handleRework(c)}
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
