"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import mentorImage1 from "@/assets/images/favourite-mentors/image1.webp";
import mentorImage2 from "@/assets/images/favourite-mentors/image2.webp";
import mentorImage3 from "@/assets/images/favourite-mentors/image3.webp";
import mentorImage4 from "@/assets/images/favourite-mentors/image4.webp";

/**
 * TEMPORARY static data for testing the scroll/hover interaction.
 *
 * Swap back to the live API once the interaction is signed off:
 *   - restore the `browsePublicInstructors({ page: 1, page_size: 4 })` fetch
 *     into `mentors` state (see instructors-section.tsx for the pattern)
 *   - use `mediaUrl(mentor.profile_photo)` instead of `mentor.image`
 *   - use `mentor.headline || mentor.specialization.join(", ")` for `role`
 *   - restore the `initialsOf()` fallback for a missing photo
 *   - re-add the `mentors.length === 0` early return
 */
type StaticMentor = {
  full_name: string;
  slug: string;
  role: string;
  image: StaticImageData;
};

const STATIC_MENTORS: StaticMentor[] = [
  {
    full_name: "Rany Octavy",
    slug: "rany-octavy",
    role: "Communication Trainer",
    image: mentorImage1,
  },
  {
    full_name: "Brian Yusuf",
    slug: "brian-yusuf",
    role: "Language Trainer",
    image: mentorImage2,
  },
  {
    full_name: "Alicia Moreno",
    slug: "alicia-moreno",
    role: "Web Developer",
    image: mentorImage3,
  },
  {
    full_name: "Devan Prakash",
    slug: "devan-prakash",
    role: "Design Expert",
    image: mentorImage4,
  },
];

/** Brand marks — lucide-react v1 dropped these, so they're inlined. */
function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9s.68.82.9 1.38c.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38s-.82.68-1.38.9c-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9s-.68-.82-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38s.82-.68 1.38-.9c.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.9 5.9 0 0 0 1.38 2.13 5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0" />
    </svg>
  );
}

export function FavoriteMentors() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const viewButtonRef = useRef<HTMLSpanElement | null>(null);
  // quickTo setters for the cursor-follow button; created once the frame
  // mounts, read inside the mousemove handler below.
  const moveX = useRef<((value: number) => void) | null>(null);
  const moveY = useRef<((value: number) => void) | null>(null);
  const mentors = STATIC_MENTORS;

  const handleFrameMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!moveX.current || !moveY.current) {
      return;
    }
    const bounds = e.currentTarget.getBoundingClientRect();
    moveX.current(e.clientX - bounds.left);
    moveY.current(e.clientY - bounds.top);
  };

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    prepareGsap();

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // The wipe only makes sense where the sticky column exists (lg+).
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const items = gsap.utils.toArray<HTMLElement>(
          "[data-mentor-image-item]",
        );

        const panels = gsap.utils.toArray<HTMLElement>("[data-mentor-panel]");

        // Image 1 is the base layer; every later image starts fully clipped.
        gsap.set(items[0], { height: "100%" });
        gsap.set(items.slice(1), { height: "0%" });

        // One independent scrubbed trigger per image, each tied to its OWN
        // left panel. Image N wipes in as mentor N's name travels to centre,
        // so the two columns stay in step no matter how many mentors there are.
        items.forEach((item, index) => {
          if (index === 0) return; // base layer, always visible
          const panel = panels[index];
          if (!panel) return;

          gsap.fromTo(
            item,
            { height: "0%" },
            {
              height: "100%",
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top 85%",
                end: "top 35%",
                scrub: 1, // follows the wheel, like the reference's smoothing
                invalidateOnRefresh: true,
              },
            },
          );
        });

        // Each mentor's copy fades up as its panel arrives.
        panels.forEach((panel) => {
          gsap.fromTo(
            panel.querySelector("[data-mentor-copy]"),
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panel,
                start: "top 70%",
                toggleActions: "play none none none",
              },
            },
          );
        });

        // Cursor-follow View button: quickTo gives a spring-like lag behind
        // the pointer instead of snapping straight to it.
        if (viewButtonRef.current) {
          moveX.current = gsap.quickTo(viewButtonRef.current, "x", {
            duration: 0.5,
            ease: "power3",
          });
          moveY.current = gsap.quickTo(viewButtonRef.current, "y", {
            duration: 0.5,
            ease: "power3",
          });
        }

        if (!frameRef.current || !viewButtonRef.current) {
          return;
        }
        const button = viewButtonRef.current;
        const frame = frameRef.current;
        const inner = button.firstElementChild;

        const showButton = () => {
          gsap.to(button, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.to(inner, {
            scale: 1,
            duration: 0.35,
            ease: "back.out(1.7)",
            overwrite: "auto",
          });
        };
        const hideButton = () => {
          gsap.to(button, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.to(inner, {
            scale: 0.9,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        frame.addEventListener("mouseenter", showButton);
        frame.addEventListener("mouseleave", hideButton);

        return () => {
          frame.removeEventListener("mouseenter", showButton);
          frame.removeEventListener("mouseleave", hideButton);
        };
      });

      // Below lg there's no shared sticky frame — each mentor has its own
      // row + image already, so "the image changes on scroll" becomes each
      // row's own image fading/scaling in as it arrives, instead of a wipe.
      mm.add("(max-width: 1023px)", () => {
        gsap.utils
          .toArray<HTMLElement>("[data-mentor-panel]")
          .forEach((panel) => {
            gsap.fromTo(
              panel.querySelector("[data-mentor-own-image]"),
              { opacity: 0, scale: 1.06 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 80%",
                  toggleActions: "play none none reverse",
                },
              },
            );

            gsap.fromTo(
              panel.querySelector("[data-mentor-copy]"),
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 80%",
                  toggleActions: "play none none reverse",
                },
              },
            );
          });
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
    // STATIC_MENTORS is module-level and never changes — run once on mount.
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-(--text-white) py-12 md:py-16 lg:py-20"
      style={
        {
          // Shared by the sticky frame, the clipped images and each left panel,
          // so the wipe stays pixel-aligned with the scroll steps.
          "--mentor-frame-h": "min(78vh, 660px)",
        } as CSSProperties
      }
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        {/* Header: heading left, blurb + CTA right (matches reference) */}
        <div
          ref={headerRef}
          className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12"
        >
          <h2 className="max-w-2xl text-[34px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[42px] lg:text-[48px]">
            Favorite <span className="text-(--primary-600)">Mentors</span>
            <br className="hidden sm:block" /> from Our Community
          </h2>

          <div className="flex max-w-sm flex-col items-start gap-5 lg:items-end">
            <p className="sg-p-default text-(--text-paragraph) lg:text-right">
              Meet top-tier mentors ready to guide your learning journey with
              hands-on knowledge and industry experience.
            </p>
            <Link
              href="/all-instructors"
              className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-(--primary-600) px-6 sg-p-default font-semibold text-(--text-white) transition-transform duration-300 hover:-translate-y-px"
            >
              View All Mentors
              <ArrowRight size={20} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Scroll area: left panels scroll, right image column sticks */}
        <div
          ref={scrollAreaRef}
          className="relative mt-10 lg:mt-16 lg:grid lg:grid-cols-2 lg:gap-16"
        >
          {/* LEFT — one full-height panel per mentor */}
          <div>
            {mentors.map((mentor) => (
              <div
                key={mentor.slug}
                data-mentor-panel
                className="grid grid-cols-[1fr_1.15fr] items-center gap-4 py-6 sm:grid-cols-[1fr_1.35fr] sm:gap-6 md:gap-8 lg:flex lg:flex-col lg:justify-center lg:gap-0 lg:py-0 lg:h-(--mentor-frame-h)"
              >
                <div data-mentor-copy className="min-w-0 text-left">
                  <p className="sg-caption sm:sg-p-small font-medium tracking-widest text-(--text-paragraph) uppercase">
                    {mentor.role}
                  </p>
                  <h3 className="mt-2 text-[22px] leading-[1.15] font-semibold tracking-[-0.02em] text-(--text-title) sm:text-[28px] md:mt-3 md:text-[36px] lg:text-[48px]">
                    {mentor.full_name}
                  </h3>

                  {/* Static placeholders — API has no X/Instagram URLs yet */}
                  <div className="mt-3 flex items-center justify-start gap-3 text-(--text-title) sm:mt-5 sm:gap-6">
                    <span
                      aria-hidden="true"
                      className="transition-opacity duration-200 hover:opacity-60"
                    >
                      <XIcon size={18} />
                    </span>
                    <span
                      aria-hidden="true"
                      className="transition-opacity duration-200 hover:opacity-60"
                    >
                      <LinkedinIcon size={18} />
                    </span>
                    <span
                      aria-hidden="true"
                      className="transition-opacity duration-200 hover:opacity-60"
                    >
                      <InstagramIcon size={18} />
                    </span>
                  </div>
                </div>

                {/* Below lg: each mentor keeps its own image, side by side with
                    its text (no sticky/wipe — that's desktop-only, see RIGHT). */}
                <Link
                  href={`/all-instructors-details/${mentor.slug}`}
                  data-mentor-own-image
                  className="group relative block overflow-hidden rounded-2xl bg-(--gray-100) lg:hidden"
                >
                  <div className="relative aspect-square w-full sm:aspect-6/5">
                    <Image
                      src={mentor.image}
                      alt={mentor.full_name}
                      fill
                      sizes="(max-width: 639px) 45vw, (max-width: 1023px) 55vw, 0px"
                      className="object-cover object-center"
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* RIGHT — sticky frame. Images are stacked and pixel-aligned; each
              one's clip height grows top-down to wipe over the one beneath.
              One View button lives at the frame level and follows the
              cursor, instead of one per stacked image. */}
          <div className="hidden lg:block">
            <div className="sticky top-24 h-(--mentor-frame-h)">
              <div
                ref={frameRef}
                onMouseMove={handleFrameMouseMove}
                className="group relative h-full w-full overflow-hidden rounded-3xl bg-(--gray-100)"
              >
                {mentors.map((mentor, index) => (
                  <div
                    key={mentor.slug}
                    data-mentor-image-item
                    className="absolute inset-x-0 top-0 overflow-hidden"
                    style={{
                      height: index === 0 ? "100%" : 0,
                      zIndex: index + 1,
                    }}
                  >
                    {/* Fixed to the frame height so the photo stays anchored
                        while the clip above it grows — no squash, no drift. */}
                    <Link
                      href={`/all-instructors-details/${mentor.slug}`}
                      aria-label={`View ${mentor.full_name}`}
                      className="relative block h-(--mentor-frame-h) w-full"
                    >
                      <Image
                        src={mentor.image}
                        alt={mentor.full_name}
                        fill
                        sizes="50vw"
                        priority={index === 0}
                        className="object-cover object-center"
                      />
                    </Link>
                  </div>
                ))}

                <span className="pointer-events-none absolute inset-0 z-10 bg-(--text-black)/0 transition-colors duration-300 group-hover:bg-(--text-black)/15" />

                {/* Cursor-follow View button — positioned via GSAP quickTo in
                    the mousemove handler below, not CSS. */}
                <span
                  ref={viewButtonRef}
                  className="pointer-events-none absolute top-0 left-0 z-20 -translate-x-1/2 -translate-y-1/2 opacity-0"
                >
                  <span className="inline-flex h-12 scale-90 items-center gap-2 rounded-full bg-(--text-white) px-7 sg-p-default font-medium text-(--primary-600) shadow-lg">
                    View
                    <ArrowRight size={18} strokeWidth={1.75} />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
