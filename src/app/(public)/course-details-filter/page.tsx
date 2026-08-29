"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { CoursesFilterSidebar } from "@/components/course-details-filter/courses-filter-sidebar";
import { CoursesFilterGrid } from "@/components/course-details-filter/courses-filter-grid";
import { DreamCareerCta } from "@/components/common/dream-career-cta";
import type { CatalogFilterParams } from "@/lib/course-api";

function filtersFromSearchParams(
  searchParams: URLSearchParams | ReturnType<typeof useSearchParams>,
): CatalogFilterParams {
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  return {
    ...(category ? { category } : {}),
    ...(search ? { search } : {}),
  };
}

/** Mirrors `filters` into the URL so a selection survives refresh/back-nav
 *  and stays a shareable link — same fields filtersFromSearchParams reads. */
function searchStringFromFilters(filters: CatalogFilterParams): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  return params.toString();
}

export default function CourseDetailsFilterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Lifted here so the sidebar (writes) and grid (reads + pagination/sort)
  // share one source of truth instead of duplicating filter state.
  // Seeded from ?category=/?search= so a link from the navbar (or anywhere
  // else) lands here pre-filtered. Next's <Link> does a client-side
  // navigation that keeps this component mounted, so the useState
  // initializer alone (which only runs on first mount) isn't enough —
  // clicking a second navbar category link while already on this page left
  // the old category selected. The effect below re-syncs on every URL change.
  const [filters, setFilters] = useState<CatalogFilterParams>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [page, setPage] = useState(1);
  const lastSearchString = useRef(searchParams.toString());

  useEffect(() => {
    const next = searchParams.toString();
    if (next === lastSearchString.current) return;
    lastSearchString.current = next;
    setFilters(filtersFromSearchParams(searchParams));
    setPage(1);
  }, [searchParams]);

  const updateFilters = (patch: Partial<CatalogFilterParams>) => {
    const next = { ...filters, ...patch };
    const nextSearchString = searchStringFromFilters(next);
    // Keep the ref in sync before pushing — otherwise the URL-change effect
    // above sees its own update and immediately re-syncs `filters` from a
    // URL that's one render behind. router.replace is a side effect, so it
    // must run in the event handler, not inside the setFilters updater.
    lastSearchString.current = nextSearchString;
    router.replace(nextSearchString ? `?${nextSearchString}` : "?", {
      scroll: false,
    });
    setFilters(next);
    setPage(1);
  };

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
              onPageChange={setPage}
            />
          </div>
        </div>
      </section>
      <DreamCareerCta />
    </div>
  );
}
