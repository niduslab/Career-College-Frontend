"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { BriefcaseBusiness, Star, Users, CirclePlay } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { Instructor } from "@/data/instructors";

type Props = { instructor: Instructor };

export function InstructorProfileSection({ instructor }: Props) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const STATS = [
    { icon: BriefcaseBusiness, text: instructor.experience },
    { icon: Star, text: instructor.rating },
    { icon: Users, text: instructor.students },
    { icon: CirclePlay, text: instructor.courses },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-25 lg:mb-25 mb-12"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Left — profile card */}
        <div
          ref={cardRef}
          className="w-full lg:w-100 rounded-2xl bg-gray-100 p-6 lg:shrink-0"
        >
          <div className="overflow-hidden rounded-xl aspect-4/5">
            <Image
              src={instructor.image}
              alt={instructor.name}
              width={352}
              height={343}
              className="h-full w-full object-cover object-top"
              priority
            />
          </div>

          <h2 className="mt-4 text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            {instructor.name}
          </h2>
          <p className="mt-2 text-[14px] lg:text-[16px] font-normal text-[#4e4758]">
            {instructor.role}
          </p>

          <div className="mt-5 border-t border-dashed pt-5">
            <h3 className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
              Experience Highlights
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {STATS.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2 font-normal text-[14px] text-(--text-paragraph)"
                >
                  <Icon size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-dashed pt-5">
            <h3 className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
              Social Media
            </h3>
            <div className="mt-3 flex items-center gap-2">
              {instructor.social.facebook && (
                <a
                  href={instructor.social.facebook}
                  aria-label="Facebook"
                  className="flex h-6 w-6 p-1 items-center justify-center rounded-md border border-[#100d14] text-(--text-title) transition-colors hover:border-(--primary-700) hover:bg-(--primary-700) hover:text-white"
                >
                  <FaFacebookF size={16} />
                </a>
              )}
              {instructor.social.twitter && (
                <a
                  href={instructor.social.twitter}
                  aria-label="Twitter / X"
                  className="flex h-6 w-6 p-1 items-center justify-center rounded-md border border-[#100d14] text-(--text-title) transition-colors hover:border-(--primary-700) hover:bg-(--primary-700) hover:text-white"
                >
                  <FaXTwitter size={16} />
                </a>
              )}
              {instructor.social.linkedin && (
                <a
                  href={instructor.social.linkedin}
                  aria-label="LinkedIn"
                  className="flex h-6 w-6 p-1 items-center justify-center rounded-md border border-[#100d14] text-(--text-title) transition-colors hover:border-(--primary-700) hover:bg-(--primary-700) hover:text-white"
                >
                  <FaLinkedinIn size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right — about & expertise */}
        <div ref={contentRef} className="flex-1">
          <h2 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            About {instructor.name}
          </h2>
          <p className="mt-4 text-[14px] leading-[1.75] text-[#4e4758]">
            {instructor.about}
          </p>

          <h3 className="mt-8 lg:mt-10 text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            Key Expertise
          </h3>
          <ul className="mt-4 flex flex-col gap-3">
            {instructor.expertise.map(({ label, desc }) => (
              <li
                key={label}
                className="flex items-start gap-2 text-[14px] text-[#4e4758]"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#100d14]" />
                <span>
                  <span className="font-semibold text-[16px] text-(--text-title)">
                    {label}:
                  </span>{" "}
                  {desc}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
