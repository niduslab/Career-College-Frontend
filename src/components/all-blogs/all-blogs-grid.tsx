"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Heart } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import { BLOGS } from "@/data/blogs-page";

export function AllBlogsGrid() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    prepareGsap();

    const ctx = gsap.context(() => {
      if (headingRef.current) {
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
      }

      gsap.fromTo(
        "[data-all-blog-card]",
        { opacity: 0, y: 24, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        },
      );

      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out",
            delay: 0.3,
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
  }, []);

  return (
    <section ref={sectionRef} className=" w-full py-12 md:py-16 lg:py-25">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2
          ref={headingRef}
          className="text-center text-[24px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]"
        >
          Insights, Tips & Career
          <br />
          Growth Resources
        </h2>

        <div
          ref={cardsRef}
          className="mt-10 grid gap-4 md:mt-12 lg:mt-15 md:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {BLOGS.map((blog, index) => (
            <article
              key={`${blog.title}-${index}`}
              data-all-blog-card
              className="rounded-2xl border border-(--gray-200) bg-(--gray-50) p-3 md:p-4 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(16,24,40,0.12)]"
            >
              <div className="relative h-65.5 overflow-hidden rounded-lg before:absolute before:inset-0 before:z-10">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 368px"
                  priority={index < 2}
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label="Add to favorites"
                  className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--text-white)/95 text-(--gray-500) shadow-[0_8px_20px_rgba(16,24,40,0.12)]"
                >
                  <Heart size={18} strokeWidth={2.2} />
                </button>
              </div>

              <div className="mt-3 px-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="sg-caption text-(--text-paragraph)">
                    By {blog.author}
                  </p>
                  <span className="inline-flex items-center gap-1 sg-caption text-(--gray-500)">
                    <CalendarDays size={12} />
                    {blog.date}
                  </span>
                </div>

                <h3 className="mt-3 sg-p-big leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title)">
                  {blog.title}
                </h3>

                <Link
                  href={`/blog-details/${blog.slug}`}
                  className="group mt-4 lg:mt-6 inline-flex items-center gap-2 sg-p-small lg:sg-p-default font-semibold text-(--primary-700) transition-colors hover:text-(--primary-900)"
                >
                  Read More
                  <ArrowRight
                    size={20}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <button
            ref={buttonRef}
            type="button"
            className="group inline-flex h-12 items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white) transition-all duration-300 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
          >
            View All Blogs
            <ArrowRight
              size={20}
              strokeWidth={1.5}
              className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
