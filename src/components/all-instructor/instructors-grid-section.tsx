"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import image1 from "@/assets/images/instructors/image1.webp";
import image2 from "@/assets/images/instructors/image2.webp";
import image3 from "@/assets/images/instructors/image3.webp";
import image4 from "@/assets/images/instructors/image4.webp";
import image5 from "@/assets/images/instructors/image1.webp";
import image6 from "@/assets/images/instructors/image2.webp";
import image7 from "@/assets/images/instructors/image3.webp";
import image8 from "@/assets/images/instructors/image4.webp";

const INITIAL_COUNT = 4;
const BATCH = 4;

const ALL_INSTRUCTORS = [
  { name: "Zubair Mahmud", role: "Sr. Senior UI/UX Designer", image: image1 },
  { name: "Mahmudul Karim", role: "Full-Stack Developer", image: image2 },
  { name: "Rafia Siddique", role: "Digital Marketing Expert", image: image3 },
  { name: "Saif Islam", role: "Sr. Python & AI Expert", image: image4 },
  { name: "Rafia Siddique", role: "Sr. Software Engineer", image: image5 },
  { name: "Saif Islam", role: "Sr. UX Researcher", image: image6 },
  { name: "Zubair Mahmud", role: "Lead Python Expert", image: image7 },
  { name: "Mahmudul Karim", role: "Project Manager", image: image8 },
];

export function InstructorsGridSection() {
  const [visible, setVisible] = useState(INITIAL_COUNT);
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
        "[data-instructor-card]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleShowMore = () => {
    const next = Math.min(visible + BATCH, ALL_INSTRUCTORS.length);
    setVisible(next);

    requestAnimationFrame(() => {
      const newCards = document.querySelectorAll(
        "[data-instructor-card][data-new]",
      );
      gsap.fromTo(
        newCards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out" },
      );
      newCards.forEach((el) => el.removeAttribute("data-new"));
    });
  };

  const handleShowLess = () => {
    setVisible(INITIAL_COUNT);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shown = ALL_INSTRUCTORS.slice(0, visible);

  return (
    <section ref={sectionRef} className="w-full py-12 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2
          ref={headingRef}
          className="text-center lg:text-[48px] text-2xl font-semibold text-(--text-title)"
        >
          Meet Our Instructors
        </h2>

        <div
          ref={gridRef}
          className="mt-8 grid gap-x-5 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:mt-10 lg:mt-12"
        >
          {shown.map((instructor, i) => (
            <article
              key={`${instructor.name}-${i}`}
              data-instructor-card
              {...(i >= visible - BATCH && i < visible
                ? { "data-new": "" }
                : {})}
              className="group"
            >
              <div className="overflow-hidden rounded-2xl aspect-4/5">
                <Image
                  src={instructor.image}
                  alt={instructor.name}
                  width={295}
                  height={350}
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-4 text-[18px] lg:text-[24px] text- font-semibold text-(--text-title)">
                {instructor.name}
              </h3>
              <p className="mt-1 lg:text-[16px] text-[14px] text-(--text-paragraph) font-normal">
                {instructor.role}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          {visible < ALL_INSTRUCTORS.length ? (
            <button
              type="button"
              onClick={handleShowMore}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 py-3 sg-p-default font-semibold text-white transition-transform duration-300 hover:-translate-y-px"
            >
              Show More
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleShowLess}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 py-3 sg-p-default font-semibold text-white transition-transform duration-300 hover:-translate-y-px"
            >
              Show Less
              <ArrowRight size={20} strokeWidth={1.5} className="rotate-90" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
