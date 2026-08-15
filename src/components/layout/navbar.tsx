"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Search,
  Sparkles,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useAuth } from "@/lib/use-auth";
import { dashboardPathFor } from "@/lib/auth-api";
import logo from "@/assets/images/logo/career-college-logo.webp";

const NAV_LINKS = [
  { label: "Categories", href: "#" },
  { label: "Courses", href: "#" },
  { label: "Become an Instructor", href: "/become-instructor" },
];

const CATEGORY_DROPDOWN = [
  { label: "Artificial Intelligence", href: "#" },
  { label: "UI/UX Design", href: "#" },
  { label: "Marketing", href: "#" },
  { label: "IT & Software", href: "#" },
  { label: "Business", href: "#" },
];

const COURSES_DROPDOWN = [
  { label: "Frontend Masterclass", href: "#" },
  { label: "Data Analytics Bootcamp", href: "#" },
  { label: "UI/UX Professional", href: "#" },
  { label: "Digital Marketing Pro", href: "#" },
];

export function Navbar() {
  const { authed, user, logout } = useAuth({ withUser: true });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<
    "categories" | "courses" | null
  >(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchBorderRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const dashboardHref = user ? dashboardPathFor(user) : "/dashboard/learner";
  const displayName = user?.full_name?.trim() || "";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

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

  useEffect(() => {
    if (!isProfileOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsProfileOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isProfileOpen]);

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
          className="flex shrink-0 items-center gap-1.5 sg-h5 font-semibold tracking-tight text-(--primary-700) transition-colors"
        >
          <Image
            src={logo}
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
            priority
          />
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
                autoComplete="off"
                suppressHydrationWarning
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
          {authed ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-(--gray-200) pl-1 pr-3 transition-colors hover:border-(--primary-300)"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--primary-700) text-xs font-semibold text-(--text-white)">
                  {initials}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                  className={`text-(--text-title) transition-transform ${
                    isProfileOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              <div
                role="menu"
                className={`absolute right-0 top-full z-30 mt-3 min-w-52 origin-top-right rounded-2xl border border-(--gray-200) bg-(--text-white) p-2 shadow-lg transition-all duration-150 ${
                  isProfileOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-1 opacity-0"
                }`}
              >
                {displayName && (
                  <div className="truncate px-3 py-2 text-sm font-medium text-(--text-title)">
                    {displayName}
                  </div>
                )}
                <Link
                  href={dashboardHref}
                  role="menuitem"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-(--text-title) transition-colors hover:bg-(--primary-50) hover:text-(--primary-700)"
                >
                  <LayoutDashboard size={16} strokeWidth={2.2} />
                  Dashboard
                </Link>
                <div className="my-1 h-px bg-(--gray-200)" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-(--primary-700) transition-colors hover:bg-(--primary-50)"
                >
                  <LogOut size={16} strokeWidth={2.2} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="h-10 cursor-pointer shrink-0 whitespace-nowrap rounded-md border border-(--primary-700) px-5 sg-p-default font-semibold text-(--primary-700) transition-colors hover:bg-(--primary-50) inline-flex items-center justify-center"
                suppressHydrationWarning
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="h-10 cursor-pointer shrink-0 whitespace-nowrap rounded-md bg-(--primary-700) px-5 sg-p-default font-semibold text-(--text-white) transition-colors hover:bg-(--primary-700) inline-flex items-center justify-center"
                suppressHydrationWarning
              >
                Sign Up
              </Link>
            </>
          )}
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
              {authed ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileOpen(false)}
                    className="h-10 min-w-35 rounded-md border border-(--primary-500) px-8 text-sm font-semibold text-(--primary-600) transition-colors hover:bg-(--primary-50) sm:min-w-42 inline-flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={16} strokeWidth={2.2} />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      logout();
                    }}
                    className="h-10 min-w-35 rounded-md bg-(--primary-600) px-8 text-sm font-semibold text-(--text-white) transition-colors hover:bg-(--primary-700) sm:min-w-42 inline-flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} strokeWidth={2.2} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="h-10 min-w-35 rounded-md border border-(--primary-500) px-8 text-sm font-semibold text-(--primary-600) transition-colors hover:bg-(--primary-50) sm:min-w-42 inline-flex items-center justify-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="h-10 min-w-35 rounded-md bg-(--primary-600) px-8 text-sm font-semibold text-(--text-white) transition-colors hover:bg-(--primary-700) sm:min-w-42 inline-flex items-center justify-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
