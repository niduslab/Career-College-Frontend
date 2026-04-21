"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import avatar1 from "@/assets/images/hero/avatar1.webp";
import avatar2 from "@/assets/images/hero/avatar2.webp";
import avatar3 from "@/assets/images/hero/avatar3.webp";
import instructor1 from "@/assets/images/instructors/image1.webp";
import instructor2 from "@/assets/images/instructors/image2.webp";
import instructor3 from "@/assets/images/instructors/image3.webp";
import coma from "@/assets/images/testimonials/Coma.svg";

const TESTIMONIALS = [
  {
    quote:
      "I started with zero knowledge in UI/UX design, and within 3 months, I landed my first freelance client. The course structure and mentorship were incredibly helpful.",
    name: "Nusrat Jahan",
    role: "UI/UX Designer",
    avatar: avatar1,
  },
  {
    quote:
      "I enrolled in the web development course and got a remote job shortly after completing it. The support team and instructors were amazing throughout the journey.",
    name: "Tanvir Hasan",
    role: "Web Developer",
    avatar: avatar2,
  },
  {
    quote:
      "I always thought artificial intelligence was too complex, but this course broke everything down into simple, practical lessons. Now I can confidently work on AI-based projects.",
    name: "Farhan Ahmed",
    role: "AI Engineer",
    avatar: avatar3,
  },
  {
    quote:
      "The assignments were practical and job-focused. I built a portfolio project that helped me pass technical interviews with confidence.",
    name: "Mahmudul Karim",
    role: "Full-Stack Developer",
    avatar: instructor2,
  },
  {
    quote:
      "The learning path was clear and easy to follow. Every module pushed me forward with real outcomes, not just theory.",
    name: "Saif Islam",
    role: "Python & AI Expert",
    avatar: instructor1,
  },
  {
    quote:
      "Career College gave me the structure and accountability I needed. The community and mentor feedback made a huge difference.",
    name: "Rafia Siddique",
    role: "Digital Marketing Expert",
    avatar: instructor3,
  },
];

export function Testimonials() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeArrow, setActiveArrow] = useState<"left" | "right">("right");

  const getStepWidth = useCallback(() => {
    if (!scrollerRef.current) {
      return 0;
    }

    const firstCard = scrollerRef.current.querySelector(
      "[data-testimonial-card]",
    ) as HTMLElement | null;

    if (!firstCard) {
      return 0;
    }

    return firstCard.offsetWidth + 16;
  }, []);

  const slideNext = useCallback(() => {
    if (!scrollerRef.current) {
      return;
    }

    const step = getStepWidth();
    const maxLeft =
      scrollerRef.current.scrollWidth - scrollerRef.current.clientWidth;

    if (scrollerRef.current.scrollLeft + step >= maxLeft - 2) {
      scrollerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    scrollerRef.current.scrollBy({ left: step, behavior: "smooth" });
  }, [getStepWidth]);

  const slidePrev = useCallback(() => {
    if (!scrollerRef.current) {
      return;
    }

    const step = getStepWidth();
    const maxLeft =
      scrollerRef.current.scrollWidth - scrollerRef.current.clientWidth;

    if (scrollerRef.current.scrollLeft <= 2) {
      scrollerRef.current.scrollTo({ left: maxLeft, behavior: "smooth" });
      return;
    }

    scrollerRef.current.scrollBy({ left: -step, behavior: "smooth" });
  }, [getStepWidth]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveArrow("right");
      slideNext();
    }, 4200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [slideNext]);

  return (
    <section className="w-full mt-10 lg:mt-25 py-12 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 md:items-center">
          <h2 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]">
            Why People Choose
            <br />
            Career College
          </h2>

          <div className="flex shrink-0 items-center lg:gap-3 gap-2 pt-1 md:pt-0">
            <button
              type="button"
              onClick={() => {
                setActiveArrow("left");
                slidePrev();
              }}
              aria-label="Previous testimonials"
              className={`inline-flex lg:h-11 h-10 lg:w-11 w-10 items-center justify-center cursor-pointer rounded-lg border transition-colors ${
                activeArrow === "left"
                  ? "border-(--primary-700) bg-(--primary-700) text-(--text-white)"
                  : "border-(--gray-300) bg-(--text-white) text-(--text-title) hover:border-(--primary-300)"
              }`}
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveArrow("right");
                slideNext();
              }}
              aria-label="Next testimonials"
              className={`inline-flex lg:h-11 h-10 lg:w-11 w-10 items-center justify-center cursor-pointer rounded-lg border transition-colors ${
                activeArrow === "right"
                  ? "border-(--primary-700) bg-(--primary-700) text-(--text-white)"
                  : "border-(--gray-300) bg-(--text-white) text-(--text-title) hover:border-(--primary-300)"
              }`}
            >
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth md:mt-10 lg:mt-15 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {TESTIMONIALS.map((item) => (
            <article
              key={`${item.name}-${item.role}`}
              data-testimonial-card
              className="flex w-full min-w-full snap-start flex-col justify-between rounded-2xl bg-(--gray-100) p-6 md:min-w-[calc((100%-16px)/2)] lg:min-w-[calc((100%-32px)/3)]"
            >
              <div>
                <Image src={coma} alt="Quote symbol" />
                <p className="mt-4 sg-p-default lg:sg-h6 font-medium text-(--text-title)">
                  {item.quote}
                </p>
              </div>

              <div className="mt-7 lg:mt-20 flex items-center gap-3">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="lg:sg-h6 sg-p-big font-semibold text-(--text-title)">
                    {item.name}
                  </h3>
                  <p className="sg-caption lg:sg-p-small font-normal text-(--text-paragraph)">
                    {item.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
