"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Star, X, ListFilter } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({
  title,
  defaultOpen = false,
  children,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[16px] lg:text-[20px] font-medium text-[#12100e]">
          {title}
        </span>
        {open ? (
          <ChevronUp size={24} className="text-[#100d14] cursor-pointer" />
        ) : (
          <ChevronDown size={24} className="text-[#100d14] cursor-pointer" />
        )}
      </button>
      <div className="border-[0.5px] border-gray-200 mt-3 mb-3"></div>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Checkbox({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked((v) => !v)}
        className="h-4 w-4 rounded border-(--gray-500) accent-(--primary-700) cursor-pointer"
      />
      <span className="text-[14px] text-[#4d4c44] font-normal">{label}</span>
    </label>
  );
}

const CATEGORIES = [
  "Artificial Intelligence",
  "Design",
  "Web Development",
  "Digital Marketing",
  "Data Science & AI",
  "Business",
  "Finance & Accounting",
  "Personal Development",
];

const RATINGS = [
  { stars: 5, label: "5.0" },
  { stars: 4.5, label: "4.5 & up" },
  { stars: 4, label: "4.0 & up" },
  { stars: 3.5, label: "3.5 & up" },
  { stars: 3, label: "3.0 & up" },
];

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

const DURATIONS = [
  "Less than 2 hours",
  "1–4 Weeks",
  "1–3 Months",
  "3–6 Months",
  "6–12 Months",
  "1–3 Years",
];

const LANGUAGES = ["English", "Bengali"];

interface CoursesFilterSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  desktopVisible?: boolean;
  onDesktopToggle?: () => void;
}

function SidebarContent() {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategories = showAllCategories
    ? CATEGORIES
    : CATEGORIES.slice(0, 6);

  return (
    <div className="rounded-lg border border-(--gray-200) bg-(--gray-50) p-5 ">
      {/* Categories — open by default */}
      <FilterSection title="Categories" defaultOpen={true}>
        <div className="flex flex-col">
          {visibleCategories.map((cat) => (
            <Checkbox key={cat} label={cat} />
          ))}
        </div>
        {CATEGORIES.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllCategories((v) => !v)}
            className="mt-2 lg:mb-6 mb-4 text-[14px] font-semibold text-(--primary-700) cursor-pointer hover:underline"
          >
            {showAllCategories ? "Show less" : "Show more"}
          </button>
        )}
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        <div className="flex flex-col">
          <Checkbox label="Paid (12,000)" />
          <Checkbox label="Free (1,650)" />
        </div>
      </FilterSection>

      {/* Ratings */}
      <FilterSection title="Ratings">
        <div className="flex flex-col gap-0.5">
          {RATINGS.map(({ stars, label }) => (
            <label
              key={label}
              className="flex cursor-pointer items-center gap-2.5 py-1"
            >
              <input
                type="radio"
                name="rating"
                className="h-4 w-4 border-(--gray-500) accent-(--primary-700) cursor-pointer"
              />
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
                <span className="ml-1 text-[13px] text-(--text-paragraph)">
                  {label}
                </span>
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Level */}
      <FilterSection title="Level">
        <div className="flex flex-col">
          {LEVELS.map((lvl) => (
            <Checkbox key={lvl} label={lvl} />
          ))}
        </div>
      </FilterSection>

      {/* Video Duration */}
      <FilterSection title="Video Duration">
        <div className="flex flex-col">
          {DURATIONS.map((d) => (
            <Checkbox key={d} label={d} />
          ))}
        </div>
      </FilterSection>

      {/* Language */}
      <FilterSection title="Language">
        <div className="flex flex-col">
          {LANGUAGES.map((lang) => (
            <Checkbox key={lang} label={lang} />
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
      // Open: show drawer, then animate backdrop + panel
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
      // Close: animate panel + backdrop, then hide drawer
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
            Filter &amp; Sort
          </button>

          <SidebarContent />
        </aside>
      )}

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-0 z-50 lg:hidden"
        style={{ visibility: mobileOpen ? "visible" : "hidden" }}
      >
        {/* Backdrop */}
        <div
          ref={backdropRef}
          className="absolute inset-0 bg-black/40"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <div
          ref={panelRef}
          className="absolute left-0 top-0 h-full w-80 max-w-[90vw] overflow-y-auto bg-(--gray-50) shadow-xl"
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-(--gray-200) bg-(--text-white) px-5 py-4">
            <span className="inline-flex cursor-pointer items-center gap-2 text-[16px] font-medium text-(--text-paragraph)">
              <ListFilter size={16} />
              Filter &amp; Sort
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
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
}
