"use client";

import { useState } from "react";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { CoursesFilterSidebar } from "@/components/course-details-filter/courses-filter-sidebar";
import { CoursesFilterGrid } from "@/components/course-details-filter/courses-filter-grid";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function CourseDetailsFilterPage() {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

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
            />
            <CoursesFilterGrid
              onFilterOpen={() => setMobileFilterOpen(true)}
              onDesktopToggle={() => setSidebarVisible((v) => !v)}
              sidebarVisible={sidebarVisible}
            />
          </div>
        </div>
      </section>
      <DreamCareerCta />
    </div>
  );
}
