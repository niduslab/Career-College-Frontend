"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  Heart,
  ListFilter,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { gsap, prepareGsap } from "@/lib/gsap";
import { useCourseCatalog } from "@/hooks/use-course-catalog";
import { useToggleWishlist } from "@/hooks/use-wishlist";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { CatalogCourse, CatalogFilterParams, CatalogSort } from "@/lib/course-api";

const PAGE_SIZE = 6;

const SORT_OPTIONS: { label: string; value: CatalogSort }[] = [
  { label: "Most Popular", value: "popularity" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Highest Rated", value: "rating" },
];

function formatDuration(minutes: number | null): string {
  if (!minutes) return "Self-paced";
  const hours = minutes / 60;
  return hours >= 1 ? `${Math.round(hours * 10) / 10}h` : `${minutes}m`;
}

// Owns its own wishlist mutation — a shared instance across the grid would
// disable every heart button while any one card's toggle was in flight.
function FilterCourseCard({ course }: { course: CatalogCourse }) {
  const thumbnail = mediaUrl(course.thumbnail);
  const price = Number(course.price);
  const instructor = course.instructors[0]?.full_name ?? "Career College";
  const wishlistMutation = useToggleWishlist();

  const handleToggleWishlist = () => {
    wishlistMutation.mutate(
      { slug: course.slug, isWishlisted: course.is_wishlisted },
      {
        onError: (err) => {
          notify.error(
            err instanceof ApiError
              ? err.message
              : "Couldn't update your wishlist.",
          );
        },
      },
    );
  };

  return (
    <article
      data-filter-card
      className="rounded-2xl border border-(--gray-200) bg-(--text-white) p-3 md:p-4 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(16,24,40,0.10)]"
    >
      <div className="relative h-44 overflow-hidden rounded-lg bg-(--gray-50)">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--gray-300) text-[13px]">
            No image
          </div>
        )}
        <button
          type="button"
          aria-label={
            course.is_wishlisted ? "Remove from wishlist" : "Add to favorites"
          }
          onClick={handleToggleWishlist}
          disabled={wishlistMutation.isPending}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-(--text-white)/95 text-(--gray-500) shadow-[0_8px_20px_rgba(16,24,40,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Heart
            size={18}
            strokeWidth={2.2}
            className={course.is_wishlisted ? "fill-rose-500 text-rose-500" : ""}
          />
        </button>
      </div>

      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-[1.3] tracking-[-0.01em] text-(--text-title) min-h-9.5">
          {course.title}
        </h3>

        <p className="mt-1.5 text-[13px] text-(--text-paragraph)">
          By {instructor}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-dashed border-(--gray-200) pb-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 text-[12px] text-(--gray-500)">
            <Clock3 size={12} />
            {formatDuration(course.duration_minutes)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 text-[12px] text-(--gray-500) capitalize">
            {course.level}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4">
          <p className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-(--text-title)">
            {price > 0 ? `BDT ${price.toFixed(2)}` : "Free"}
          </p>
          <Link
            href={`/courses/${course.slug}`}
            className="h-9 inline-flex items-center cursor-pointer rounded-md bg-(--primary-700) px-4 text-[14px] font-semibold text-(--text-white) transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

interface CoursesFilterGridProps {
  onFilterOpen?: () => void;
  onDesktopToggle?: () => void;
  sidebarVisible?: boolean;
  filters: CatalogFilterParams;
  onSortChange: (sort: CatalogSort) => void;
  page: number;
  onPageChange: (page: number) => void;
}

export function CoursesFilterGrid({
  onFilterOpen,
  onDesktopToggle,
  sidebarVisible = true,
  filters,
  onSortChange,
  page,
  onPageChange,
}: CoursesFilterGridProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useCourseCatalog({
    ...filters,
    page,
    page_size: PAGE_SIZE,
  });
  const courses = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ??
    "Most Popular";

  useEffect(() => {
    if (!sectionRef.current || courses.length === 0) return;

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
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [page, sidebarVisible, courses.length]);

  return (
    <div ref={sectionRef} className="min-w-0 flex-1">
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onFilterOpen}
            className="inline-flex cursor-pointer  items-center gap-2 rounded-lg border border-(--gray-200) bg-(--text-white) px-4 h-10 text-[14px] font-medium text-(--text-title) lg:hidden"
          >
            <ListFilter size={16} />
            Filters
          </button>
          {!sidebarVisible && (
            <button
              type="button"
              onClick={onDesktopToggle}
              className="hidden lg:inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--gray-200) bg-(--text-white) px-4 h-10 text-[14px] font-medium text-(--text-title) hover:border-(--gray-300) transition-colors"
            >
              <ListFilter size={16} />
              Show Filters
            </button>
          )}
          <div>
            <h2 className="lg:text-[20px] text-[16px] font-semibold text-(--text-title)">
              All Courses
            </h2>
            <p className="text-[14px] text-[#4d4c44] font-normal">
              {isLoading ? "Loading…" : `Showing ${data?.count ?? 0} courses`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-(--gray-200) cursor-pointer px-4 h-10 text-[16px] font-normal text-(--text-paragraph) hover:border-(--gray-300)"
            >
              {sortLabel}
              <ChevronDown size={20} className="text-(--gray-500)" />
            </button>

            {sortOpen && (
              <ul className="absolute left-0 sm:left-auto right-0 top-11 z-50 min-w-48 rounded-lg border bg-(--text-white) border-(--gray-200) py-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.10)]">
                {SORT_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onSortChange(opt.value);
                        setSortOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-[14px] cursor-pointer hover:bg-(--gray-50) ${
                        filters.sort === opt.value
                          ? "font-semibold text-(--primary-700)"
                          : "text-(--text-paragraph)"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-(--primary-600)" />
        </div>
      ) : isError ? (
        <p className="py-24 text-center text-[14px] text-(--gray-500)">
          Could not load courses. Please try again.
        </p>
      ) : courses.length === 0 ? (
        <p className="py-24 text-center text-[14px] text-(--gray-500)">
          No courses match your filters.
        </p>
      ) : (
        <>
          <div
            ref={gridRef}
            className={`grid gap-4 sm:grid-cols-2 lg:gap-5 ${
              sidebarVisible
                ? "lg:grid-cols-2 xl:grid-cols-3"
                : "lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {courses.map((course) => (
              <FilterCourseCard key={course.id} course={course} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              onPageChange(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}
