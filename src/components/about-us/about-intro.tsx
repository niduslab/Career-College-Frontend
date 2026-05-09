"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import image from "@/assets/images/about/image.webp";
import { gsap, prepareGsap } from "@/lib/gsap";

const STATS = [{ value: "05+", label: "Years of Experience" }];

const PILLARS = [
  {
    title: "Our Mission",
    description:
      "Empowering individuals with accessible, practical education for real career growth and lifelong success.",
  },
  {
    title: "Our Vision",
    description:
      "To become a global learning platform that makes education flexible, relevant, and career-focused for everyone.",
  },
];

export function AboutIntro() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    prepareGsap();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Image slide from left
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Content slide from right
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Pillar cards staggered
      gsap.fromTo(
        "[data-pillar-card]",
        { opacity: 0, y: 20, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: "[data-pillar-card]",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );

      // Stat card float
      gsap.to("[data-stat-card]", {
        y: -8,
        duration: 0.9,
        ease: "sine.inOut",
        autoRound: false,
        repeat: -1,
        yoyo: true,
        delay: 0.6,
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-10 md:py-16 lg:py-25">
      <div className="mx-auto grid w-full max-w-310 items-stretch gap-8 px-4 md:gap-10 md:px-6 lg:grid-cols-[1fr_1.02fr] lg:gap-16 lg:px-8">
        {/* Image column */}
        <div
          ref={imageRef}
          className="relative h-90 w-full lg:w-146.25 rounded-2xl md:h-125 lg:h-full lg:min-h-148.25"
        >
          <Image
            src={image}
            alt="Career College team collaborating"
            fill
            className="rounded-2xl object-cover"
          />

          {/* Stat floating card */}
          <div
            data-stat-card
            className="absolute right-4 top-4 w-40 will-change-transform rounded-2xl bg-(--text-white) p-5 md:right-5 md:top-5 md:h-48.5 md:w-48 lg:h-48.5 lg:w-48 lg:p-7"
          >
            <p className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-(--text-title) md:text-[48px] lg:text-[48px]">
              05+
            </p>
            <div className="my-4 border-t border-dashed border-gray-300 lg:my-5" />
            <p className="sg-p-default font-normal text-[#4e4758]">
              Years of
              <br />
              Experience
            </p>
          </div>
        </div>

        {/* Content column */}
        <div
          ref={contentRef}
          className="flex h-full  max-w-145 flex-col justify-center gap-6"
        >
          <div>
            <h2 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-black md:text-[36px] xl:text-[40px]">
              From a Simple Idea to a
              <br />
              Platform That Transforms
              <br />
              Careers
            </h2>

            <p className="mt-4  sg-p-small font-normal text-[#4e4758] lg:text-[16px]">
              Career College was founded to bridge the gap between traditional
              education and real-world career demands — helping learners gain
              practical skills while preparing job-ready talent for modern
              industries.
            </p>

            <button
              type="button"
              className="mt-6 lg:mt-10 inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-5 sg-p-default font-semibold text-(--text-white) transition-transform duration-300 hover:-translate-y-px lg:sg-p-default"
            >
              Contact Us
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed lg:mt-8 mt-6 lg:mb-10 mb-8 border-(--gray-300)" />

          {/* Mission & Vision */}
          <div className="grid gap-6 sm:grid-cols-2">
            {PILLARS.map(({ title, description }) => (
              <article key={title} data-pillar-card>
                <h3 className="text-[18px] lg:text-[24px] font-medium tracking-[-0.015em] text-black">
                  {title}
                </h3>
                <p className="mt-2 lg:mt-4 sg-p-small lg:text-[16px] font-normal text-[#4e4758]  ">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
