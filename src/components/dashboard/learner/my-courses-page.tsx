"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  Clock,
  X,
  ChevronDown,
} from "lucide-react";
import Image, { StaticImageData } from "next/image";
import img1 from "@/assets/images/popular-courses/image1.webp";
import img2 from "@/assets/images/popular-courses/image2.webp";
import img3 from "@/assets/images/popular-courses/image3.webp";
import img4 from "@/assets/images/popular-courses/image4.webp";
import img5 from "@/assets/images/popular-courses/image5.webp";
import img6 from "@/assets/images/popular-courses/image6.webp";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";

const PAGE_SIZE = 6;

type Tab = "All" | "In Progress" | "Completed" | "Archived";

const courses: {
  tab: Tab;
  image: StaticImageData;
  level: string;
  category: string;
  categoryColor: string;
  title: string;
  instructor: string;
  initials: string;
  initialsColor: string;
  rating: number;
  lessons: string;
  pct: number;
  timeLeft: string;
  lastSeen: string;
}[] = [
  {
    tab: "In Progress",
    image: img1,
    level: "Intermediate",
    category: "AI & ML",
    categoryColor: "text-violet-600 bg-violet-50",
    title: "Applied Machine Learning with Python",
    instructor: "Dr. Lena Park",
    initials: "DL",
    initialsColor: "bg-orange-500",
    rating: 4.9,
    lessons: "32/47",
    pct: 68,
    timeLeft: "6h 20m left",
    lastSeen: "2 hours ago",
  },
  {
    tab: "In Progress",
    image: img2,
    level: "Beginner",
    category: "Data",
    categoryColor: "text-cyan-600 bg-cyan-50",
    title: "Data Visualization & Storytelling",
    instructor: "Marcus Webb",
    initials: "MW",
    initialsColor: "bg-orange-400",
    rating: 4.8,
    lessons: "11/28",
    pct: 41,
    timeLeft: "9h 05m left",
    lastSeen: "Yesterday",
  },
  {
    tab: "In Progress",
    image: img3,
    level: "Intermediate",
    category: "Design",
    categoryColor: "text-pink-600 bg-pink-50",
    title: "Product Design Systems",
    instructor: "Sofia Alvarez",
    initials: "SA",
    initialsColor: "bg-emerald-500",
    rating: 4.9,
    lessons: "5/21",
    pct: 23,
    timeLeft: "11h 40m left",
    lastSeen: "4 days ago",
  },
  {
    tab: "Completed",
    image: img4,
    level: "Beginner",
    category: "AI & ML",
    categoryColor: "text-violet-600 bg-violet-50",
    title: "Python for Data Science",
    instructor: "Dr. Lena Park",
    initials: "DL",
    initialsColor: "bg-orange-500",
    rating: 4.7,
    lessons: "24/24",
    pct: 100,
    timeLeft: "Completed",
    lastSeen: "3 weeks ago",
  },
  {
    tab: "Completed",
    image: img5,
    level: "Intermediate",
    category: "Data",
    categoryColor: "text-cyan-600 bg-cyan-50",
    title: "SQL for Analytics",
    instructor: "Marcus Webb",
    initials: "MW",
    initialsColor: "bg-orange-400",
    rating: 4.6,
    lessons: "18/18",
    pct: 100,
    timeLeft: "Completed",
    lastSeen: "1 month ago",
  },
  {
    tab: "Completed",
    image: img6,
    level: "Beginner",
    category: "Design",
    categoryColor: "text-pink-600 bg-pink-50",
    title: "UX Research Fundamentals",
    instructor: "Sofia Alvarez",
    initials: "SA",
    initialsColor: "bg-emerald-500",
    rating: 4.8,
    lessons: "12/12",
    pct: 100,
    timeLeft: "Completed",
    lastSeen: "2 months ago",
  },
  {
    tab: "In Progress",
    image: img4,
    level: "Advanced",
    category: "AI & ML",
    categoryColor: "text-violet-600 bg-violet-50",
    title: "Deep Learning with TensorFlow",
    instructor: "Dr. Lena Park",
    initials: "DL",
    initialsColor: "bg-orange-500",
    rating: 4.8,
    lessons: "14/36",
    pct: 39,
    timeLeft: "12h 10m left",
    lastSeen: "3 days ago",
  },
  {
    tab: "In Progress",
    image: img5,
    level: "Beginner",
    category: "Data",
    categoryColor: "text-cyan-600 bg-cyan-50",
    title: "Excel for Business Analytics",
    instructor: "Marcus Webb",
    initials: "MW",
    initialsColor: "bg-orange-400",
    rating: 4.5,
    lessons: "8/20",
    pct: 40,
    timeLeft: "5h 30m left",
    lastSeen: "Today",
  },
  {
    tab: "Completed",
    image: img1,
    level: "Beginner",
    category: "Design",
    categoryColor: "text-pink-600 bg-pink-50",
    title: "Figma UI Design Basics",
    instructor: "Sofia Alvarez",
    initials: "SA",
    initialsColor: "bg-emerald-500",
    rating: 4.9,
    lessons: "15/15",
    pct: 100,
    timeLeft: "Completed",
    lastSeen: "2 weeks ago",
  },
  {
    tab: "Completed",
    image: img2,
    level: "Intermediate",
    category: "AI & ML",
    categoryColor: "text-violet-600 bg-violet-50",
    title: "Natural Language Processing",
    instructor: "Dr. Lena Park",
    initials: "DL",
    initialsColor: "bg-orange-500",
    rating: 4.7,
    lessons: "22/22",
    pct: 100,
    timeLeft: "Completed",
    lastSeen: "6 weeks ago",
  },
  {
    tab: "Archived",
    image: img3,
    level: "Advanced",
    category: "AI & ML",
    categoryColor: "text-violet-600 bg-violet-50",
    title: "Reinforcement Learning",
    instructor: "Dr. Lena Park",
    initials: "DL",
    initialsColor: "bg-orange-500",
    rating: 4.5,
    lessons: "3/40",
    pct: 8,
    timeLeft: "Archived",
    lastSeen: "5 months ago",
  },
  {
    tab: "Archived",
    image: img6,
    level: "Intermediate",
    category: "Data",
    categoryColor: "text-cyan-600 bg-cyan-50",
    title: "Big Data with Apache Spark",
    instructor: "Marcus Webb",
    initials: "MW",
    initialsColor: "bg-orange-400",
    rating: 4.4,
    lessons: "2/30",
    pct: 7,
    timeLeft: "Archived",
    lastSeen: "4 months ago",
  },
  {
    tab: "Archived",
    image: img4,
    level: "Advanced",
    category: "Design",
    categoryColor: "text-pink-600 bg-pink-50",
    title: "Motion Design & After Effects",
    instructor: "Sofia Alvarez",
    initials: "SA",
    initialsColor: "bg-emerald-500",
    rating: 4.6,
    lessons: "1/25",
    pct: 4,
    timeLeft: "Archived",
    lastSeen: "7 months ago",
  },
];

const tabs: { label: Tab; count: number }[] = [
  { label: "All", count: courses.length },
  {
    label: "In Progress",
    count: courses.filter((c) => c.tab === "In Progress").length,
  },
  {
    label: "Completed",
    count: courses.filter((c) => c.tab === "Completed").length,
  },
  {
    label: "Archived",
    count: courses.filter((c) => c.tab === "Archived").length,
  },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const CATEGORIES = ["AI & ML", "Data", "Design"];

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const resetPage = () => setCurrentPage(1);

  const toggleLevel = (v: string) => {
    setSelectedLevels((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    );
    resetPage();
  };

  const toggleCategory = (v: string) => {
    setSelectedCategories((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    );
    resetPage();
  };

  const activeFilterCount = selectedLevels.length + selectedCategories.length;

  const filtered = courses.filter(
    (c) =>
      (activeTab === "All" || c.tab === activeTab) &&
      c.title.toLowerCase().includes(search.toLowerCase()) &&
      (selectedLevels.length === 0 || selectedLevels.includes(c.level)) &&
      (selectedCategories.length === 0 ||
        selectedCategories.includes(c.category)),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".course-card");
    gsap.killTweensOf(cards);
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power3.out" },
    );
  }, [activeTab, search, view, selectedLevels, selectedCategories, safePage]);

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            My Courses
          </h1>
          <p className=" text-[14px] text-(--gray-500) mt-0.5">
            Pick up where you left off across {courses.length} enrolled courses.
          </p>
        </div>
        <button className="self-start flex  items-center cursor-pointer gap-2 bg-(--primary-700) hover:bg-(--primary-600) text-white  text-[14px] font-semibold px-4 py-2.5 rounded-lg transition-colors truncate">
          <Plus className="w-4 h-4" />
          Browse Catalog
        </button>
      </div>
      {/* Tabs + Search + Filter */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={() => {
                setActiveTab(t.label);
                resetPage();
              }}
              className={`flex items-center gap-1.5 cursor-pointer px-3.5 h-11 rounded-md text-[12px] md:text-[14px]  transition-colors border whitespace-nowrap shrink-0 ${
                activeTab === t.label
                  ? "bg-(--primary-600) text-white border-(--primary-600) font-medium"
                  : "bg-white text-(--gray-500) font-normal border-(--gray-200) hover:border-(--primary-300)"
              }`}
            >
              {t.label}
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === t.label
                    ? "bg-white/20 text-white"
                    : "bg-(--gray-100) text-(--gray-500)"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Filter + View toggle */}
        <div className="flex items-center gap-2 min-w-0 ">
          <div className="relative flex-1 min-w-0 ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="w-full  h-12 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) focus:outline-none focus:border-(--primary-400)"
            />
          </div>
          {/* Filter button + dropdown */}
          <div ref={filterRef} className="relative shrink-0">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center gap-1.5 h-12 px-3 lg:px-4 border rounded-lg text-[14px] font-medium cursor-pointer transition-colors ${
                filterOpen || activeFilterCount > 0
                  ? "border-(--primary-400) bg-(--primary-50) text-(--primary-600)"
                  : "border-(--gray-200) bg-white text-(--gray-500) hover:bg-(--gray-50)"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-(--primary-600) text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {filterOpen && (
              <>
                {/* Mobile backdrop */}
                <div
                  className="sm:hidden fixed inset-0 bg-black/40 z-40"
                  onClick={() => setFilterOpen(false)}
                />

                {/* Mobile centered modal / Desktop dropdown */}
                <div className="
                  fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-32px)] max-w-sm rounded-2xl
                  sm:absolute sm:top-[calc(100%+8px)] sm:left-auto sm:right-0 sm:translate-x-0 sm:translate-y-0 sm:w-72
                  bg-white border border-(--gray-200) shadow-xl overflow-hidden
                ">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-(--gray-100)">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-(--primary-600)" />
                      <span className="text-[14px] font-semibold text-(--text-title)">
                        Filters
                      </span>
                    </div>
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="w-7 h-7 flex items-center cursor-pointer justify-center rounded-lg hover:bg-(--gray-100) transition-colors"
                    >
                      <X className="w-4 h-4 text-(--gray-400)" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Level */}
                    <div>
                      <p className="text-[11px] font-bold text-(--gray-400) uppercase tracking-wider mb-2.5">
                        Level
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {LEVELS.map((l) => (
                          <button
                            key={l}
                            onClick={() => toggleLevel(l)}
                            className={`text-[12px] font-semibold cursor-pointer px-3 py-1.5 rounded-full border transition-colors ${
                              selectedLevels.includes(l)
                                ? "bg-(--primary-600) text-white border-(--primary-600)"
                                : "border-(--gray-200) text-(--gray-600) hover:border-(--primary-400) hover:text-(--primary-600)"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-(--gray-100)" />

                    {/* Category */}
                    <div>
                      <p className="text-[11px] font-bold text-(--gray-400) uppercase tracking-wider mb-2.5">
                        Category
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c}
                            onClick={() => toggleCategory(c)}
                            className={`text-[12px] font-semibold cursor-pointer px-3 py-1.5 rounded-full border transition-colors ${
                              selectedCategories.includes(c)
                                ? "bg-(--primary-600) text-white border-(--primary-600)"
                                : "border-(--gray-200) text-(--gray-600) hover:border-(--primary-400) hover:text-(--primary-600)"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center border border-(--gray-200) rounded-xl overflow-hidden bg-white shrink-0">
            <button
              onClick={() => setView("grid")}
              className={`w-10 h-12 flex items-center cursor-pointer justify-center transition-colors ${
                view === "grid"
                  ? "bg-(--primary-50) text-(--primary-600)"
                  : "text-(--gray-400) hover:bg-(--gray-50)"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`w-10 h-12 flex items-center cursor-pointer justify-center transition-colors ${
                view === "list"
                  ? "bg-(--primary-50) text-(--primary-600)"
                  : "text-(--gray-400) hover:bg-(--gray-50)"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Course grid / list */}
      <div
        ref={gridRef}
        className={
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
            : "flex flex-col gap-3"
        }
      >
        {paginated.length === 0 && (
          <p className="text-(--gray-400) text-[14px] col-span-3 py-12 text-center">
            No courses found.
          </p>
        )}
        {paginated.map((course, i) =>
          view === "grid" ? (
            <GridCard key={i} course={course} />
          ) : (
            <ListCard key={i} course={course} />
          ),
        )}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={(p) => {
          setCurrentPage(p);
        }}
      />
    </div>
  );
}

// Grid Card

function GridCard({ course }: { course: (typeof courses)[0] }) {
  return (
    <div className="course-card bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 z-10 text-[12px] font-semibold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {course.level}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Category + Rating */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${course.categoryColor}`}
          >
            {course.category}
          </span>
          <span className="flex items-center gap-1 text-[12px] font-semibold text-(--text-title)">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {course.rating}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title) leading-snug group-hover:text-(--primary-600) transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full ${course.initialsColor} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
          >
            {course.initials}
          </div>
          <span className="text-[12px] font-medium text-(--gray-500)">
            {course.instructor}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-medium text-(--gray-500)">
              {course.lessons} lessons
            </span>
            <span className="text-[12px] font-semibold text-(--primary-700)">
              {course.pct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-(--gray-100)">
            <div
              className="h-2 rounded-full bg-(--primary-700) transition-all duration-700"
              style={{ width: `${course.pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-[12px] text-(--gray-500)">
            <Clock className="w-4 h-4" />
            {course.timeLeft}
          </span>
          <span className="text-[12px] text-(--gray-500)">
            {course.lastSeen}
          </span>
        </div>
      </div>
    </div>
  );
}

// List Card
function ListCard({ course }: { course: (typeof courses)[0] }) {
  return (
    <div className="course-card bg-white rounded-2xl border border-(--gray-200) p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl shrink-0 overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${course.categoryColor}`}
          >
            {course.category}
          </span>
          <span className="text-[12px] text-(--gray-500)">{course.level}</span>
        </div>
        <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title) truncate group-hover:text-(--primary-600) transition-colors">
          {course.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full ${course.initialsColor} flex items-center justify-center text-white text-[10px] font-bold`}
            >
              {course.initials}
            </div>
            <span className="text-[12px] text-(--gray-500) font-normal">
              {course.instructor}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[12px] font-normal text-(--gray-500)">
            <Clock className="w-4 h-4" />
            {course.timeLeft}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 w-36">
        <div className="flex items-center justify-between w-full">
          <span className="text-[12px] text-(--gray-500)">
            {course.lessons} lessons
          </span>
          <span className="text-[12px] font-semibold text-(--primary-700)">
            {course.pct}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-(--gray-100)">
          <div
            className="h-2 rounded-full bg-(--primary-600) transition-all duration-700"
            style={{ width: `${course.pct}%` }}
          />
        </div>
        <span className="text-[12px] text-(--gray-500) self-end">
          {course.lastSeen}
        </span>
      </div>

      {/* Rating */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="text-[12px] font-semibold text-(--text-title)">
          {course.rating}
        </span>
      </div>
    </div>
  );
}
