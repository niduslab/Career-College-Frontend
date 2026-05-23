"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Heart,
  UsersRound,
} from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import image1 from "@/assets/images/popular-courses/image6.webp";

const WEBINARS = [
  {
    title: "Learn the fundamentals of artificial intelligence",
    speaker: "Farhan Ahmed",
    date: "15 April 2026",
    time: "8.00 PM",
    joined: "19 Students Joined",
    daysLeft: "10 Days Left",
  },
  {
    title: "Learn the fundamentals of artificial intelligence",
    speaker: "Farhan Ahmed",
    date: "15 April 2026",
    time: "8.00 PM",
    joined: "19 Students Joined",
    daysLeft: "10 Days Left",
  },
  {
    title: "Learn the fundamentals of artificial intelligence",
    speaker: "Farhan Ahmed",
    date: "15 April 2026",
    time: "8.00 PM",
    joined: "19 Students Joined",
    daysLeft: "10 Days Left",
  },
];

export function UpcomingWebinars() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    prepareGsap();

    const ctx = gsap.context(() => {
      // Heading fade-in
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Webinar cards staggered animation
      gsap.fromTo(
        "[data-webinar-card]",
        { opacity: 0, y: 24, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        },
      );

      // Button animation
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out",
            delay: 0.3,
            scrollTrigger: {
              trigger: buttonRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }
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
          Free Upcoming Webinar
          <br />
          In Career College
        </h2>

        <div
          ref={cardsRef}
          className="mt-10 grid lg:gap-5 gap-4 md:mt-12 lg:mt-15 md:grid-cols-2 lg:grid-cols-3"
        >
          {WEBINARS.map((webinar, index) => (
            <article
              key={`${webinar.title}-${index}`}
              data-webinar-card
              className="rounded-2xl  border border-(--gray-200) bg-(--text-white) p-4 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(16,24,40,0.12)]"
            >
              <div className="relative h-55 overflow-hidden rounded-lg before:absolute before:inset-0 before:z-10">
                <Image
                  src={image1}
                  alt={webinar.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                />
                <button
                  type="button"
                  aria-label="Add to favorites"
                  className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--text-white)/95 text-(--gray-500) shadow-[0_8px_20px_rgba(16,24,40,0.12)]"
                >
                  <Heart size={18} strokeWidth={2.2} />
                </button>
                <span className="absolute bottom-4 border-gray-200 text-[12px] h-7 left-3 inline-flex items-center gap-1 rounded-full bg-(--primary-100) px-2 py-2.5 sg-caption font-medium text-(--text-title)">
                  <CalendarDays size={14} color="#100d14" />
                  {webinar.daysLeft}
                </span>
              </div>

              <div className="mt-3 px-1">
                <h3 className="line-clamp-2 sg-p-big leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title)">
                  {webinar.title}
                </h3>

                <p className="mt-2 sg-p-small font-normal text-(--text-paragraph)">
                  Speaker:{" "}
                  <span className="text-(--text-title)">{webinar.speaker}</span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2 border-b border-dashed border-(--gray-200) pb-4">
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <CalendarDays size={14} />
                    {webinar.date}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <Clock3 size={14} />
                    {webinar.time}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <UsersRound size={14} />
                    {webinar.joined}
                  </span>
                </div>

                <Link
                  href="/course-details"
                  className="mt-4 h-10 w-full rounded-md border border-(--primary-700) bg-(--text-white) sg-p-default font-semibold text-(--text-title) cursor-pointer transition-all duration-300 ease-out hover:-translate-y-px hover:bg-(--primary-700) hover:text-(--text-white) active:translate-y-0 active:scale-[0.99] inline-flex items-center justify-center"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            ref={buttonRef}
            href="/course-details-filter"
            className="group inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white) transition-all duration-300 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
          >
            View All Webinars
            <ArrowRight
              size={20}
              strokeWidth={1.5}
              className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
