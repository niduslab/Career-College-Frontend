"use client";

import { useEffect, useRef } from "react";
import {
  Globe,
  Target,
  ArrowRight,
  Handshake,
  Lightbulb,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";

const ICONS: Record<string, LucideIcon> = {
  Handshake,
  Lightbulb,
  Target,
  Globe,
  Rocket,
};

const REASONS = [
  {
    id: "01",
    icon: "Handshake",
    title: "Community & Support",
    description:
      "We believe that learning is stronger when it’s shared. Our platform fosters a collaborative environment where learners, instructors, and professionals can connect, support, and inspire each other.",
  },
  {
    id: "02",
    icon: "Lightbulb",
    title: "Innovation & Relevance",
    description:
      "In a fast-changing world, staying ahead means staying relevant. We continuously evolve our content and methodologies by integrating the latest technologies, industry trends, and innovative ideas.",
  },
  {
    id: "03",
    icon: "Target",
    title: "Purpose-Driven Learning",
    description:
      "Education is a right, not a privilege. We provide flexible, affordable, and inclusive learning so anyone can gain the skills to succeed.",
  },
  {
    id: "04",
    icon: "Globe",
    title: "Accessibility for All",
    description:
      "Education is a right, not a privilege making quality learning accessible, flexible, and affordable for everyone, everywhere.",
  },
  {
    id: "05",
    icon: "Rocket",
    title: "Continuous Growth",
    description:
      "We foster curiosity, adaptability, and continuous growth helping learners stay relevant and confidently embrace new challenges.",
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
      className="w-full  lg:mb-25 mb-10  lg:mt-25 mt-10 py-10  md:py-16 lg:py-20"
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
          {/* Row 1 — 2 cards centred */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {REASONS.slice(0, 2).map((item) => (
              <ReasonCard key={item.id} item={item} />
            ))}
          </div>

          {/* Row 2 — 3 cards */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.slice(2).map((item) => (
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
  const Icon = ICONS[item.icon];
  return (
    <div
      data-reason-card
      className="flex flex-col justify-between rounded-2xl bg-gray-100 p-6 transition-shadow duration-300 hover:shadow-md"
    >
      {/* Top row — icon left, number right */}
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full  text-(--primary-700)">
          {Icon && <Icon size={24} strokeWidth={1.5} aria-hidden="true" />}
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
