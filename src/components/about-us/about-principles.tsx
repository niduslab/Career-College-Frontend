"use client";

import { useEffect, useRef } from "react";
import { gsap, prepareGsap } from "@/lib/gsap";

const STATS = [
  {
    value: "50K+",
    title: "Worldwide Learners",
    description: "Empowering people worldwide to build better careers",
  },
  {
    value: "200+",
    title: "High Quality Courses",
    description:
      "Offering high-quality programs designed for real-world success",
  },
  {
    value: "100+",
    title: "Expert Instructors",
    description: "Collaborating with industry professionals and mentors",
  },
  {
    value: "4.8",
    title: "Average Course Rating",
    description:
      "Maintaining high-quality learning experiences trusted by students",
  },
];

export function AboutPrinciples() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    prepareGsap();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
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

      gsap.fromTo(
        "[data-stat-card]",
        { opacity: 0, y: 24, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: "[data-stat-card]",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-10 md:py-16 lg:py-25">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        {/* Header row */}
        <div
          ref={headingRef}
          className="grid gap-6 md:gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:items-start"
        >
          <h2 className="text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] text-(--text-title) md:text-[34px] lg:text-[40px]">
            The Principles That Drive
            <br />
            Everything We Build
          </h2>

          <p className="text-[14px] lg:text-[16px] font-normal text-[#4e4758]">
            Our journey is defined by the success of our learners and the impact
            we&apos;ve created together. From empowering thousands of students
            to building a trusted learning platform, every milestone reflects
            our dedication to delivering real, career-focused education.
          </p>
        </div>

        {/* Stat cards grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 md:gap-5 lg:mt-15 lg:grid-cols-4 lg:gap-6">
          {STATS.map(({ value, title, description }) => (
            <article
              key={title}
              data-stat-card
              className="flex min-h-60 flex-col rounded-2xl bg-(--gray-100) p-5 md:min-h-68 md:p-6 lg:min-h-72 lg:p-6"
            >
              <p className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-(--text-title) md:text-[32px] lg:text-[32px]">
                {value}
              </p>
              <div className="grow" />
              <div className="border-t border-dashed border-(--gray-300) pt-4 md:pt-5">
                <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-(--text-title) lg:text-[18px]">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] font-normal text-[#4e4758] lg:text-[15px]">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
