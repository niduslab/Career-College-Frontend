"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  BookOpen,
  Clock3,
  UsersRound,
  Star,
  Heart,
  ListFilter,
  ChevronDown,
} from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { gsap, prepareGsap } from "@/lib/gsap";
import Image1 from "@/assets/images/popular-courses/image1.webp";
import Image2 from "@/assets/images/popular-courses/image2.webp";
import Image3 from "@/assets/images/popular-courses/image3.webp";
import Image4 from "@/assets/images/popular-courses/image4.webp";
import Image5 from "@/assets/images/popular-courses/image5.webp";
import Image6 from "@/assets/images/popular-courses/image6.webp";
import type { StaticImageData } from "next/image";

interface Course {
  title: string;
  instructor: string;
  lessons: string;
  duration: string;
  students: string;
  rating: string;
  price: string;
  image: StaticImageData;
}

const COURSES: Course[] = [
  {
    title: "AI Engineer Agentic Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image1,
  },
  {
    title: "AI Engineer Agentic Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image2,
  },
  {
    title: "AI Engineer Agentic Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image3,
  },
  {
    title: "AI Engineer Agentic Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image4,
  },
  {
    title: "AI Engineer Agentic Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image5,
  },
  {
    title: "AI Engineer Agentic Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image6,
  },
  {
    title: "AI Engineer Agentic Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image1,
  },
  {
    title: "AI Engineer Agentic Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image2,
  },
  {
    title: "AI Engineer Agentic Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image3,
  },
];

const SORT_OPTIONS = [
  "Most Popular",
  "Newest",
  "Price: Low to High",
  "Price: High to Low",
  "Highest Rated",
];

interface CoursesFilterGridProps {
  onFilterOpen?: () => void;
  onDesktopToggle?: () => void;
  sidebarVisible?: boolean;
}

export function CoursesFilterGrid({
  onFilterOpen,
  onDesktopToggle,
  sidebarVisible = true,
}: CoursesFilterGridProps) {
  const [sort, setSort] = useState("Most Popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-filter-card]",
        { opacity: 0, y: 28, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [currentPage, sidebarVisible]);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(COURSES.length / ITEMS_PER_PAGE);
  const paginatedCourses = COURSES.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div ref={sectionRef} className="min-w-0 flex-1">
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Filter & Sort — mobile only, opens drawer */}
          <button
            type="button"
            onClick={onFilterOpen}
            className="inline-flex cursor-pointer  items-center gap-2 rounded-lg border border-(--gray-200) bg-(--text-white) px-4 h-10 text-[14px] font-medium text-(--text-title) lg:hidden"
          >
            <ListFilter size={16} />
            Filter &amp; Sort
          </button>
          {/* Filter & Sort — desktop, only when sidebar is collapsed */}
          {!sidebarVisible && (
            <button
              type="button"
              onClick={onDesktopToggle}
              className="hidden lg:inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--gray-200) bg-(--text-white) px-4 h-10 text-[14px] font-medium text-(--text-title) hover:border-(--gray-300) transition-colors"
            >
              <ListFilter size={16} />
              Filter &amp; Sort
            </button>
          )}
          <div>
            <h2 className="lg:text-[20px] text-[16px] font-semibold text-(--text-title)">
              All Courses
            </h2>
            <p className="text-[14px] text-[#4d4c44] font-normal">
              Show 12,570 Courses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-(--gray-200) cursor-pointer px-4 h-10 text-[16px] font-normal text-(--text-paragraph) hover:border-(--gray-300)"
            >
              {sort}
              <ChevronDown size={20} className="text-(--gray-500)" />
            </button>

            {sortOpen && (
              <ul className="absolute left-0 sm:left-auto right-0 top-11 z-50 min-w-48 rounded-lg border bg-(--text-white) border-(--gray-200) py-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.10)]">
                {SORT_OPTIONS.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => {
                        setSort(opt);
                        setSortOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-[14px] hover:bg-(--gray-50) ${
                        sort === opt
                          ? "font-semibold text-(--primary-700)"
                          : "text-(--text-paragraph)"
                      }`}
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Course grid */}
      <div
        ref={gridRef}
        className={`grid gap-4 sm:grid-cols-2 lg:gap-5 ${
          sidebarVisible
            ? "lg:grid-cols-2 xl:grid-cols-3"
            : "lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {paginatedCourses.map((course, index) => (
          <article
            key={`${course.title}-${index}`}
            data-filter-card
            className="rounded-2xl border border-(--gray-200) bg-(--text-white) p-3 md:p-4 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(16,24,40,0.10)]"
          >
            <div className="relative h-44 overflow-hidden rounded-lg">
              <Image
                src={course.image}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
              <button
                type="button"
                aria-label="Add to favorites"
                className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--text-white)/95 text-(--gray-500) shadow-[0_8px_20px_rgba(16,24,40,0.12)]"
              >
                <Heart size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="mt-3 px-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-[15px] font-semibold leading-[1.3] tracking-[-0.01em] text-(--text-title)">
                  {course.title}
                </h3>
                <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[13px] text-(--text-paragraph)">
                  <Star size={14} className="fill-[#ffa500] text-[#ffa500]" />
                  {course.rating}
                </span>
              </div>

              <p className="mt-1.5 text-[13px] text-(--text-paragraph)">
                By {course.instructor}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 border-b border-dashed border-(--gray-200) pb-4">
                <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 text-[12px] text-(--gray-500)">
                  <BookOpen size={12} />
                  {course.lessons}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 text-[12px] text-(--gray-500)">
                  <Clock3 size={12} />
                  {course.duration}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 text-[12px] text-(--gray-500)">
                  <UsersRound size={12} />
                  {course.students}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-(--text-title)">
                  {course.price}
                </p>
                <button
                  type="button"
                  className="h-9 cursor-pointer rounded-md bg-(--primary-700) px-4 text-[16px] font-semibold text-(--text-white) transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
