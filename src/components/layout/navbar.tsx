"use client";

import Link from "next/link";
import { Menu, Search, Sparkles, X, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const NAV_LINKS = [
  { label: "Categories", href: "#" },
  { label: "Courses", href: "#" },
  { label: "Become an Instructor", href: "#" },
];

const CATEGORY_DROPDOWN = [
  { label: "Development", href: "#" },
  { label: "Design", href: "#" },
  { label: "Business", href: "#" },
  { label: "Marketing", href: "#" },
];

const COURSES_DROPDOWN = [
  { label: "Frontend Masterclass", href: "#" },
  { label: "Data Analytics Bootcamp", href: "#" },
  { label: "UI/UX Professional", href: "#" },
  { label: "Digital Marketing Pro", href: "#" },
];

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<
    "categories" | "courses" | null
  >(null);
  const searchBorderRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
    setMobileDropdown(null);
  };

  useEffect(() => {
    const desktopBorder = searchBorderRefs.current[0];
    const mobileBorder = searchBorderRefs.current[1];
    const animations: gsap.core.Tween[] = [];

    if (desktopBorder) {
      animations.push(
        gsap.to(desktopBorder, {
          backgroundPosition: "200% 50%",
          duration: 3,
          ease: "none",
          repeat: -1,
        }),
      );
    }

    if (mobileBorder) {
      animations.push(
        gsap.to(mobileBorder, {
          backgroundPosition: "200% 50%",
          duration: 4.8,
          ease: "none",
          repeat: -1,
        }),
      );
    }

    return () => {
      animations.forEach((animation) => animation.kill());
    };
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobileOpen || !mobilePanelRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-mobile-stagger]",
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.08,
          ease: "power2.out",
        },
      );
    }, mobilePanelRef);

    return () => {
      ctx.revert();
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMobileOpen(false);
        setMobileDropdown(null);
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-[border-color,box-shadow,background-color,backdrop-filter] duration-300 ${
        isScrolled
          ? "border-(--gray-200) bg-(--text-white)/95 shadow-[0_8px_24px_rgba(16,24,40,0.08)] backdrop-blur-md"
          : "border-(--gray-200) bg-(--text-white)"
      }`}
    >
      <div className="mx-auto flex h-18 w-full max-w-310 items-center lg:gap-10 gap-6  px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="sg-h5 shrink-0 font-semibold tracking-tight text-(--primary-700) transition-colors"
        >
          Career College
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          <div className="group relative">
            <Link
              href={NAV_LINKS[0].href}
              className="inline-flex items-center gap-1 sg-p-default font-medium text-(--text-title) transition-colors hover:text-(--primary-700)"
            >
              {NAV_LINKS[0].label}
              <ChevronDown size={16} strokeWidth={2.2} />
            </Link>
            <div className="invisible absolute  left-0 top-full z-30 mt-3 min-w-52 translate-y-1 rounded-2xl border border-(--gray-200) bg-(--text-white) p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {CATEGORY_DROPDOWN.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm text-(--text-title) transition-colors hover:bg-(--primary-50) hover:text-(--primary-700)"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="group relative">
            <Link
              href={NAV_LINKS[1].href}
              className="inline-flex items-center gap-1 sg-p-default  font-medium text-(--text-title) transition-colors hover:text-(--primary-700)"
            >
              {NAV_LINKS[1].label}
              <ChevronDown size={16} strokeWidth={2.2} />
            </Link>
            <div className="invisible absolute left-0 top-full z-30 mt-3 min-w-56 translate-y-1 rounded-2xl border border-(--gray-200) bg-(--text-white) p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {COURSES_DROPDOWN.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm text-(--text-title) transition-colors hover:bg-(--primary-50) hover:text-(--primary-700)"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href={NAV_LINKS[2].href}
            className="inline-flex whitespace-nowrap sg-p-default font-medium text-(--text-title) transition-colors hover:text-(--primary-700)"
          >
            {NAV_LINKS[2].label}
          </Link>
        </nav>

        <div className="ml-auto hidden min-w-75 max-w-90 flex-1 items-center xl:flex xl:min-w-95 xl:max-w-95">
          <div
            ref={(el) => {
              searchBorderRefs.current[0] = el;
            }}
            className="search-gradient-border h-11 w-full rounded-[100px] p-px"
          >
            <div
              className="flex h-full w-full items-center rounded-[100px] px-4"
              style={{ background: "var(--Color-Primary-Color-50, #F5F2FF)" }}
            >
              <Sparkles
                size={16}
                className="mr-2 shrink-0 text-(--primary-500)"
                strokeWidth={2.2}
              />
              <input
                type="text"
                placeholder="Search any course here"
                className="w-full bg-transparent text-sm text-(--text-title) outline-none placeholder:text-(--gray-500)"
                aria-label="Search courses"
              />
              <Search
                size={17}
                className="ml-2 shrink-0 text-(--gray-500)"
                strokeWidth={2.2}
              />
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          <button
            type="button"
            className="h-10 cursor-pointer shrink-0 whitespace-nowrap rounded-md border border-(--primary-700) px-5 sg-p-default font-semibold text-(--primary-700) transition-colors hover:bg-(--primary-50)"
          >
            Login
          </button>
          <button
            type="button"
            className="h-10 cursor-pointer shrink-0 whitespace-nowrap rounded-md bg-(--primary-700) px-5 sg-p-default font-semibold text-(--text-white) transition-colors hover:bg-(--primary-700)"
          >
            Sign Up
          </button>
        </div>

        <button
          type="button"
          className="relative ml-auto inline-flex h-10 w-10 cursor-pointer touch-manipulation items-center justify-center rounded-md border border-(--gray-300) text-(--text-title) transition-colors duration-200 active:bg-(--gray-50) xl:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isMobileOpen}
          onPointerUp={(event) => {
            event.preventDefault();
            toggleMobileMenu();
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") {
              return;
            }

            event.preventDefault();
            toggleMobileMenu();
          }}
        >
          <span
            className={`pointer-events-none absolute transition-all duration-300 ${
              isMobileOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
          >
            <Menu size={20} />
          </span>
          <span
            className={`pointer-events-none absolute transition-all duration-300 ${
              isMobileOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
            }`}
          >
            <X size={20} />
          </span>
        </button>
      </div>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out xl:hidden ${
          isMobileOpen
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 border-t border-(--gray-200) bg-(--text-white)">
          <div ref={mobilePanelRef} className="mx-auto max-w-155 px-4 py-4">
            <div
              ref={(el) => {
                searchBorderRefs.current[1] = el;
              }}
              data-mobile-stagger
              className="search-gradient-border mx-auto mb-4 h-11 w-full max-w-140 rounded-[100px] p-px"
            >
              <div
                className="flex h-full items-center rounded-[100px] px-4"
                style={{ background: "var(--Color-Primary-Color-50, #F5F2FF)" }}
              >
                <Sparkles
                  size={16}
                  className="mr-2 shrink-0 text-(--primary-500)"
                  strokeWidth={2.2}
                />
                <input
                  type="text"
                  placeholder="Search any course here"
                  className="w-full bg-transparent text-sm text-(--text-title) outline-none placeholder:text-(--gray-500)"
                  aria-label="Search courses"
                />
                <Search
                  size={17}
                  className="ml-2 shrink-0 text-(--gray-500)"
                  strokeWidth={2.2}
                />
              </div>
            </div>

            <nav data-mobile-stagger className="flex flex-col gap-3">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-between text-[15px] font-medium text-(--text-title) transition-colors hover:text-(--primary-700)"
                onClick={() =>
                  setMobileDropdown((prev) =>
                    prev === "categories" ? null : "categories",
                  )
                }
              >
                {NAV_LINKS[0].label}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileDropdown === "categories" ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              <div
                className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                  mobileDropdown === "categories"
                    ? "mt-1 grid-rows-[1fr] opacity-100"
                    : "mt-0 grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0">
                  <div className="rounded-xl border border-(--gray-200) p-2">
                    {CATEGORY_DROPDOWN.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-sm text-(--text-title) hover:bg-(--primary-50) hover:text-(--primary-700)"
                        onClick={() => {
                          setIsMobileOpen(false);
                          setMobileDropdown(null);
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-between text-[15px] font-medium text-(--text-title) transition-colors hover:text-(--primary-700)"
                onClick={() =>
                  setMobileDropdown((prev) =>
                    prev === "courses" ? null : "courses",
                  )
                }
              >
                {NAV_LINKS[1].label}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileDropdown === "courses" ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              <div
                className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                  mobileDropdown === "courses"
                    ? "mt-1 grid-rows-[1fr] opacity-100"
                    : "mt-0 grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0">
                  <div className="rounded-xl border border-(--gray-200) p-2">
                    {COURSES_DROPDOWN.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-sm text-(--text-title) hover:bg-(--primary-50) hover:text-(--primary-700)"
                        onClick={() => {
                          setIsMobileOpen(false);
                          setMobileDropdown(null);
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href={NAV_LINKS[2].href}
                className="text-[15px] font-medium text-(--text-title) transition-colors hover:text-(--primary-700)"
                onClick={() => {
                  setIsMobileOpen(false);
                  setMobileDropdown(null);
                }}
              >
                {NAV_LINKS[2].label}
              </Link>
            </nav>

            <div
              data-mobile-stagger
              className="mt-4 flex flex-wrap items-center justify-start gap-3"
            >
              <button
                type="button"
                className="h-10 min-w-35 rounded-md border border-(--primary-500) px-8 text-sm font-semibold text-(--primary-600) transition-colors hover:bg-(--primary-50) sm:min-w-42"
              >
                Login
              </button>
              <button
                type="button"
                className="h-10 min-w-35 rounded-md bg-(--primary-600) px-8 text-sm font-semibold text-(--text-white) transition-colors hover:bg-(--primary-700) sm:min-w-42"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
