"use client";

import { useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { BookAudio, GraduationCap, PenLine, Users } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";
import featureImage from "@/assets/images/about/image.webp";
import communityImage from "@/assets/images/career-journey/image.webp";
import orbitAvatar1 from "@/assets/images/favourite-mentors/image1.webp";
import orbitAvatar2 from "@/assets/images/favourite-mentors/image2.webp";
import orbitAvatar3 from "@/assets/images/favourite-mentors/image3.webp";
import orbitAvatar4 from "@/assets/images/favourite-mentors/image4.webp";
import orbitAvatar5 from "@/assets/images/hero/student2.webp";
import orbitAvatar6 from "@/assets/images/instructors/instructor1.webp";

/** Shared card shell: soft surface + hairline ring, matching the reference. */
const CARD_CLASS =
  "rounded-3xl bg-(--gray-50) shadow-[inset_0_0_0_1px_var(--gray-200)]";

/**
 * Avatars sit on two concentric rings. `angle` is where each one starts (deg,
 * 0 = 12 o'clock), `ring` picks the orbit radius, `size` the avatar diameter.
 * The ring rotates; each avatar counter-rotates so faces stay upright.
 */
type OrbitAvatar = {
  image: StaticImageData;
  alt: string;
  angle: number;
  size: number;
};

const INNER_ORBIT: OrbitAvatar[] = [
  { image: orbitAvatar1, alt: "", angle: 20, size: 56 },
  { image: orbitAvatar2, alt: "", angle: 165, size: 44 },
  { image: orbitAvatar3, alt: "", angle: 265, size: 50 },
];

const OUTER_ORBIT: OrbitAvatar[] = [
  { image: orbitAvatar4, alt: "", angle: 335, size: 58 },
  { image: orbitAvatar5, alt: "", angle: 120, size: 64 },
  { image: orbitAvatar6, alt: "", angle: 210, size: 52 },
];

/** One rotating ring of avatars, drawn as a dashed circle with faces on it. */
function OrbitRing({
  avatars,
  diameter,
  spinSelector,
}: {
  avatars: OrbitAvatar[];
  diameter: number;
  spinSelector: string;
}) {
  return (
    <div
      data-orbit-ring={spinSelector}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-(--gray-300)"
      style={{ width: diameter, height: diameter }}
    >
      {avatars.map((avatar, index) => (
        <div
          key={index}
          className="absolute top-1/2 left-1/2"
          style={{
            // Push the avatar out to the ring edge at its own angle.
            transform: `rotate(${avatar.angle}deg) translateY(-${diameter / 2}px)`,
          }}
        >
          <div
            data-orbit-avatar
            className="relative overflow-hidden rounded-full bg-(--text-white) shadow-md ring-4 ring-(--text-white)"
            style={{
              width: avatar.size,
              height: avatar.size,
              // Undo both the ring spin and this avatar's own angle, so the
              // face stays upright while it travels around the circle.
              transform: `translate(-50%, -50%) rotate(-${avatar.angle}deg)`,
            }}
          >
            <Image
              src={avatar.image}
              alt={avatar.alt}
              fill
              sizes="64px"
              className="object-cover object-center"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlatformFeatures() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const orbitRef = useRef<HTMLDivElement | null>(null);

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
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        "[data-feature-tile]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        },
      );

      // Orbit spin: rings turn at different speeds and directions, while each
      // avatar counter-spins by the same amount so faces never go upside-down.
      const spins: gsap.core.Tween[] = [];
      const ringConfigs: Record<string, { duration: number; degrees: number }> =
        {
          outer: { duration: 46, degrees: 360 },
          inner: { duration: 34, degrees: -360 },
        };

      orbitRef.current
        ?.querySelectorAll<HTMLElement>("[data-orbit-ring]")
        .forEach((ring) => {
          const key = ring.dataset.orbitRing ?? "outer";
          const config = ringConfigs[key] ?? ringConfigs.outer;

          spins.push(
            gsap.to(ring, {
              rotation: config.degrees,
              duration: config.duration,
              ease: "none",
              repeat: -1,
              transformOrigin: "50% 50%",
            }),
          );

          // Counter-rotate each face by the opposite amount. The tween has to
          // start from that avatar's own -angle (already in its inline
          // transform), otherwise GSAP restarts it from 0 and the face spins
          // the wrong way relative to the ring.
          ring
            .querySelectorAll<HTMLElement>("[data-orbit-avatar]")
            .forEach((avatar) => {
              const startAngle = gsap.getProperty(avatar, "rotation") as number;

              spins.push(
                gsap.to(avatar, {
                  rotation: startAngle - config.degrees,
                  duration: config.duration,
                  ease: "none",
                  repeat: -1,
                  transformOrigin: "50% 50%",
                }),
              );
            });
        });

      // Respect reduced-motion: hold the rings still.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        spins.forEach((spin) => spin.pause());
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full sg-section-y">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <div ref={headingRef} className="mx-auto max-w-2xl text-center">
          <h2 className="text-[24px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]">
            Built for the Way
            <br />
            You Actually Learn
          </h2>
          <p className="mt-4 sg-p-small lg:sg-p-default text-(--text-paragraph)">
            Practical courses, a global community, and instructors who teach
            from real experience.
          </p>
        </div>

        {/* Three equal columns; each column is its own vertical stack, so the
            tall middle card sits flush with the stacked side cards. */}
        <div
          ref={gridRef}
          className="mt-10 grid gap-6 md:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch"
        >
          {/* COLUMN 1 — photo on top, text card below */}
          <div className="flex flex-col gap-6">
            <div
              data-feature-tile
              className="relative h-60 overflow-hidden rounded-3xl md:h-70 lg:h-75"
            >
              <Image
                src={featureImage}
                alt="A learner studying online"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center"
              />
            </div>

            <div
              data-feature-tile
              className={`flex flex-1 flex-col justify-between gap-8 p-6 lg:p-8 ${CARD_CLASS}`}
            >
              <div className="flex flex-col gap-4">
                <BookAudio
                  size={40}
                  strokeWidth={1.25}
                  className="text-(--primary-600)"
                />
                <h3 className="sg-h5 font-semibold text-(--text-title)">
                  4k+ hours videos
                </h3>
              </div>
              <p className="sg-p-default text-(--text-paragraph)">
                Hours of meticulously designed courses, created and taught by
                industry-leading professionals.
              </p>
            </div>
          </div>

          {/* COLUMN 2 — tall card: image on top, body beneath, one surface */}
          <div
            data-feature-tile
            className={`flex flex-col overflow-hidden md:col-span-2 lg:col-span-1 ${CARD_CLASS}`}
          >
            {/* Orbit graphic: two dashed rings of learner avatars circling
                the brand mark, each ring spinning at its own speed. */}
            <div
              ref={orbitRef}
              aria-hidden="true"
              className="relative h-60 w-full overflow-hidden md:h-72 lg:h-95"
            >
              <OrbitRing
                avatars={OUTER_ORBIT}
                diameter={300}
                spinSelector="outer"
              />
              <OrbitRing
                avatars={INNER_ORBIT}
                diameter={186}
                spinSelector="inner"
              />

              {/* Centre brand mark */}
              <div className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-(--primary-600) shadow-lg">
                <GraduationCap
                  size={30}
                  strokeWidth={1.75}
                  className="text-(--text-white)"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 p-6 lg:p-8">
              <div className="flex items-center gap-3">
                <Users
                  size={40}
                  strokeWidth={1.25}
                  className="shrink-0 text-(--primary-600)"
                />
                <h3 className="sg-h5 font-semibold text-(--text-title)">
                  A Great Community
                </h3>
              </div>
              <p className="sg-p-default text-(--text-paragraph)">
                We value our global community&rsquo;s support and embrace
                diversity to create a welcoming space for everyone to learn.
              </p>
            </div>
          </div>

          {/* COLUMN 3 — text card on top, photo below (mirrors column 1) */}
          <div className="flex flex-col gap-6">
            <div
              data-feature-tile
              className={`flex flex-1 flex-col justify-between gap-8 p-6 lg:p-8 ${CARD_CLASS}`}
            >
              <div className="flex flex-col gap-4">
                <PenLine
                  size={40}
                  strokeWidth={1.25}
                  className="text-(--primary-600)"
                />
                <h3 className="sg-h5 font-semibold text-(--text-title)">
                  Learn-by-Doing, Teach with Purpose
                </h3>
              </div>
              <p className="sg-p-default text-(--text-paragraph)">
                Our philosophy: hands-on learning creates impact. Every course
                fosters practical skills and transparency.
              </p>
            </div>

            <div
              data-feature-tile
              className="relative h-60 overflow-hidden rounded-3xl md:h-70 lg:h-75"
            >
              <Image
                src={communityImage}
                alt="An instructor teaching online"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
