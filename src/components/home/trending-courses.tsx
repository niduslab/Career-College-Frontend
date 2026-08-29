"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Heart, Loader2 } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import { useCourseCatalog } from "@/hooks/use-course-catalog";
import { useToggleWishlist } from "@/hooks/use-wishlist";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { CatalogCourse } from "@/lib/course-api";

const CARD_COUNT = 3;

function formatDuration(minutes: number | null): string {
  if (!minutes) return "Self-paced";
  const hours = minutes / 60;
  return hours >= 1 ? `${Math.round(hours * 10) / 10}h` : `${minutes}m`;
}

// Owns its own wishlist mutation — a shared instance across the row would
// disable every heart button while any one card's toggle was in flight.
function TrendingCard({
  course,
  index,
}: {
  course: CatalogCourse;
  index: number;
}) {
  const thumbnail = mediaUrl(course.thumbnail);
  const price = Number(course.price);
  const instructor = course.instructors[0]?.full_name ?? "Career College";
  const wishlistMutation = useToggleWishlist();

  const handleToggleWishlist = () => {
    wishlistMutation.mutate(
      { slug: course.slug, isWishlisted: course.is_wishlisted },
      {
        onError: (err) => {
          notify.error(
            err instanceof ApiError
              ? err.message
              : "Couldn't update your wishlist.",
          );
        },
      },
    );
  };

  return (
    <article
      data-trending-card
      className="rounded-2xl  border border-(--gray-200) bg-(--text-white) p-4 transition-shadow duration-300"
    >
      <div className="relative h-55 overflow-hidden rounded-lg bg-(--gray-50) before:absolute before:inset-0 before:z-10">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading={index === 0 ? "eager" : "lazy"}
            priority={index === 0}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--gray-300) text-[13px]">
            No image
          </div>
        )}
        <button
          type="button"
          aria-label={
            course.is_wishlisted ? "Remove from wishlist" : "Add to favorites"
          }
          onClick={handleToggleWishlist}
          disabled={wishlistMutation.isPending}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-(--text-white)/95 text-(--gray-500) shadow-[0_8px_20px_rgba(16,24,40,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Heart
            size={18}
            strokeWidth={2.2}
            className={course.is_wishlisted ? "fill-rose-500 text-rose-500" : ""}
          />
        </button>
      </div>

      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 sg-p-big leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title) min-h-11">
          {course.title}
        </h3>

        <p className="mt-2 sg-p-small font-normal text-(--text-paragraph)">
          By {instructor}
        </p>
        <div className="mt-5 flex flex-wrap gap-4 border-b border-dashed border-(--gray-200) pb-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
            <Clock3 size={14} />
            {formatDuration(course.duration_minutes)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500) capitalize">
            {course.level}
          </span>
        </div>

        <div className="flex items-center justify-between py-4">
          <p className="text-[24px] leading-none font-semibold tracking-[-0.02em] text-(--text-title)">
            {price > 0 ? `BDT ${price.toFixed(2)}` : "Free"}
          </p>

          <Link
            href={`/courses/${course.slug}`}
            className="h-10 rounded-md border bg-(--primary-700) sg-p-default  px-3  font-semibold text-(--text-white) transition-colors cursor-pointer inline-flex items-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TrendingCourses() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  // "Trending" = highest enrollment volume, same metric backing the
  // catalog's ?sort=popularity — there is no separate trending signal
  // (view counts, recent-enrollment velocity) tracked on the backend.
  const { data, isLoading } = useCourseCatalog({
    sort: "popularity",
    page_size: CARD_COUNT,
  });
  const courses = data?.results ?? [];

  useEffect(() => {
    if (!sectionRef.current || courses.length === 0) return;

    prepareGsap();

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 40, rotationX: -10 },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      gsap.fromTo(
        "[data-trending-card]",
        { opacity: 0, y: 40, rotationY: -15 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        },
      );

      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out",
            delay: 0.4,
            scrollTrigger: {
              trigger: buttonRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      gsap.utils.toArray("[data-trending-card]").forEach((card: any) => {
        card.addEventListener("mouseenter", (e: MouseEvent) => {
          gsap.to(e.currentTarget, {
            y: -8,
            boxShadow: "0 20px 40px rgba(16, 24, 40, 0.2)",
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        });

        card.addEventListener("mouseleave", (e: MouseEvent) => {
          gsap.to(e.currentTarget, {
            y: 0,
            boxShadow: "0 0px 0px rgba(16, 24, 40, 0)",
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [courses.length]);

  return (
    <section
      ref={sectionRef}
      className="w-full  mt-10 lg:mt-25 bg-(--gray-50) py-12 md:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2
          ref={headingRef}
          className="text-center text-[24px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]"
        >
          Learn What&apos;s Trending.
          <br />
          Build What&apos;s Next.
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-(--primary-600)" />
          </div>
        ) : courses.length === 0 ? (
          <p className="mt-12 text-center sg-p-default text-(--gray-500)">
            No courses available yet.
          </p>
        ) : (
          <div
            ref={cardsContainerRef}
            className="mt-10 grid lg:gap-5 gap-4 md:mt-12 lg:mt-15 md:grid-cols-2 lg:grid-cols-3"
          >
            {courses.map((course, index) => (
              <TrendingCard key={course.id} course={course} index={index} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            ref={buttonRef}
            href="/course-details-filter"
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white) transition-transform duration-300 hover:scale-105"
          >
            View All Courses
            <ArrowRight size={20} strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </section>
  );
}
