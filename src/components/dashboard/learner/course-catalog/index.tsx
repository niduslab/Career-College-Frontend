"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Clock,
  TrendingUp,
  Heart,
  Sparkles,
  ChevronDown,
  Search,
} from "lucide-react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/common/pagination";
import {
  useCourseCatalog,
  useCourseCategories,
  useMyCourses,
  ALL_ENROLLMENTS_PAGE_SIZE,
  useEnrollInCourse,
  useUnenrollFromCourse,
} from "@/hooks/use-course-catalog";
import { useCreateCheckoutSession } from "@/hooks/use-payments";
import { useToggleWishlist } from "@/hooks/use-wishlist";
import type {
  CatalogCourse,
  CatalogSort,
  CourseCategory,
} from "@/lib/course-api";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const SORT_OPTIONS: { label: string; value: CatalogSort }[] = [
  { label: "Most popular", value: "popularity" },
  { label: "Newest", value: "newest" },
  { label: "Highest rated", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
];

const PAGE_SIZE = 6;

const LEVEL_COLOR: Record<string, string> = {
  beginner: "text-emerald-600 bg-emerald-50",
  intermediate: "text-amber-600 bg-amber-50",
  advanced: "text-rose-600 bg-rose-50",
};

function flattenCategories(
  categories: CourseCategory[],
): { label: string; slug: string; depth: number }[] {
  const flat: { label: string; slug: string; depth: number }[] = [];
  for (const c of categories) {
    flat.push({ label: c.name, slug: c.slug, depth: 0 });
    for (const child of c.children)
      flat.push({ label: child.name, slug: child.slug, depth: 1 });
  }
  return flat;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "—";
  const hours = minutes / 60;
  return hours >= 1 ? `${Math.round(hours * 10) / 10}h` : `${minutes}m`;
}

function CourseCard({
  course,
  isEnrolled,
  onEnrollChange,
  isPriority,
}: {
  course: CatalogCourse;
  isEnrolled: boolean;
  onEnrollChange: (slug: string, enrolled: boolean) => void;
  isPriority?: boolean;
}) {
  const [wished, setWished] = useState(false);
  const instructor = course.instructors[0];
  const price = Number(course.price);
  const isFree = price <= 0;
  const levelLabel =
    course.level.charAt(0).toUpperCase() + course.level.slice(1);
  const thumbnail = thumbnailFailed ? null : mediaUrl(course.thumbnail);
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useUnenrollFromCourse();
  const checkoutMutation = useCreateCheckoutSession();
  const wishlistMutation = useToggleWishlist();

  // `is_wishlisted` comes from the server, patched optimistically by the
  // mutation — so the heart stays instant without holding its own state.
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

  const startCheckout = () => {
    checkoutMutation.mutate(
      { course_slug: course.slug },
      {
        onSuccess: (session) => {
          window.location.href = session.gateway_url;
        },
        onError: (err) => {
          notify.error(
            err instanceof ApiError ? err.message : "Failed to start checkout.",
          );
        },
      },
    );
  };

  const handleEnroll = () => {
    enrollMutation.mutate(course.slug, {
      onSuccess: (res) => {
        onEnrollChange(course.slug, true);
        notify.success(res.message ?? "Enrolled successfully.");
      },
      onError: (err) => {
        if (!isFree && err instanceof ApiError && err.status === 422) {
          startCheckout();
          return;
        }
        notify.error(
          err instanceof ApiError ? err.message : "Failed to enroll.",
        );
      },
    });
  };

  const handleUnenroll = () => {
    unenrollMutation.mutate(course.slug, {
      onSuccess: (res) => {
        onEnrollChange(course.slug, false);
        notify.success(res.message ?? "Unenrolled successfully.");
      },
      onError: (err) => {
        notify.error(
          err instanceof ApiError ? err.message : "Failed to unenroll.",
        );
      },
    });
  };

  return (
    <div className="course-card opacity-0 bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden shrink-0 bg-(--gray-50)">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setThumbnailFailed(true)}
            priority={isPriority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--gray-300) text-[12px]">
            No image
          </div>
        )}
        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistMutation.isPending}
          title={
            course.is_wishlisted ? "Remove from wishlist" : "Save for later"
          }
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer shadow-sm disabled:cursor-not-allowed"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${course.is_wishlisted ? "fill-rose-500 text-rose-500" : "text-(--gray-500)"}`}
          />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <h3 className="text-[14px] font-semibold text-(--text-title) leading-snug mb-3 line-clamp-2 flex-1">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] text-(--gray-500) truncate">
            {instructor?.full_name ?? "Career College"}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <Clock className="w-4 h-4 shrink-0" />
            {formatDuration(course.duration_minutes)}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <TrendingUp className="w-4 h-4 shrink-0" />
            {levelLabel}
          </span>
          <span
            className={`text-[12px] font-medium px-2 py-0.5 rounded-full ml-auto ${LEVEL_COLOR[course.level]}`}
          >
            {levelLabel}
          </span>
        </div>

        {/* Price + Enroll */}
        <div className="flex items-center justify-between pt-3 border-t border-(--gray-100)">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[18px] font-bold text-(--text-title)">
              {price > 0 ? `BDT ${price.toFixed(2)}` : "Free"}
            </span>
          </div>
          {isEnrolled ? (
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-emerald-600">
                Enrolled
              </span>
              <button
                onClick={handleUnenroll}
                disabled={unenrollMutation.isPending}
                className="px-3 py-1.5 rounded-md bg-white hover:bg-rose-50 text-rose-600 text-[13px] font-semibold transition-colors cursor-pointer border border-rose-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {unenrollMutation.isPending ? "Unenrolling..." : "Unenroll"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrollMutation.isPending || checkoutMutation.isPending}
              className="px-4 py-1.5 rounded-md bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-600) text-[14px] font-semibold transition-colors cursor-pointer border border-(--primary-100) disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkoutMutation.isPending
                ? "Redirecting..."
                : enrollMutation.isPending
                  ? "Enrolling..."
                  : "Enroll"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourseCatalogPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<CatalogSort>("popularity");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const headerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce free-text search before it hits the API.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Close either dropdown on an outside click.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setCategoryOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(target)
      ) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: categoriesData } = useCourseCategories();
  const categoryOptions = useMemo(
    () => flattenCategories(categoriesData ?? []),
    [categoriesData],
  );

  // Needs every enrollment, not the first page — otherwise catalog cards
  // past the 10th enrollment render as "not enrolled".
  const { data: myCoursesData } = useMyCourses({
    page_size: ALL_ENROLLMENTS_PAGE_SIZE,
  });
  const [enrollOverrides, setEnrollOverrides] = useState<
    Record<string, boolean>
  >({});
  const enrolledSlugs = useMemo(() => {
    const set = new Set(
      (myCoursesData?.results ?? []).map((e) => e.course.slug),
    );
    for (const [slug, enrolled] of Object.entries(enrollOverrides)) {
      if (enrolled) set.add(slug);
      else set.delete(slug);
    }
    return set;
  }, [myCoursesData, enrollOverrides]);

  const handleEnrollChange = (slug: string, enrolled: boolean) => {
    setEnrollOverrides((prev) => ({ ...prev, [slug]: enrolled }));
  };

  const { data, isLoading, isError } = useCourseCatalog({
    category: activeCategory === "All" ? undefined : activeCategory,
    search: search || undefined,
    sort,
    page: currentPage,
    page_size: PAGE_SIZE,
  });

  const courses = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Most popular";
  const activeCategoryLabel =
    activeCategory === "All"
      ? "All"
      : (categoryOptions.find((c) => c.slug === activeCategory)?.label ??
        activeCategory);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4 },
    ).fromTo(
      bannerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35 },
      "-=0.2",
    );
  }, []);

  // Animate cards when page/filter changes
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll(".course-card"));
    if (cards.length === 0) return;
    gsap.killTweensOf(cards);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power3.out" },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [activeCategory, search, sort, currentPage, courses.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
          Course Catalog
        </h1>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-1">
          Explore 240+ expert-led courses across AI, Data, and Design.
        </p>
      </div>

      {/* AI banner */}
      <div
        ref={bannerRef}
        className="opacity-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-(--primary-50) border border-(--primary-100) rounded-2xl px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--primary-600) flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-(--text-title)">
              Not sure where to start?
            </p>
            <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
              Let the AI advisor recommend a course based on your goals and
              current skills.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/learner/ai-assistant")}
          className="flex items-center h-12 gap-2 px-5 py-2.5 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[12px] md:text-[14px] lg:text-[14px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          Get AI recommendation
        </button>
      </div>

      {/* Filters + sort row */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Category dropdown */}
        <div ref={categoryDropdownRef} className="relative shrink-0">
          <button
            onClick={() => setCategoryOpen((v) => !v)}
            className="flex items-center gap-1.5 h-11 px-3.5 rounded-md border border-(--gray-200) bg-white text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) font-normal hover:border-(--primary-300) transition-colors cursor-pointer whitespace-nowrap"
          >
            Category: {activeCategoryLabel}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
            />
          </button>
          {categoryOpen && (
            <div className="absolute left-0 top-12 z-20 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1.5 w-56 max-h-80 overflow-y-auto">
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setCategoryOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2 text-[12px] md:text-[14px] lg:text-[14px] hover:bg-(--gray-50) transition-colors cursor-pointer ${activeCategory === "All" ? "font-semibold text-(--primary-600)" : "text-(--text-title)"}`}
              >
                All
              </button>
              {categoryOptions.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    setActiveCategory(cat.slug);
                    setCategoryOpen(false);
                    setCurrentPage(1);
                  }}
                  style={{ paddingLeft: `${16 + cat.depth * 16}px` }}
                  className={`w-full text-left py-2 pr-4 text-[12px] md:text-[14px] lg:text-[14px] hover:bg-(--gray-50) transition-colors cursor-pointer ${activeCategory === cat.slug ? "font-semibold text-(--primary-600)" : "text-(--text-title)"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search + sort — own row on <xl, inline on xl+ */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 xl:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
            <input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search courses..."
              className="w-full sm:w-56 xl:w-56 pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
            />
          </div>
          <div ref={sortDropdownRef} className="relative shrink-0">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 h-11 px-3.5 rounded-md border border-(--gray-200) bg-white text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) font-normal hover:border-(--primary-300) transition-colors cursor-pointer whitespace-nowrap"
            >
              Sort: {sortLabel}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-12 z-20 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1.5 w-48">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setSortOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-[12px] md:text-[14px] lg:text-[14px] hover:bg-(--gray-50) transition-colors cursor-pointer ${sort === opt.value ? "font-semibold text-(--primary-600)" : "text-(--text-title)"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {data?.count ?? 0}
        </span>{" "}
        courses
        {activeCategory !== "All" && (
          <>
            {" "}
            in{" "}
            <span className="font-semibold text-(--primary-600)">
              {activeCategoryLabel}
            </span>
          </>
        )}
      </p>

      {/* Grid */}
      {isError ? (
        <div className="py-16 text-center text-(--gray-400)">
          <p className="text-[16px] font-medium text-rose-500">
            Failed to load courses
          </p>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] mt-1">
            Please try again in a moment.
          </p>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
        >
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="h-85 rounded-2xl border border-(--gray-200) bg-(--gray-50) animate-pulse"
                />
              ))
            : courses.map((course, i) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledSlugs.has(course.slug)}
                  onEnrollChange={handleEnrollChange}
                  isPriority={i === 0}
                />
              ))}
          {!isLoading && courses.length === 0 && (
            <div className="col-span-full py-16 text-center text-(--gray-400)">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-[16px] font-medium">No courses found</p>
              <p className="text-[12px] md:text-[14px] lg:text-[14px] mt-1">
                Try a different keyword or category
              </p>
            </div>
          )}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
