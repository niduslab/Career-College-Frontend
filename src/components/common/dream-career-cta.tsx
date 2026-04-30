"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import avatar1 from "@/assets/images/dream-career/image1.webp";
import avatar2 from "@/assets/images/dream-career/image2.webp";
import avatar3 from "@/assets/images/dream-career/image3.webp";
import avatar4 from "@/assets/images/dream-career/image4.webp";
import avatar5 from "@/assets/images/dream-career/image5.webp";
import avatar6 from "@/assets/images/dream-career/image6.webp";
import avatar7 from "@/assets/images/dream-career/image7.webp";
import avatar8 from "@/assets/images/dream-career/image8.webp";
import avatar9 from "@/assets/images/dream-career/image9.webp";
import avatar10 from "@/assets/images/dream-career/image10.webp";

const FLOATING_AVATARS = [
  {
    image: avatar1,
    className:
      "hidden h-[52px] w-[52px] rounded-[16px] xl:block xl:left-10 xl:top-8",
  },
  {
    image: avatar2,
    className:
      "hidden h-[80px] w-[80px] rounded-[16px] xl:block xl:left-40 xl:top-8",
  },
  {
    image: avatar3,
    className:
      "hidden h-[88px] w-[88px] rounded-[8px] xl:block xl:left-16 xl:top-[180px]",
  },
  {
    image: avatar4,
    className:
      "hidden h-[56px] w-[56px] rounded-[16px] xl:block xl:left-10 xl:bottom-8",
  },
  {
    image: avatar5,
    className:
      "hidden h-[72px] w-[72px] rounded-[16px] xl:block xl:left-40 xl:bottom-8",
  },
  {
    image: avatar6,
    className:
      "hidden h-[52px] w-[52px] rounded-[16px] xl:block xl:right-[200px] xl:top-8",
  },
  {
    image: avatar7,
    className:
      "hidden h-[88px] w-[88px] rounded-[16px] xl:block xl:right-10 xl:top-10",
  },
  {
    image: avatar8,
    className:
      "hidden h-[88px] w-[88px] rounded-[8px] xl:block xl:right-[80px] xl:top-[180px]",
  },
  {
    image: avatar10,
    className:
      "hidden h-[72px] w-[72px] rounded-[16px] xl:block xl:right-10 xl:bottom-8",
  },
  {
    image: avatar9,
    className:
      "hidden h-[64px] w-[64px] rounded-[16px] xl:block xl:right-40 xl:bottom-8",
  },
];

export function DreamCareerCta() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    prepareGsap();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      // Content fade-in + slide-up
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Avatar floating animations
      const avatars = gsap.utils.toArray<HTMLElement>("[data-float-avatar]");
      const floatOffsets = [-6, 5, -7, 6, -5, 6, -6, 5, -7, 6];

      avatars.forEach((avatar, index) => {
        gsap.to(avatar, {
          y: floatOffsets[index] ?? (index % 2 === 0 ? -6 : 6),
          duration: 1.15 + (index % 4) * 0.12,
          ease: "sine.inOut",
          autoRound: false,
          repeat: -1,
          yoyo: true,
          delay: index * 0.05 + 0.5,
        });
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="mt-10 lg:mb-25 mb-10  w-full lg:mt-25">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <div className="relative min-h-90 overflow-hidden rounded-2xl border border-(--gray-200) bg-[linear-gradient(90deg,#f3f0ff_0%,#f6f4ef_100%)] px-3 py-7 sm:px-6 sm:py-10 md:min-h-106 md:px-8 md:py-12 lg:min-h-112 lg:px-10 lg:py-14">
          <div
            className="pointer-events-none absolute"
            style={{
              width: "282px",
              height: "282px",
              borderRadius: "282px",
              background: "#DFCBFA",
              filter: "blur(225px)",
              left: "-48px",
              top: "62px",
            }}
          />

          <div
            className="pointer-events-none absolute"
            style={{
              width: "228px",
              height: "228px",
              borderRadius: "228px",
              background: "#FFD87C",
              filter: "blur(200px)",
              right: "-34px",
              top: "56px",
            }}
          />

          {FLOATING_AVATARS.map((item, index) => (
            <span
              key={`floating-avatar-${index}`}
              data-float-avatar
              className={`absolute z-20 will-change-transform overflow-hidden ring-1 ring-white/80 shadow-[0_10px_24px_rgba(16,24,40,0.12)] ${item.className}`}
            >
              <Image
                src={item.image}
                alt="Learner avatar"
                fill
                className="h-full w-full object-cover"
              />
            </span>
          ))}

          <div
            className="relative z-30 lg:mt-20 mt-12  mx-auto max-w-170 text-center"
            ref={contentRef}
          >
            <h2 className="text-[30px] leading-[1.08] font-semibold tracking-[-0.03em] text-(--text-title) sm:text-[34px] md:text-[48px] lg:text-[48px]">
              Take the First Step Toward
              <br />
              Your Dream Career
            </h2>

            <p className="mx-auto mt-4 max-w-130 sg-p-small lg:sg-p-default text-(--text-paragraph)">
              Start your journey toward a skill driven career with Career
              College, learn from experts, work on real projects, and achieve
              your goals faster.
            </p>

            <button
              type="button"
              className="group cursor-pointer mt-8 lg:mt-10 inline-flex h-12 items-center gap-2 rounded-md bg-(--primary-700) px-6  sg-p-small lg:sg-p-default font-semibold text-(--text-white) transition-all duration-300 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
            >
              Explore Our Courses
              <ArrowRight
                size={20}
                strokeWidth={1.5}
                className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
