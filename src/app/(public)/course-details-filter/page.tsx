"use client";

import { useState } from "react";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { CoursesFilterSidebar } from "@/components/course-details-filter/courses-filter-sidebar";
import { CoursesFilterGrid } from "@/components/course-details-filter/courses-filter-grid";
import { DreamCareerCta } from "@/components/common/dream-career-cta";
import type { CatalogFilterParams } from "@/lib/course-api";

export default function CourseDetailsFilterPage() {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Lifted here so the sidebar (writes) and grid (reads + pagination/sort)
  // share one source of truth instead of duplicating filter state.
  const [filters, setFilters] = useState<CatalogFilterParams>({});
  const [page, setPage] = useState(1);

  const updateFilters = (patch: Partial<CatalogFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
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
