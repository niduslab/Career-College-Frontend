"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  TrendingUp,
  UserRound,
} from "lucide-react";
import image from "@/assets/images/career-journey/image.webp";
import { gsap, prepareGsap } from "@/lib/gsap";

const HIGHLIGHTS = [
  {
    title: "Industry Experts",
    description: "Learn directly from experienced industry professionals",
    Icon: UserRound,
  },
  {
    title: "Flexible Learning",
    description: "Learn anytime, anywhere at your own pace",
    Icon: Clock3,
  },
  {
    title: "Job Placement",
    description: "Our dedicated support guides you to your dream role",
    Icon: BriefcaseBusiness,
  },
  {
    title: "Certifications",
    description: "Gain certificates that boost your profile and resume",
    Icon: BadgeCheck,
  },
];

export function CareerJourney() {
  const sectionRef = useRef<HTMLElement | null>(null);

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
      gsap.to("[data-average-card]", {
        y: -8,
        duration: 0.9,
        ease: "sine.inOut",
        autoRound: false,
        repeat: -1,
        yoyo: true,
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="mt-0 w-full py-10 md:py-16 lg:mt-25">
      <div className="mx-auto grid w-full max-w-310 items-stretch gap-8 rounded-[28px] p-4 md:gap-10 md:p-6 lg:grid-cols-[1fr_1.02fr] lg:gap-10 lg:p-8">
        <div className="relative h-full overflow-hidden rounded-2xl">
          <Image
            src={image}
            alt="Student focused on online learning"
            width={610}
            height={625}
            className="h-90 w-full rounded-2xl object-cover md:h-137.5 lg:h-full lg:min-h-156.2"
          />

          <div
            data-average-card
            className="absolute bottom-4 left-4 w-41 will-change-transform rounded-2xl bg-(--text-white) p-3 shadow-[0_16px_36px_rgba(16,24,40,0.18)] md:bottom-5 md:left-5 md:w-60 lg:w-70 md:p-4"
          >
            <p className="lg:sg-p-default sg-p-small text-(--text-paragraph) font-normal">
              Average Course <br />
              Completion Rate
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-(--primary-700)">
              <TrendingUp size={14} strokeWidth={2} />
              <span className="lg:sg-p-default sg-p-small leading-none font-normal">
                64+
              </span>
            </p>
            <div className="my-3 lg:my-4 border-t border-dashed border-(--gray-300)" />
            <p className="text-[30px] lg:mt-6 mt-4 lg:text-[48px] leading-none font-semibold tracking-[-0.03em] text-(--text-title)">
              96%
            </p>
          </div>
        </div>

        <div className="flex h-full max-w-145 flex-col justify-between">
          <div>
            <h2 className="text-[24px] leading-[1.1] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] xl:text-[40px] lg:text-[30px]">
              Where Your Career Journey
              <br />
              Begins with Us
            </h2>

            <p className="mt-4 max-w-full lg:sg-p-default sg-p-small font-normal text-(--text-paragraph)">
              At Career College, we go beyond traditional online education. Our
              platform is designed to bridge the gap between learning and
              real-world success.
            </p>

            <div className="mt-7 grid gap-4 md:mt-10 sm:grid-cols-2 sm:gap-5">
              {HIGHLIGHTS.map(({ title, description, Icon }) => (
                <article key={title} className="p-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-(--gray-100) text-(--primary-700)">
                    <Icon size={24} strokeWidth={2} />
                  </span>
                  <h3 className="mt-3.5 text-[24px] font-semibold tracking-[-0.015em] text-black">
                    {title}
                  </h3>
                  <p className="mt-2 lg:sg-p-default sg-p-small font-normal text-(--text-paragraph)">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="mt-8 inline-flex h-11.75 w-fit items-center gap-2 rounded-md bg-(--primary-700) px-5 lg:sg-p-default sg-p-small font-semibold text-(--text-white) transition-transform duration-300 hover:-translate-y-px"
          >
            Explore Our Courses
            <ArrowRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
