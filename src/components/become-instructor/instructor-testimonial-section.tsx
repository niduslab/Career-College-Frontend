"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import coma from "@/assets/images/testimonials/Coma.svg";
import instructor1 from "@/assets/images/testimonials/image.webp";
import instructor2 from "@/assets/images/testimonials/image.webp";
import instructor3 from "@/assets/images/testimonials/image.webp";
import instructor4 from "@/assets/images/testimonials/image.webp";

const TESTIMONIALS = [
  {
    quote:
      "Teaching on Career College has provided me with two important elements: the opportunity to reach more learners than I ever would be able to on my own and a steady stream of extra income.",
    name: "Deborah Grayson Riege",
    role: "Leadership, Communication",
    image: instructor1,
  },
  {
    quote:
      "I've been able to build a global audience and generate consistent income while doing what I love. The platform tools make course creation genuinely enjoyable.",
    name: "Marcus Elliot",
    role: "Product Design, UX Strategy",
    image: instructor2,
  },
  {
    quote:
      "The support from the Career College team is outstanding. From onboarding to promotion, they guide you at every step so you can focus on teaching.",
    name: "Sadia Rahman",
    role: "Data Science, Python",
    image: instructor3,
  },
  {
    quote:
      "Publishing my first course was easier than I expected. Within weeks I had hundreds of enrolled students and real feedback that helped me improve.",
    name: "James Okafor",
    role: "Full-Stack Development",
    image: instructor4,
  },
];

export function InstructorTestimonialSection() {
  const [current, setCurrent] = useState(0);
  const [activeArrow, setActiveArrow] = useState<"prev" | "next">("next");
  const [animating, setAnimating] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [imageRef.current, contentRef.current],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
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

  const navigate = useCallback(
    (dir: "prev" | "next") => {
      if (animating) return;
      setActiveArrow(dir);
      setAnimating(true);

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrent((prev) =>
            dir === "next"
              ? (prev + 1) % TESTIMONIALS.length
              : (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
          );
          setAnimating(false);
        },
      });

      tl.to([imageRef.current, contentRef.current], {
        opacity: 0,
        x: dir === "next" ? -30 : 30,
        duration: 0.25,
        ease: "power2.in",
      }).set([imageRef.current, contentRef.current], {
        x: dir === "next" ? 30 : -30,
      });
    },
    [animating],
  );

  // Re-animate in after state change
  useEffect(() => {
    if (!imageRef.current || !contentRef.current) return;
    gsap.to([imageRef.current, contentRef.current], {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [current]);

  const item = TESTIMONIALS[current];

  return (
    <section
      ref={sectionRef}
      className="w-full py-12 md:py-16 lg:py-20 mt-10 lg:mt-25"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-14">
          {/* Left — portrait image */}
          <div
            ref={imageRef}
            className="relative w-full h-64 overflow-hidden lg:w-99.75 md:h-150 lg:h-114.75 lg:shrink-0"
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 1024px) 100vw, 399px"
              className="object-cover object-top"
              priority
            />
          </div>

          {/* Right — quote content */}
          <div
            ref={contentRef}
            className="flex flex-1 flex-col justify-between"
          >
            <div>
              <Image
                src={coma}
                alt="Quote"
                width={32}
                height={32}
                style={{ width: "auto" }}
              />
              <p className="mt-6 text-[18px] font-normal leading-7   text-(--text-title) lg:text-[24px]">
                {item.quote}
              </p>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-[18px] lg:text-[24px] font-semibold text-(--text-title)">
                  {item.name}
                </h3>
                <p className="mt-2 text-[14px] lg:text-[16px] text-[#6b7280]">
                  {item.role}
                </p>
              </div>

              {/* Navigation arrows */}
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("prev")}
                  aria-label="Previous testimonial"
                  className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-colors duration-200 ${
                    activeArrow === "prev"
                      ? "border-(--primary-700) bg-(--primary-700) text-white"
                      : "border-(--gray-300) bg-white text-[#12100e] hover:border-(--primary-700) hover:bg-(--primary-700) hover:text-white"
                  }`}
                >
                  <ArrowLeft size={20} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("next")}
                  aria-label="Next testimonial"
                  className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-colors duration-200 ${
                    activeArrow === "next"
                      ? "border-(--primary-700) bg-(--primary-700) text-white"
                      : "border-(--gray-300) bg-white text-[#12100e] hover:border-(--primary-700) hover:bg-(--primary-700) hover:text-white"
                  }`}
                >
                  <ArrowRight size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
