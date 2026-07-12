"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import {
  browsePublicInstructors,
  type PublicInstructorListItem,
} from "@/lib/profile-api";
import {
  mediaUrl,
  initialsOf,
} from "@/components/dashboard/settings-shared/helpers";

export function InstructorsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);
  const [instructors, setInstructors] = useState<PublicInstructorListItem[]>(
    [],
  );

  useEffect(() => {
    let active = true;
    browsePublicInstructors({ page: 1, page_size: 4 })
      .then((res) => {
        if (active) setInstructors(res.results);
      })
      .catch(() => {
        /* section just renders empty on failure */
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    // Cards render only after `instructors` loads — skip until they exist
    if (instructors.length === 0) {
      return;
    }

    prepareGsap();

    const ctx = gsap.context(() => {
      // Heading fade-in with color shift
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
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

      // Instructor cards staggered with rotation
      gsap.fromTo(
        "[data-instructor-card]",
        { opacity: 0, y: 40, rotationY: -20 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          duration: 0.7,
          stagger: 0.12,
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
          { opacity: 0, scale: 0.9 },
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
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [instructors]);

  return (
    <section
      ref={sectionRef}
      className="relative mt-10 w-full overflow-hidden bg-[#2E076E] py-12 md:py-16 lg:mt-25 lg:py-20"
    >
      <div
        className="pointer-events-none absolute"
        style={{
          width: "441px",
          height: "395px",
          left: "46px",
          bottom: "150px",
          borderRadius: "441px",
          background: "#601FCB",
          filter: "blur(175px)",
        }}
      />

      <div
        className="pointer-events-none absolute"
        style={{
          width: "395px",
          height: "395px",
          right: "147px",
          top: "109px",
          borderRadius: "395px",
          background: "#560BD1",
          filter: "blur(175px)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2
          ref={headingRef}
          className="text-center text-[34px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-white) md:text-[42px] lg:text-[48px]"
        >
          Learn from the Minds
          <br />
          Behind Real-World Success
        </h2>

        <div
          ref={cardsRef}
          className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5"
        >
          {instructors.map((instructor) => {
            const photoUrl = mediaUrl(instructor.profile_photo);
            return (
              <Link
                key={instructor.slug}
                href={`/all-instructors-details/${instructor.slug}`}
                data-instructor-card
                className="group block"
              >
                <div className="relative h-64 overflow-hidden rounded-2xl bg-white/10 sm:h-72 md:h-80 lg:h-87.5 transition-transform duration-300 group-hover:scale-[1.02] flex items-center justify-center">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={instructor.full_name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="eager"
                      priority
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="text-[40px] font-semibold text-(--text-white)">
                      {initialsOf(instructor.full_name)}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 lg:sg-h5 sg-p-big font-semibold text-(--text-white)">
                  {instructor.full_name}
                </h3>
                <p className="lg:mt-1 mt-2 sg-p-small lg:sg-p-default text-(--text-white) font-normal truncate">
                  {instructor.headline || instructor.specialization.join(", ")}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            ref={buttonRef}
            href="/all-instructors"
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--text-white) px-6 sg-p-default font-semibold text-(--primary-700) transition-transform duration-300 hover:-translate-y-px"
          >
            View All Instructors
            <ArrowRight size={20} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
