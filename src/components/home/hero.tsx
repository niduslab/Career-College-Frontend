"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Video, UserRoundCheck } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import image from "@/assets/images/hero/image.webp";
import avatar1 from "@/assets/images/hero/avatar1.webp";
import avatar2 from "@/assets/images/hero/avatar2.webp";
import avatar3 from "@/assets/images/hero/avatar3.webp";
export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!heroRef.current) {
      return;
    }

    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.to("[data-hero-badge-video]", {
        y: -8,
        duration: 0.9,
        ease: "sine.inOut",
        autoRound: false,
        repeat: -1,
        yoyo: true,
      });

      gsap.to("[data-hero-badge-tutor]", {
        y: 8,
        duration: 0.9,
        ease: "sine.inOut",
        autoRound: false,
        repeat: -1,
        yoyo: true,
        delay: 0.12,
      });
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main className="relative overflow-hidden bg-(--gray-50) pb-14 pt-8 md:pt-10">
      <section
        ref={heroRef}
        className="relative mx-auto grid w-full max-w-310 items-center gap-8 rounded-[28px] px-4 py-5 md:px-6 md:py-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10 lg:px-8 lg:py-9"
      >
        <div
          className="pointer-events-none absolute"
          style={{
            width: "386px",
            height: "386px",
            left: "-193px",
            bottom: "-59px",
            borderRadius: "386px",
            background: "#DFCBFA",
            filter: "blur(200px)",
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            width: "282px",
            height: "282px",
            right: "450px",
            bottom: "34px",
            borderRadius: "282px",
            background: "#FFD87C",
            filter: "blur(200px)",
          }}
        />

        <div data-hero-left className="max-w-xl">
          <h1 className="text-[42px] leading-[1.06] font-semibold tracking-[-0.028em] text-[--text-title] md:text-[56px] lg:text-[72px]">
            Start Your Dream
            <br />
            Career with the
            <br />
            Right Skills
          </h1>

          <p className="mt-5 max-w-140 text-[16px]  sg-p-default text-(--text-paragraph)">
            Join thousands of learners who are upgrading their careers through
            practical, industry-focused education. Whether you are starting
            fresh or leveling up, Career College is your learning partner.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="inline-flex h-12 items-center gap-2 sg-p-default   rounded-md bg-(--primary-700) px-6   font-semibold text-(--text-white)   transition-transform duration-300 hover:-translate-y-px"
            >
              Explore Our Courses
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                <Image
                  src={avatar1}
                  alt="Learner avatar 1"
                  className="h-10 w-10 rounded-full  object-cover"
                />
                <Image
                  src={avatar2}
                  alt="Learner avatar 2"
                  className="h-10 w-10 rounded-full  object-cover"
                />
                <Image
                  src={avatar3}
                  alt="Learner avatar 3"
                  className="h-10 w-10 rounded-full  object-cover"
                />
              </div>
              <p>
                <span className="sg-p-big font-semibold text-(--text-title)">
                  5k+
                </span>
                <br />
                <span className="sg-caption text-(--text-title) font-normal">
                  learners already enrolled
                </span>
              </p>
            </div>
          </div>
        </div>

        <div
          data-hero-image-wrap
          className="relative mx-auto w-full max-w-full lg:w-138"
        >
          <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_50px_rgba(16,24,40,0.14)] lg:h-134.5">
            <Image
              src={image}
              alt="Student learning online"
              width={552}
              height={538}
              priority
              className="h-auto w-full object-cover lg:h-full"
            />
          </div>

          <div
            data-hero-badge
            data-hero-badge-video
            className="absolute left-4 top-4 inline-flex min-w-28 will-change-transform items-center gap-2 rounded-xl bg-(--text-white) px-3 py-2  md:left-5 md:top-5"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-(--gray-100) text-(--text-title)">
              <Video size={16} strokeWidth={2.2} />
            </span>
            <p className="leading-tight whitespace-nowrap text-(--text-title)">
              <span className="block sg-p-small font-medium">120+</span>
              <span className="block sg-p-caption text-(--text-paragraph) font-normal">
                Video Course
              </span>
            </p>
          </div>

          <div
            data-hero-badge
            data-hero-badge-tutor
            className="absolute bottom-4 right-4 inline-flex min-w-28 will-change-transform items-center gap-2 rounded-xl bg-(--text-white) px-3 py-2 shadow-[0_12px_24px_rgba(16,24,40,0.16)] md:bottom-5 md:right-5"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-(--gray-100) text-(--text-title)">
              <UserRoundCheck size={16} strokeWidth={2.2} />
            </span>
            <p className="leading-tight whitespace-nowrap text-(--text-title)">
              <span className="block sg-p-small font-medium">30+</span>
              <span className="block sg-p-caption text-(--text-paragraph) font-normal">
                Expert Tutor
              </span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
