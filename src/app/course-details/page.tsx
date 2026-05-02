"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { User, Globe, Users, Star } from "lucide-react";
import gsap from "gsap";
import { Breadcrumb } from "@/components/common/breadcrumb";
import CourseInformation from "@/components/course-details/course-information";
import CourseTabs from "@/components/course-details/course-tabs";
import CourseInstructor from "@/components/course-details/course-instructor";
import WhatYouWillLearn from "@/components/course-details/what-you-will-learn";
import CourseContent from "@/components/course-details/course-content";
import LearnersReviews from "@/components/course-details/learners-reviews";
import CourseRequirements from "@/components/course-details/course-requirements";
import CourseDescription from "@/components/course-details/course-description";
import ExploreMoreCourses from "@/components/course-details/explore-more-courses";

const TABS = [
  { label: "Course Instructor" },
  { label: "What You Will Learn" },
  { label: "Course Content" },
  { label: "Requirements" },
  { label: "Description" },
];

const NAVBAR_H = 72;

export default function CourseDetailsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].label);

  const [tabsVisible, setTabsVisible] = useState(false);
  const [stickyCardVisible, setStickyCardVisible] = useState(false);

  const inlineTabsRef = useRef<HTMLDivElement>(null);
  const exploreMoreRef = useRef<HTMLDivElement>(null);
  const stickyCardRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Animate sticky card with GSAP
  useEffect(() => {
    if (!stickyCardRef.current) return;

    if (stickyCardVisible) {
      gsap.to(stickyCardRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      gsap.to(stickyCardRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      });
    }
  }, [stickyCardVisible]);

  // Observe inline tabs to toggle sticky tabs bar
  useEffect(() => {
    const el = inlineTabsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setTabsVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Show/hide sticky card based on tabs visibility, footer, and ExploreMoreCourses
  useEffect(() => {
    const handleScroll = () => {
      if (!tabsVisible) {
        setStickyCardVisible(false);
        return;
      }

      // Hide when footer is visible in viewport
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top <= window.innerHeight) {
          setStickyCardVisible(false);
          return;
        }
      }

      // Hide when ExploreMoreCourses enters viewport
      const exploreEl = exploreMoreRef.current;
      if (exploreEl) {
        const rect = exploreEl.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          setStickyCardVisible(false);
          return;
        }
      }

      setStickyCardVisible(true);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [tabsVisible]);

  // Active tab detection via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (
              !best ||
              entry.boundingClientRect.top < best.boundingClientRect.top
            ) {
              best = entry;
            }
          }
        }
        if (best) {
          const label = (best.target as HTMLElement).dataset.tab ?? "";
          if (label) setActiveTab(label);
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 },
    );

    TABS.forEach(({ label }) => {
      const el = sectionRefs.current[label];
      if (el) observer.observe(el);
    });

    // Activate last tab when scrolled to bottom of page
    const lastTab = TABS[TABS.length - 1].label;
    const onScroll = () => {
      if (isClickScrolling.current) return;
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;
      if (nearBottom) setActiveTab(lastTab);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleTabClick = useCallback((tabLabel: string) => {
    setActiveTab(tabLabel);
    const el = sectionRefs.current[tabLabel];
    if (!el) return;
    isClickScrolling.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 900);
  }, []);

  const setRef = useCallback(
    (label: string) => (el: HTMLElement | null) => {
      sectionRefs.current[label] = el;
    },
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-(--gray-950) overflow-visible">
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10 md:py-12 lg:py-16">
          <div className="lg:pr-96">
            <Breadcrumb
              title="Complete UI/UX Design Course 2026: Figma + Real Project"
              subtitle="Use Figma to get a job in UI Design, User Interface, User Experience design, UX Design & Web Design"
              items={[
                { label: "Home", href: "/" },
                { label: "Design", href: "/design" },
                { label: "User Experience Design", href: "/design/ux" },
                { label: "Figma UI/UX Design", active: true },
              ]}
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sg-p-small font-normal text-white mt-6">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Instructor</span>
                  <a
                    href="#"
                    className="text-(--primary-500) hover:underline font-medium"
                  >
                    Daniel Walter Scott
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>English</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Enrolled 87,398</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} />
                  <span>4.7 (46,245 Reviews)</span>
                </div>
              </div>
            </Breadcrumb>
          </div>

          {/* Card: absolute — starts in hero, bleeds below into white section */}
          <div className="hidden lg:block absolute top-10 md:top-12 lg:top-16 right-4 md:right-6 lg:right-8 w-85 z-20">
            <CourseInformation />
          </div>
        </div>
      </div>

      <div ref={inlineTabsRef}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 ">
          <div className="lg:pr-96">
            <CourseTabs
              activeTab={activeTab}
              setActiveTab={handleTabClick}
              tabs={TABS}
            />
          </div>
        </div>
      </div>

      {/* Sticky tabs bar */}
      <div
        className="fixed left-0 right-0 z-40 shadow-sm bg-white
                   transition-transform duration-300 ease-in-out"
        style={{
          top: NAVBAR_H,
          transform: tabsVisible ? "translateY(0)" : "translateY(-120%)",
          pointerEvents: tabsVisible ? "auto" : "none",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="lg:pr-96">
            <CourseTabs
              activeTab={activeTab}
              setActiveTab={handleTabClick}
              tabs={TABS}
            />
          </div>
        </div>
      </div>

      {/* Sticky CourseInformation - appears when tabs are sticky, hides at footer */}
      <div
        ref={stickyCardRef}
        className="hidden lg:block fixed right-4 md:right-6   lg:right-8 xl:right-[calc((100vw-1280px)/2+2rem)] z-40 w-85"
        style={{
          top: NAVBAR_H + 34,
          opacity: 0,
          transform: "translateY(-50px)",
          pointerEvents: stickyCardVisible ? "auto" : "none",
        }}
      >
        <CourseInformation hideImage={true} />
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="lg:pr-96">
          <div className="space-y-12">
            {TABS.map(({ label }) => (
              <section
                key={label}
                ref={setRef(label)}
                data-tab={label}
                className="scroll-mt-32"
              >
                {label === "Course Instructor" && <CourseInstructor />}
                {label === "What You Will Learn" && <WhatYouWillLearn />}
                {label === "Course Content" && <CourseContent />}
                {label === "Requirements" && <CourseRequirements />}
                {label === "Description" && <CourseDescription />}
              </section>
            ))}
          </div>
        </div>

        <div className="lg:pr-96 mt-12">
          <LearnersReviews />
        </div>

        <div className="lg:mt-25 mt-10   lg:pb-25 pb-10" ref={exploreMoreRef}>
          <ExploreMoreCourses />
        </div>

        {/* Mobile: card in normal flow */}
        <div className="lg:hidden mt-8">
          <CourseInformation />
        </div>
      </div>
    </div>
  );
}
