"use client";

import { useEffect, useRef } from "react";
import {
  Globe,
  BadgeDollarSign,
  Target,
  Wrench,
  ChartColumnDecreasing,
  ArrowRight,
} from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";

const REASONS = [
  {
    id: "01",
    icon: Globe,
    title: "Reach a Global Audience",
    description:
      "Teach students worldwide and expand your influence beyond borders. Share your expertise with eager learners ready to grow and succeed.",
  },
  {
    id: "02",
    icon: BadgeDollarSign,
    title: "Earn from Your Knowledge",
    description:
      "Monetize your knowledge and earn income from your courses as they reach more students worldwide.",
  },
  {
    id: "03",
    icon: Target,
    title: "Build Your Personal Brand",
    description:
      "Establish yourself as an industry expert by sharing valuable knowledge. Grow your reputation and open doors to new professional opportunities.",
  },
  {
    id: "04",
    icon: Wrench,
    title: "Easy Course Creation Tools",
    description:
      "Create, upload, and manage your courses effortlessly with our intuitive platform. Focus more on teaching while we handle the technical side.",
  },
  {
    id: "05",
    icon: ChartColumnDecreasing,
    title: "Grow with Data Insights",
    description:
      "Track your course performance and understand student engagement with real-time analytics. Improve your content using actionable insights.",
  },
];

export function WhyJoinSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    prepareGsap();

    const ctx = gsap.context(() => {
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

      gsap.fromTo(
        "[data-reason-card]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        "[data-cta-btn]",
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.55,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: "[data-cta-btn]",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gray-50 lg:mb-25 mb-10  lg:mt-25 mt-10 py-10  md:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <h2
          ref={headingRef}
          className="lg:text-[40px] text-2xl text-center font-semibold text-(--text-title)"
        >
          Why Join as an Instructor?
        </h2>

        {/* Cards grid — 3 cols top row, 2 cols bottom row centred */}
        <div ref={gridRef} className="mt-10 md:mt-12">
          {/* Row 1 — 3 cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.slice(0, 3).map((item) => (
              <ReasonCard key={item.id} item={item} />
            ))}
          </div>

          {/* Row 2 — 2 cards centred */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-2 lg:mx-auto lg:max-w-[calc(66.666%+10px)]">
            {REASONS.slice(3).map((item) => (
              <ReasonCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <button
            data-cta-btn
            type="button"
            className="inline-flex  cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 py-3 sg-p-default font-semibold text-white transition-transform duration-300 hover:-translate-y-px"
          >
            Become an Instructor
            <ArrowRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ReasonCard({ item }: { item: (typeof REASONS)[number] }) {
  const Icon = item.icon;
  return (
    <div
      data-reason-card
      className="flex flex-col justify-between rounded-2xl bg-gray-100 p-6 transition-shadow duration-300 hover:shadow-md"
    >
      {/* Top row — icon left, number right */}
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full  text-(--primary-700)">
          <Icon />
        </span>
        <span className="sg-h4 lg:sg-h3 font-semibold text-gray-300">
          {item.id}
        </span>
      </div>

      {/* Title & description */}
      <div className="lg:mt-24 mt-20">
        <h3 className="sg-p-big lg:sg-h5 font-semibold text-(--text-title)">
          {item.title}
        </h3>
        <p className="mt-2 sg-p-small lg:sg-p-default text-[#4e4758] font-normal leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
}
