"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Loader2 } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import { useWebinarCatalog } from "@/hooks/use-webinars";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import type { WebinarSummary } from "@/lib/webinars-api";

const CARD_COUNT = 3;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function daysUntil(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diffMs / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 Day Left";
  return `${days} Days Left`;
}

function WebinarCard({
  webinar,
  index,
}: {
  webinar: WebinarSummary;
  index: number;
}) {
  const thumbnail = mediaUrl(webinar.thumbnail);
  const price = Number(webinar.price);
  const speaker = webinar.host_expert?.full_name ?? "Career College";

  return (
    <article
      data-webinar-card
      className="rounded-2xl  border border-(--gray-200) bg-(--text-white) p-4 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(16,24,40,0.12)]"
    >
      <div className="relative h-55 overflow-hidden rounded-lg bg-(--gray-50) before:absolute before:inset-0 before:z-10">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={webinar.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            priority={index === 0}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--gray-300) text-[13px]">
            No image
          </div>
        )}
        <span className="absolute bottom-4 border-gray-200 text-[12px] h-7 left-3 inline-flex items-center gap-1 rounded-full bg-(--primary-100) px-2 py-2.5 sg-caption font-medium text-(--text-title)">
          <CalendarDays size={14} color="#100d14" />
          {daysUntil(webinar.scheduled_at)}
        </span>
      </div>

      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 sg-p-big leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title) min-h-11">
          {webinar.title}
        </h3>

        <p className="mt-2 sg-p-small font-normal text-(--text-paragraph)">
          Speaker: <span className="text-(--text-title)">{speaker}</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-2 border-b border-dashed border-(--gray-200) pb-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
            <CalendarDays size={14} />
            {formatDate(webinar.scheduled_at)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
            <Clock3 size={14} />
            {formatTime(webinar.scheduled_at)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
            {price > 0 ? `BDT ${price.toFixed(2)}` : "Free"}
          </span>
        </div>

        {/* No public /webinars/[slug] detail page exists yet (same gap
            /courses/[slug] had before it was built) — points to the course
            catalog as a placeholder until that page is built as its own task. */}
        <Link
          href="/course-details-filter"
          className="mt-4 h-10 w-full rounded-md border border-(--primary-700) bg-(--text-white) sg-p-default font-semibold text-(--text-title) cursor-pointer transition-all duration-300 ease-out hover:-translate-y-px hover:bg-(--primary-700) hover:text-(--text-white) active:translate-y-0 active:scale-[0.99] inline-flex items-center justify-center"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export function UpcomingWebinars() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  const { data, isLoading } = useWebinarCatalog({
    upcoming: true,
    page_size: CARD_COUNT,
  });
  const webinars = data?.results ?? [];

  useEffect(() => {
    if (!sectionRef.current || webinars.length === 0) return;

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
        "[data-webinar-card]",
        { opacity: 0, y: 24, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
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
  }, [webinars.length]);

  // No webinars scheduled — the whole section is skipped rather than
  // showing an empty "Upcoming Webinar" heading with nothing under it.
  if (!isLoading && webinars.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="w-full  mt-10 lg:mt-25 bg-(--gray-50) py-12 md:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2
          ref={headingRef}
          className="text-center text-[24px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]"
        >
          Free Upcoming Webinar
          <br />
          In Career College
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-(--primary-600)" />
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="mt-10 grid lg:gap-5 gap-4 md:mt-12 lg:mt-15 md:grid-cols-2 lg:grid-cols-3"
          >
            {webinars.map((webinar, index) => (
              <WebinarCard key={webinar.id} webinar={webinar} index={index} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            ref={buttonRef}
            href="/course-details-filter"
            className="group inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white) transition-all duration-300 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
          >
            View All Webinars
            <ArrowRight
              size={20}
              strokeWidth={1.5}
              className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
