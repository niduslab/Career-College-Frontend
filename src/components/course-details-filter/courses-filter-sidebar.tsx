"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Star, X, ListFilter } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import { useCourseCategories } from "@/hooks/use-course-catalog";
import type { CatalogFilterParams, CourseLevel } from "@/lib/course-api";

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({
  title,
  defaultOpen = false,
  badge,
  children,
}: FilterSectionProps & { badge?: number }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="py-3.5 first:pt-0 border-b border-(--gray-200) last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left cursor-pointer group"
      >
        <span className="flex items-center gap-2 text-[15px] font-semibold text-(--text-title)">
          {title}
          {!!badge && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-(--primary-50) px-1.5 text-[11px] font-semibold text-(--primary-700)">
              {badge}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp
            size={18}
            className="text-(--gray-400) group-hover:text-(--gray-600) transition-colors"
          />
        ) : (
          <ChevronDown
            size={18}
            className="text-(--gray-400) group-hover:text-(--gray-600) transition-colors"
          />
        )}
      </button>
      {open && <div className="mt-3 space-y-0.5">{children}</div>}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 -mx-2 transition-colors ${
        checked ? "bg-(--primary-50)" : "hover:bg-(--gray-100)"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? "border-(--primary-700) bg-(--primary-700)"
            : "border-(--gray-300) bg-(--text-white)"
        }`}
      >
        {checked && (
          <svg
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5 fill-none stroke-white stroke-2"
          >
            <path
              d="M2 6l2.5 2.5L10 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className={`text-[13.5px] ${checked ? "font-medium text-(--primary-700)" : "font-normal text-(--gray-600)"}`}
      >
        {label}
      </span>
    </label>
  );
}

function Radio({
  label,
  checked,
  name,
  onChange,
}: {
  label: React.ReactNode;
  checked: boolean;
  name: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 -mx-2 transition-colors ${
        checked ? "bg-(--primary-50)" : "hover:bg-(--gray-100)"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
          checked ? "border-(--primary-700)" : "border-(--gray-300)"
        }`}
      >
        {checked && (
          <span className="h-2 w-2 rounded-full bg-(--primary-700)" />
        )}
      </span>
      <span
        className={`text-[13.5px] ${checked ? "font-medium text-(--primary-700)" : "font-normal text-(--gray-600)"}`}
      >
        {label}
      </span>
    </label>
  );
}

const LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"];
const RATING_OPTIONS = [4.5, 4, 3.5, 3];
const LANGUAGES = ["English", "Bengali"];

interface CoursesFilterSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  desktopVisible?: boolean;
  onDesktopToggle?: () => void;
  filters: CatalogFilterParams;
  onChange: (patch: Partial<CatalogFilterParams>) => void;
}

function SidebarContent({
  filters,
  onChange,
}: {
  filters: CatalogFilterParams;
  onChange: (patch: Partial<CatalogFilterParams>) => void;
}) {
  const { data: categories = [] } = useCourseCategories();
  const [showAllCategories, setShowAllCategories] = useState(false);
  // If the active category (e.g. arrived via a navbar link) sits past the
  // first 6, auto-expand so its checkmark isn't hidden behind "Show more".
  const selectedCategoryIndex = filters.category
    ? categories.findIndex((c) => c.slug === filters.category)
    : -1;
  const categoriesExpanded =
    showAllCategories || selectedCategoryIndex >= 6;
  const visibleCategories = categoriesExpanded
    ? categories
    : categories.slice(0, 6);

  const selectedLevels = filters.level ?? [];
  const selectedLanguages = filters.language ?? [];

  const toggleLevel = (level: CourseLevel) => {
    const next = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];
    onChange({ level: next.length > 0 ? next : undefined });
  };

  const toggleLanguage = (lang: string) => {
    const next = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];
    onChange({ language: next.length > 0 ? next : undefined });
  };

  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.price_type ? 1 : 0) +
    (filters.rating_min ? 1 : 0) +
    selectedLevels.length +
    selectedLanguages.length;

  const clearAll = () =>
    onChange({
      category: undefined,
      price_type: undefined,
      rating_min: undefined,
      level: undefined,
      language: undefined,
    });

  return (
    <div className="rounded-xl border border-(--gray-200) bg-(--text-white) p-4">
      {activeCount > 0 && (
        <div className="flex items-center justify-between pb-3 mb-1 border-b border-(--gray-200)">
          <span className="text-[13px] font-medium text-(--gray-500)">
            {activeCount} filter{activeCount === 1 ? "" : "s"} applied
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="text-[13px] font-semibold text-(--primary-700) cursor-pointer hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Categories — the catalog API takes one category slug at a time, so
          this is single-select even though it's a filter section like the rest. */}
      <FilterSection title="Categories" defaultOpen>
        <div className="flex flex-col">
          <Radio
            name="category"
            label="All Categories"
            checked={!filters.category}
            onChange={() => onChange({ category: undefined })}
          />
          {visibleCategories.map((cat) => (
            <Radio
              key={cat.slug}
              name="category"
              label={cat.name}
              checked={filters.category === cat.slug}
              onChange={() => onChange({ category: cat.slug })}
            />
          ))}
        </div>
        {categories.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllCategories((v) => !v)}
            className="mt-1.5 text-[13px] font-semibold text-(--primary-700) cursor-pointer hover:underline"
          >
            {categoriesExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price" badge={filters.price_type ? 1 : 0}>
        <div className="flex flex-col">
          <Checkbox
            label="Paid"
            checked={filters.price_type === "paid"}
            onChange={(checked) =>
              onChange({ price_type: checked ? "paid" : undefined })
            }
          />
          <Checkbox
            label="Free"
            checked={filters.price_type === "free"}
            onChange={(checked) =>
              onChange({ price_type: checked ? "free" : undefined })
            }
          />
        </div>
      </FilterSection>

      {/* Ratings — real avg_rating filter, "N & up" semantics. */}
      <FilterSection title="Ratings" badge={filters.rating_min ? 1 : 0}>
        <div className="flex flex-col">
          <Radio
            name="rating"
            checked={!filters.rating_min}
            onChange={() => onChange({ rating_min: undefined })}
            label={<span className="text-[13.5px]">Any rating</span>}
          />
          {RATING_OPTIONS.map((stars) => (
            <Radio
              key={stars}
              name="rating"
              checked={filters.rating_min === stars}
              onChange={() => onChange({ rating_min: stars })}
              label={
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={
                        i < Math.floor(stars)
                          ? "fill-[#ffa500] text-[#ffa500]"
                          : "fill-none text-(--gray-300)"
                      }
                    />
                  ))}
                  <span className="ml-1">{stars} & up</span>
                </span>
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* Level */}
      <FilterSection title="Level" badge={selectedLevels.length}>
        <div className="flex flex-col">
          {LEVELS.map((lvl) => (
            <Checkbox
              key={lvl}
              label={lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              checked={selectedLevels.includes(lvl)}
              onChange={() => toggleLevel(lvl)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Language */}
      <FilterSection title="Language" badge={selectedLanguages.length}>
        <div className="flex flex-col">
          {LANGUAGES.map((lang) => (
            <Checkbox
              key={lang}
              label={lang}
              checked={selectedLanguages.includes(lang)}
              onChange={() => toggleLanguage(lang)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

export function CoursesFilterSidebar({
  mobileOpen = false,
  onMobileClose,
  desktopVisible = true,
  onDesktopToggle,
  filters,
  onChange,
}: CoursesFilterSidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Desktop sidebar entrance animation
  useEffect(() => {
    if (!desktopVisible || !sidebarRef.current) return;

    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "opacity,transform",
        },
      );
    }, sidebarRef);

    return () => ctx.revert();
  }, [desktopVisible]);

  // Mobile drawer open / close animation
  useEffect(() => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!drawer || !backdrop || !panel) return;

    prepareGsap();

    if (mobileOpen) {
      gsap.set(drawer, { visibility: "visible" });
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" },
      );
      gsap.fromTo(
        panel,
        { x: "-100%" },
        { x: 0, duration: 0.35, ease: "power2.out" },
      );
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(drawer, { visibility: "hidden" });
        },
      });
      tl.to(panel, {
        x: "-100%",
        duration: 0.3,
        ease: "power2.in",
      }).to(backdrop, { opacity: 0, duration: 0.2 }, "-=0.15");
    }

    return () => {
      gsap.killTweensOf([drawer, backdrop, panel]);
    };
  }, [mobileOpen]);

  const handleClose = () => {
    if (!mobileOpen) return;
    onMobileClose?.();
  };

  return (
    <>
      {/* Desktop sidebar — only rendered when visible */}
      {desktopVisible && (
        <aside
          ref={sidebarRef}
          className="hidden shrink-0 lg:block lg:w-64 xl:w-72"
        >
          <button
            type="button"
            onClick={onDesktopToggle}
            className="mb-4 inline-flex w-full items-center cursor-pointer  justify-center gap-2 rounded-lg border border-(--gray-200)    h-10 text-[16px] font-medium text-(--text-paragraph) hover:border-(--gray-300) transition-colors"
          >
            <ListFilter size={16} />
            Hide Filters
          </button>

          <SidebarContent filters={filters} onChange={onChange} />
        </aside>
      )}

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-0 z-50 lg:hidden"
        style={{ visibility: mobileOpen ? "visible" : "hidden" }}
      >
        <div
          ref={backdropRef}
          className="absolute inset-0 bg-black/40"
          onClick={handleClose}
          aria-hidden="true"
        />

        <div
          ref={panelRef}
          className="absolute left-0 top-0 h-full w-80 max-w-[90vw] overflow-y-auto bg-(--gray-50) shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-(--gray-200) bg-(--text-white) px-5 py-4">
            <span className="inline-flex items-center gap-2 text-[16px] font-medium text-(--text-paragraph)">
              <ListFilter size={16} />
              Filters
            </span>
            <button
              type="button"
              aria-label="Close filters"
              onClick={handleClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--gray-500) hover:bg-(--gray-100)"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4">
            <SidebarContent filters={filters} onChange={onChange} />
          </div>
        </div>
      </div>
    </>
  );
}
