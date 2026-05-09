"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, ChevronUp } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import animationData from "@/assets/images/auth/education.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const FAQ_ITEMS = [
  {
    id: "01",
    title: "Apply to Become an Instructor",
    content:
      "Submit your application and tell us about your expertise, experience, and the topics you want to teach.",
  },
  {
    id: "02",
    title: "Plan Your Course Content",
    content:
      "Outline your curriculum, set learning objectives, and structure your modules with our easy-to-use course builder and expert guidance.",
  },
  {
    id: "03",
    title: "Create & Upload Your Course",
    content:
      "Record your lectures, add quizzes and assignments, then upload your content directly to our platform for review.",
  },
  {
    id: "04",
    title: "Publish & Reach Students",
    content:
      "Once approved, your course goes live to thousands of learners worldwide. Start earning and making an impact.",
  },
];

export function HowToBecomeSection() {
  const [openId, setOpenId] = useState<string>("01");
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        rightRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        "[data-faq-item]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: leftRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? "" : id));
  };

  return (
    <section
      ref={sectionRef}
      className="w-full py-12 md:py-16 lg:py-20 mt-10 mb-10 lg:mt-25 lg:mb-25"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
          {/* Left — FAQ */}
          <div ref={leftRef} className="w-full lg:max-w-140">
            <h2 className="sg-h4 lg:sg-h3 font-semibold text-[#12100e] leading-tight">
              How to Become an Instructor
            </h2>
            <p className="mt-3 sg-p-default text-[#6b7280]">
              Becoming an instructor at Career College is simple—we guide you
              every step to succeed and make an impact.
            </p>

            <div className="mt-8 flex flex-col">
              {FAQ_ITEMS.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    data-faq-item
                    className="border-b border-dashed border-(--border-default) last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="flex w-full  cursor-pointer items-center justify-between gap-4 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="sg-p-big font-semibold transition-colors text-[#12100e] duration-300">
                        <span className="mr-2">{`{${item.id}}`}</span>
                        {item.title}
                      </span>
                      <span
                        className={`shrink-0 rounded-full transition-all duration-300 ${
                          isOpen
                            ? "bg-(--primary-700)  p-2 text-white"
                            : "p-2 text-[#100d14] bg-gray-100"
                        }`}
                      >
                        {isOpen ? (
                          <ChevronUp size={16} strokeWidth={1.5} />
                        ) : (
                          <ChevronDown size={16} strokeWidth={1.5} />
                        )}
                      </span>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-3 sg-p-small text-[#4d4c44] font-normal">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — Lottie animation */}
          <div ref={rightRef} className="w-full max-w-105 lg:flex-1">
            <Lottie
              animationData={animationData}
              loop
              autoplay
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
