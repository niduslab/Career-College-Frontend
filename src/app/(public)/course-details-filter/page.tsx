"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { CoursesFilterSidebar } from "@/components/course-details-filter/courses-filter-sidebar";
import { CoursesFilterGrid } from "@/components/course-details-filter/courses-filter-grid";
import { DreamCareerCta } from "@/components/common/dream-career-cta";
import type {
  CatalogFilterParams,
  CatalogSort,
  CourseLevel,
} from "@/lib/course-api";

/** The URL is the single source of truth for the filter set, so these two
 *  functions must stay exact inverses — a field written by
 *  searchStringFromFilters but not read back here is silently dropped on the
 *  next render. */
function filtersFromSearchParams(
  searchParams: URLSearchParams | ReturnType<typeof useSearchParams>,
): CatalogFilterParams {
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const priceType = searchParams.get("price_type");
  const ratingMin = Number(searchParams.get("rating_min"));
  const sort = searchParams.get("sort");
  const level = searchParams.getAll("level") as CourseLevel[];
  const language = searchParams.getAll("language");
  return {
    ...(category ? { category } : {}),
    ...(search ? { search } : {}),
    ...(priceType === "free" || priceType === "paid"
      ? { price_type: priceType }
      : {}),
    ...(Number.isFinite(ratingMin) && ratingMin > 0
      ? { rating_min: ratingMin }
      : {}),
    ...(sort ? { sort: sort as CatalogSort } : {}),
    ...(level.length > 0 ? { level } : {}),
    ...(language.length > 0 ? { language } : {}),
  };
}

function searchStringFromFilters(filters: CatalogFilterParams): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.price_type) params.set("price_type", filters.price_type);
  if (filters.rating_min) params.set("rating_min", String(filters.rating_min));
  if (filters.sort) params.set("sort", filters.sort);
  filters.level?.forEach((l) => params.append("level", l));
  filters.language?.forEach((l) => params.append("language", l));
  return params.toString();
}

function CourseDetailsFilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Derived from the URL rather than mirrored into state, so the sidebar
  // (writes) and grid (reads) share one source of truth and a navbar link
  // click — a client-side nav that keeps this component mounted — re-filters
  // on the spot with no effect needed to re-sync.
  const filters = filtersFromSearchParams(searchParams);
  // Paging lives in the URL too so it resets to 1 whenever the filters
  // change, without an effect watching them.
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const pushSearchString = (next: string) =>
    router.replace(next ? `?${next}` : "?", { scroll: false });

  const updateFilters = (patch: Partial<CatalogFilterParams>) =>
    // No `page` in the string: any filter change drops back to page 1.
    pushSearchString(searchStringFromFilters({ ...filters, ...patch }));

  const changePage = (next: number) => {
    const params = new URLSearchParams(searchStringFromFilters(filters));
    if (next > 1) params.set("page", String(next));
    pushSearchString(params.toString());
  };

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <CoursesFilterSidebar
        mobileOpen={mobileFilterOpen}
        onMobileClose={() => setMobileFilterOpen(false)}
        desktopVisible={sidebarVisible}
        onDesktopToggle={() => setSidebarVisible((v) => !v)}
        filters={filters}
        onChange={updateFilters}
      />
      <CoursesFilterGrid
        onFilterOpen={() => setMobileFilterOpen(true)}
        onDesktopToggle={() => setSidebarVisible((v) => !v)}
        sidebarVisible={sidebarVisible}
        filters={filters}
        onSortChange={(sort) => updateFilters({ sort })}
        page={page}
        onPageChange={changePage}
      />
    </div>
  );
}

export default function CourseDetailsFilterPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Find the Perfect Course for Your Career Goals"
        subtitle="Explore a wide range of expertly crafted courses and easily filter them based on your preferences."
        items={[
          { label: "Home", href: "/" },
          { label: "Courses", active: true },
        ]}
      />

      <section className="w-full bg-(--gray-50) py-12 md:py-16 lg:py-25">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
          {/* useSearchParams() opts the subtree out of prerendering, so it
              needs its own boundary — otherwise the whole page bails and the
              production build fails. */}
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <CourseDetailsFilterContent />
          </Suspense>
        </div>
      </section>
      <DreamCareerCta />
    </div>
  );
}
