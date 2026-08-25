"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Clock3, Heart, Loader2 } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import {
  useCourseCatalog,
  useCourseCategories,
} from "@/hooks/use-course-catalog";
import { useToggleWishlist } from "@/hooks/use-wishlist";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { CatalogCourse } from "@/lib/course-api";

const CARD_COUNT = 6;
const VISIBLE_CATEGORY_COUNT = 6;

function formatDuration(minutes: number | null): string {
  if (!minutes) return "Self-paced";
  const hours = minutes / 60;
  return hours >= 1 ? `${Math.round(hours * 10) / 10}h` : `${minutes}m`;
}

function CourseCard({ course }: { course: CatalogCourse }) {
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
      data-course-card
      className="rounded-2xl  border border-(--gray-200) bg-(--text-white) p-4"
    >
      <div className="relative h-55 overflow-hidden rounded-lg bg-(--gray-50) before:absolute before:inset-0 before:z-10">
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
            className={
              course.is_wishlisted ? "fill-rose-500 text-rose-500" : ""
            }
          />
        </button>
      </div>

      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 sg-p-big leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title) min-h-11">
          {course.title}
        </h3>
        <p className="mt-2 sg-p-small font-normal text-(--text-paragraph)">
          By {instructor}
        </p>
        <div className="mt-5 flex flex-wrap gap-4 border-b border-dashed border-(--gray-200) pb-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
            <Clock3 size={14} />
            {formatDuration(course.duration_minutes)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500) capitalize">
            {course.level}
          </span>
        </div>

        <div className="flex items-center justify-between py-4">
          <p className="text-[24px] leading-none font-semibold tracking-[-0.02em] text-(--text-title)">
            {price > 0 ? `BDT ${price.toFixed(2)}` : "Free"}
          </p>
          <Link
            href={`/courses/${course.slug}`}
            className="h-10 rounded-md border bg-(--primary-700) sg-p-default  px-3  font-semibold text-(--text-white) transition-colors cursor-pointer inline-flex items-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function PopularCourses() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [moreOpen, setMoreOpen] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);

  const { data: categoriesData } = useCourseCategories();
  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const visibleCategories = categories.slice(0, VISIBLE_CATEGORY_COUNT);
  const overflowCategories = categories.slice(VISIBLE_CATEGORY_COUNT);
  const activeIsOverflow = overflowCategories.some(
    (c) => c.slug === activeCategory,
  );

  useEffect(() => {
    if (!moreOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insidePanel = moreRef.current?.contains(target);
      const insideButton = moreButtonRef.current?.contains(target);
      if (!insidePanel && !insideButton) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [moreOpen]);

  const { data: catalogData, isLoading } = useCourseCatalog({
    category: activeCategory || undefined,
    sort: "popularity",
    page_size: CARD_COUNT,
  });
  const courses = catalogData?.results ?? [];

  useEffect(() => {
    if (!sectionRef.current) return;
    prepareGsap();

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      if (tabsRef.current) {
        gsap.fromTo(
          tabsRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: {
              trigger: tabsRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Cards render only once the catalog query resolves — targeting the
      // selector while the grid is still empty/loading is what GSAP was
      // warning about ("target not found"), so skip until there's something to animate.
      if (courses.length > 0) {
        gsap.fromTo(
          "[data-course-card]",
          { opacity: 0, y: 24, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "opacity,transform",
            scrollTrigger: {
              trigger: "[data-course-card]",
              start: "top 75%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      gsap.fromTo(
        "[data-view-all-btn]",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.3,
          scrollTrigger: {
            trigger: "[data-view-all-btn]",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [activeCategory, courses.length]);

  return (
    <section
      ref={sectionRef}
      className="w-full  mt-10 lg:mt-25 bg-(--gray-50) py-12 md:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2
          ref={headingRef}
          className="text-center text-[24px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]"
        >
          Our Popular Courses
          <br />
          You Can Start
        </h2>

        <div className="relative z-30 mt-6 md:mt-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-(--gray-50) to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-(--gray-50) to-transparent z-10" />
          <div
            ref={tabsRef}
            className="hide-scrollbar -mx-4 flex flex-nowrap items-center gap-2.5 overflow-x-auto px-4"
          >
            <button
              type="button"
              aria-pressed={activeCategory === ""}
              onClick={() => setActiveCategory("")}
              className={`cursor-pointer whitespace-nowrap h-10 rounded-full px-4 py-1 border sg-p-default text-sm transition-colors shrink-0 ${
                activeCategory === ""
                  ? "border-(--primary-700) bg-(--primary-700) text-(--text-white) font-medium shadow-sm"
                  : "border-(--gray-200) bg-(--text-white) text-(--text-title) hover:border-(--primary-300) hover:bg-(--gray-50) font-normal"
              }`}
            >
              All Courses
            </button>
            {visibleCategories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                aria-pressed={activeCategory === cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`cursor-pointer whitespace-nowrap h-10 rounded-full px-4 py-1 border sg-p-default text-sm transition-colors shrink-0 ${
                  activeCategory === cat.slug
                    ? "border-(--primary-700) bg-(--primary-700) text-(--text-white) font-medium shadow-sm"
                    : "border-(--gray-200) bg-(--text-white) text-(--text-title) hover:border-(--primary-300) hover:bg-(--gray-50) font-normal"
                }`}
              >
                {cat.name}
              </button>
            ))}

            {overflowCategories.length > 0 && (
              <button
                ref={moreButtonRef}
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                className={`cursor-pointer whitespace-nowrap h-10 rounded-full px-4 py-1 border sg-p-default text-sm transition-colors inline-flex items-center gap-1 shrink-0 ${
                  activeIsOverflow
                    ? "border-(--primary-700) bg-(--primary-700) text-(--text-white) font-medium shadow-sm"
                    : "border-(--gray-200) bg-(--text-white) text-(--text-title) hover:border-(--primary-300) hover:bg-(--gray-50) font-normal"
                }`}
              >
                {activeIsOverflow
                  ? categories.find((c) => c.slug === activeCategory)?.name
                  : "More"}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>

          {moreOpen && overflowCategories.length > 0 && (
            <div
              ref={moreRef}
              className="absolute right-0 top-full z-40 mt-2 w-56 rounded-xl border border-(--gray-200) bg-(--text-white) py-1.5 shadow-lg"
            >
              {overflowCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.slug);
                    setMoreOpen(false);
                  }}
                  className={`block w-full cursor-pointer px-4 py-2 text-left sg-p-default transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-(--primary-50) font-medium text-(--primary-700)"
                      : "text-(--text-title) hover:bg-(--gray-50)"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-(--primary-600)" />
          </div>
        ) : courses.length === 0 ? (
          <p className="mt-12 text-center sg-p-default text-(--gray-500)">
            No courses in this category yet.
          </p>
        ) : (
          <div className="mt-10 grid lg:gap-5 gap-4 md:mt-12 lg:mt-15 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            href="/course-details-filter"
            data-view-all-btn
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white)"
          >
            View All Courses
            <ArrowRight size={20} strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </section>
  );
}
