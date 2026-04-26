"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import image1 from "@/assets/images/instructors/image1.webp";
import image2 from "@/assets/images/instructors/image2.webp";
import image3 from "@/assets/images/instructors/image3.webp";
import image4 from "@/assets/images/instructors/image4.webp";

const INSTRUCTORS = [
  {
    name: "Zubair Mahmud",
    role: "Sr. Seniar UI/UX Designer",
    image: image1,
  },
  {
    name: "Mahmudul Karim",
    role: "Full-Stack Developer",
    image: image2,
  },
  {
    name: "Rafia Siddique",
    role: "Digital Marketing Expert",
    image: image3,
  },
  {
    name: "Saif Islam",
    role: "Sr. Python & AI Expert",
    image: image4,
  },
];

export function InstructorsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
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
          }
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
        }
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
          }
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative mt-10 w-full overflow-hidden bg-[#2E076E] py-12 md:py-16 lg:mt-25 lg:py-20">
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

        <div ref={cardsRef} className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-5">
          {INSTRUCTORS.map((instructor) => (
            <article key={instructor.name} data-instructor-card className="group">
              <div className="aspect-4/5 overflow-hidden rounded-2xl md:aspect-auto transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src={instructor.image}
                  alt={instructor.name}
                  width={288}
                  height={350}
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03] md:h-full md:object-center lg:h-87.5"
                />
              </div>
              <h3 className="mt-4 lg:sg-h5 sg-p-big font-semibold text-(--text-white)">
                {instructor.name}
              </h3>
              <p className="lg:mt-1 mt-2 sg-p-small lg:sg-p-default text-(--text-white) font-normal">
                {instructor.role}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--text-white) px-6 sg-p-default font-semibold text-(--primary-700) transition-transform duration-300 hover:-translate-y-px"
          >
            View All Instructors
            <ArrowRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
