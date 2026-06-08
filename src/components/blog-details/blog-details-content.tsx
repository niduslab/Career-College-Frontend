"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import type { BlogDetailsData } from "@/types/blogs";

interface BlogDetailsContentProps {
  data: BlogDetailsData;
}

export function BlogDetailsContent({ data }: BlogDetailsContentProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-blog-content]",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        "[data-sidebar-post]",
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-recent-posts]",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full  py-12 md:py-16 lg:py-25">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* ── Main Content ── */}
          <div data-blog-content className="min-w-0 flex-1">
            {/* Hero image */}
            <div className="relative h-65 overflow-hidden rounded-2xl md:h-85 lg:h-102.5">
              <Image
                src={data.heroImage}
                alt={data.heroImageAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 780px"
                className="object-cover"
                priority
              />
            </div>

            {/* Intro paragraph */}
            <p className="mt-6 text-[16px] leading-[1.7] text-[#4e4758]">
              {data.intro}
            </p>

            {/* Dynamic sections */}
            {data.sections.map((section, idx) => (
              <div key={idx} className="mt-6">
                {section.heading && (
                  <h2 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-(--text-title) md:text-[24px] lg:text-[24px]">
                    {section.heading}
                  </h2>
                )}

                {section.body && (
                  <p className="mt-4 text-[16px] leading-[1.7] font-normal text-(--text-paragraph)">
                    {section.body}
                  </p>
                )}

                {section.boldLabel && (
                  <p className="mt-4 text-[16px] font-semibold leading-[1.6] text-(--text-title)">
                    {section.boldLabel}
                  </p>
                )}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-2 space-y-2 pl-1">
                    {section.bullets.map((bullet, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start font-normal gap-2 text-[16px] leading-normal text-(--text-paragraph)"
                      >
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--text-paragraph)" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* ── Sidebar ── */}
          <aside
            data-recent-posts
            className="w-full shrink-0 lg:w-100 xl:w-100"
          >
            <div className="rounded-lg border border-(--gray-200) bg-(--text-white) p-5 md:p-6 shadow-[0_4px_40px_0_rgba(0,0,0,0.08)]">
              <h3 className="text-[18px] font-bold leading-[1.3] tracking-[-0.015em] text-(--text-title)">
                Recent Posts
              </h3>
              <div className="border-t border-(--gray-200) mt-3 mb-6"></div>
              <div className="mt-5 flex flex-col divide-y divide-dashed divide-(--gray-200)">
                {data.recentPosts.map((post, idx) => (
                  <Link
                    key={idx}
                    href={post.href ?? "#"}
                    data-sidebar-post
                    className="group flex items-start gap-3 py-4 transition-opacity hover:opacity-80"
                  >
                    <div className="h-25.5 w-37 shrink-0 overflow-hidden rounded-sm">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={148}
                        height={102}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 text-[14px] text-(---text-paragraph) font-normal">
                        <CalendarDays size={12} />
                        {post.date}
                      </span>
                      <p className="mt-1 text-[14px] lg:text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] text-(--text-title) line-clamp-2">
                        {post.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
