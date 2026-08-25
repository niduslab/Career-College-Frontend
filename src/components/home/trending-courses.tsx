"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Heart,
  Star,
  UsersRound,
} from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import image1 from "@/assets/images/popular-courses/image1.webp";
import image2 from "@/assets/images/popular-courses/image2.webp";
import image3 from "@/assets/images/popular-courses/image3.webp";
import Link from "next/link";

const TRENDING_COURSES = [
  {
    title: "Complete Full-Stack Web Development",
    instructor: "Jose Portella",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: image1,
  },
  {
    title: "Learn Python Programming - Beginner to Master",
    instructor: "Jose Portella",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: image2,
  },
  {
    title: "Digital Marketing Powered By AI for Beginners",
    instructor: "Jose Portella",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: image3,
  },
];

export function TrendingCourses() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    prepareGsap();

    const ctx = gsap.context(() => {
      // Heading animation - fade in with rotation effect
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

      // Cards container - staggered reveal with rotation
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

      // Button animation - scale + fade
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

      // Hover animation for cards
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
  }, []);

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

        <div
          ref={cardsContainerRef}
          className="mt-10 grid lg:gap-5 gap-4 md:mt-12 lg:mt-15 md:grid-cols-2 lg:grid-cols-3"
        >
          {TRENDING_COURSES.map((course, index) => (
            <article
              key={course.title}
              data-trending-card
              className="rounded-2xl  border border-(--gray-200) bg-(--text-white) p-4 transition-shadow duration-300"
            >
              <div className="relative h-55 overflow-hidden rounded-lg before:absolute before:inset-0 before:z-10">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label="Add to favorites"
                  className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--text-white)/95 text-(--gray-500) shadow-[0_8px_20px_rgba(16,24,40,0.12)]"
                >
                  <Heart size={18} strokeWidth={2.2} />
                </button>
              </div>

              <div className="mt-3 px-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 sg-p-big leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title)">
                    {course.title}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 sg-p-small font-normal text-(--text-paragraph)">
                    <Star
                      size={16}
                      className="fill-[#ffa500] text-(--warning-500)"
                    />
                    {course.rating}
                  </span>
                </div>

                <p className="mt-2 sg-p-small font-normal text-(--text-paragraph)">
                  By {course.instructor}
                </p>
                <div className="mt-5 flex flex-wrap gap-4 border-b border-dashed border-(--gray-200) pb-4">
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <BookOpen size={14} />
                    {course.lessons}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <Clock3 size={14} />
                    {course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <UsersRound size={14} />
                    {course.students}
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <p className="text-[24px] leading-none font-semibold tracking-[-0.02em] text-(--text-title)">
                    {course.price}
                  </p>

                  <Link
                    href="/course-details-filter"
                    className="h-10 rounded-md border bg-(--primary-700) sg-p-default  px-3  font-semibold text-(--text-white) transition-colors cursor-pointer inline-flex items-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

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
