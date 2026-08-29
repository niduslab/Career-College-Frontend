"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { User, Globe, Star, Loader2 } from "lucide-react";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import CourseInformation from "./course-information";
import CourseTabs from "./course-tabs";
import CourseInstructor from "./course-instructor";
import WhatYouWillLearn from "./what-you-will-learn";
import CourseContent from "./course-content";
import CourseReviews from "./course-reviews";
import CourseRequirements from "./course-requirements";
import CourseDescription from "./course-description";
import { useCatalogCourseDetail } from "@/hooks/use-course-catalog";
import { useReviewSummary } from "@/hooks/use-reviews";
import { useMyCourseDetail } from "@/hooks/use-course-catalog";
import { ApiError } from "@/lib/api";

const NAVBAR_H = 72;

/** Backend description is stored as HTML — strip tags for plain-text spots
 *  like the breadcrumb subtitle, where raw markup would print as text. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Word-boundary truncate — slicing raw chars cuts mid-word ("...sinc"). */
function truncateWords(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

interface CourseDetailsPageProps {
  slug: string;
}

export default function CourseDetailsPage({ slug }: CourseDetailsPageProps) {
  const { data: course, isLoading, isError, error } = useCatalogCourseDetail(slug);
  const { data: reviewSummary } = useReviewSummary(slug);

  // `getMyCourseDetail` 403s for a non-instructor, non-enrolled caller (or
  // for a logged-out visitor) — that's the expected "not enrolled" case here,
  // not a real error, so it's read directly rather than surfaced via isError.
  const myCourseQuery = useMyCourseDetail(slug);
  const isEnrolled =
    myCourseQuery.isLoading || myCourseQuery.isError
      ? myCourseQuery.isError
        ? false
        : undefined
      : myCourseQuery.data?.enrollment !== null;
  const isOwnCourse = myCourseQuery.data?.is_instructor === true;

  const TABS = [
    { label: "Course Instructor" },
    { label: "What You Will Learn" },
    { label: "Course Content" },
    { label: "Requirements" },
    { label: "Description" },
    { label: "Reviews" },
  ];

  const [activeTab, setActiveTab] = useState(TABS[0].label);
  const [tabsVisible, setTabsVisible] = useState(false);
  const [stickyCardVisible, setStickyCardVisible] = useState(false);

  const inlineTabsRef = useRef<HTMLDivElement>(null);
  const exploreMoreRef = useRef<HTMLDivElement>(null);
  const stickyCardRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const el = inlineTabsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setTabsVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [course]);

  useEffect(() => {
    const handleScroll = () => {
      if (!tabsVisible) {
        setStickyCardVisible(false);
        return;
      }
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top <= window.innerHeight) {
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

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-(--primary-600)" />
      </div>
    );
  }

  if (isError || !course) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-[18px] font-semibold text-(--text-title)">
          {notFound ? "Course not found." : "Something went wrong."}
        </p>
        <p className="text-[14px] text-(--gray-500)">
          {notFound
            ? "This course doesn't exist, or isn't published yet."
            : "Please try again in a moment."}
        </p>
      </div>
    );
  }

  const avgRating = reviewSummary?.avg_rating
    ? parseFloat(reviewSummary.avg_rating)
    : null;
  const instructorNames = course.instructors.map((i) => i.full_name).join(", ");

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbHero
        title={course.title}
        subtitle={truncateWords(stripHtml(course.description), 180)}
        items={[
          { label: "Home", href: "/" },
          ...(course.category
            ? [{ label: course.category.name, href: `/course-catalog?category=${course.category.slug}` }]
            : []),
          { label: course.title, active: true },
        ]}
        overflow="visible"
        cardSlot={
          <div className="hidden lg:block absolute top-10 md:top-12 lg:top-16 right-4 md:right-6 lg:right-8 w-85 z-20">
            <CourseInformation
              course={course}
              isEnrolled={isEnrolled}
              isOwnCourse={isOwnCourse}
            />
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sg-p-small font-normal text-white mt-6">
          {instructorNames && (
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{instructorNames}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span>{course.language}</span>
          </div>
          {avgRating !== null && reviewSummary && (
            <div className="flex items-center gap-2">
              <Star size={16} />
              <span>
                {avgRating.toFixed(1)} ({reviewSummary.review_count} Review
                {reviewSummary.review_count === 1 ? "" : "s"})
              </span>
            </div>
          )}
        </div>
      </BreadcrumbHero>

      <div className="lg:hidden mt-8 mb-4 px-4">
        <CourseInformation
          course={course}
          isEnrolled={isEnrolled}
          isOwnCourse={isOwnCourse}
        />
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

      <div
        className="fixed left-0 right-0 z-40 shadow-sm bg-white transition-transform duration-300 ease-in-out"
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

      <div
        ref={stickyCardRef}
        className="hidden lg:block fixed right-4 md:right-6 lg:right-8 xl:right-[calc((100vw-1280px)/2+2rem)] z-40 w-85 transition-all duration-300"
        style={{
          top: NAVBAR_H + 16,
          opacity: stickyCardVisible ? 1 : 0,
          transform: stickyCardVisible ? "translateY(0)" : "translateY(-50px)",
          pointerEvents: stickyCardVisible ? "auto" : "none",
        }}
      >
        <CourseInformation
          course={course}
          isEnrolled={isEnrolled}
          isOwnCourse={isOwnCourse}
          hideImage
        />
      </div>

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
                {label === "Course Instructor" && (
                  <CourseInstructor instructors={course.instructors} />
                )}
                {label === "What You Will Learn" && (
                  <WhatYouWillLearn
                    learningObjectives={course.learning_objectives}
                  />
                )}
                {label === "Course Content" && (
                  <CourseContent
                    sections={course.sections}
                    totalContentItems={course.total_content_items}
                  />
                )}
                {label === "Requirements" && (
                  <CourseRequirements prerequisites={course.prerequisites} />
                )}
                {label === "Description" && (
                  <CourseDescription description={course.description} />
                )}
                {label === "Reviews" && reviewSummary && (
                  <CourseReviews courseSlug={course.slug} summary={reviewSummary} />
                )}
              </section>
            ))}
          </div>
        </div>

        <div className="lg:mt-25 mt-10 lg:pb-25 pb-10" ref={exploreMoreRef} />
      </div>
    </div>
  );
}
