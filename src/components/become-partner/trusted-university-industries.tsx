"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import google from "@/assets/images/become-partner/logo-google.svg";
import meta from "@/assets/images/become-partner/meta-logo.svg";
import university from "@/assets/images/become-partner/university-of-michigan-logo.svg";
import penn from "@/assets/images/become-partner/penn.svg";
import collge from "@/assets/images/become-partner/imperial-college-london.svg";
import ibm from "@/assets/images/become-partner/ibm-svgrepo-com.svg";
import amazon from "@/assets/images/become-partner/layer.svg";
import university2 from "@/assets/images/become-partner/university2.webp";

// Logos with individual dimensions
const LOGOS = [
  { name: "Google", logo: google },
  { name: "Meta", logo: meta },
  { name: "University of Michigan", logo: university },
  { name: "Penn", logo: penn },
  { name: "Imperial College London", logo: collge },
  { name: "IBM", logo: ibm },
  { name: "Amazon", logo: amazon },
  { name: "University2", logo: university2 },
];

export default function TrustedUniversityIndustries() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const animation1Ref = useRef<gsap.core.Tween | null>(null);
  const animation2Ref = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!row1Ref.current || !row2Ref.current) return;

    const row1Width = row1Ref.current.scrollWidth / 2;
    const row2Width = row2Ref.current.scrollWidth / 2;

    // Row 1: Scroll left to right
    animation1Ref.current = gsap.fromTo(
      row1Ref.current,
      { x: -row1Width },
      {
        x: 0,
        duration: 20,
        ease: "none",
        repeat: -1,
      },
    );

    // Row 2: Scroll right to left
    animation2Ref.current = gsap.to(row2Ref.current, {
      x: -row2Width,
      duration: 20,
      ease: "none",
      repeat: -1,
    });

    return () => {
      animation1Ref.current?.kill();
      animation2Ref.current?.kill();
    };
  }, []);

  const handleMouseEnter = () => {
    animation1Ref.current?.pause();
    animation2Ref.current?.pause();
  };

  const handleMouseLeave = () => {
    animation1Ref.current?.resume();
    animation2Ref.current?.resume();
  };

  const handleRow1MouseEnter = () => {
    animation1Ref.current?.pause();
  };

  const handleRow1MouseLeave = () => {
    animation1Ref.current?.resume();
  };

  const handleRow2MouseEnter = () => {
    animation2Ref.current?.pause();
  };

  const handleRow2MouseLeave = () => {
    animation2Ref.current?.resume();
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          {/* Left Content */}
          <div className="space-y-6 lg:max-w-md shrink-0">
            <h2 className="text-[32px] md:text-[40px] lg:text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] --text-title">
              Trusted by more than
              <br />
              500+ Universities &
              <br />
              Industries
            </h2>
          </div>

          {/* Right Marquee Grid */}
          <div className="flex-1 w-full space-y-6 lg:space-y-14 overflow-hidden">
            {/* Row 1 - Scroll Left to Right */}
            <div className="relative overflow-hidden">
              <div
                ref={row1Ref}
                className="flex gap-6 md:gap-8 lg:gap-14"
                onMouseEnter={handleRow1MouseEnter}
                onMouseLeave={handleRow1MouseLeave}
              >
                {/* First set */}
                {LOGOS.slice(0, 4).map((item, index) => (
                  <div
                    key={`row1-1-${index}`}
                    className="flex items-center justify-center shrink-0 w-24 md:w-32 lg:w-40"
                  >
                    <Image
                      src={item.logo}
                      alt={item.name}
                      className="w-auto h-auto max-w-full max-h-12 md:max-h-16 lg:max-h-20 object-contain"
                    />
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {LOGOS.slice(0, 4).map((item, index) => (
                  <div
                    key={`row1-2-${index}`}
                    className="flex items-center justify-center shrink-0 w-24 md:w-32 lg:w-40"
                  >
                    <Image
                      src={item.logo}
                      alt={item.name}
                      className="w-auto h-auto max-w-full max-h-12 md:max-h-16 lg:max-h-20 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 - Scroll Right to Left */}
            <div className="relative overflow-hidden">
              <div
                ref={row2Ref}
                className="flex gap-6 md:gap-8 lg:gap-14"
                onMouseEnter={handleRow2MouseEnter}
                onMouseLeave={handleRow2MouseLeave}
              >
                {/* First set */}
                {LOGOS.slice(4, 8).map((item, index) => (
                  <div
                    key={`row2-1-${index}`}
                    className="flex items-center justify-center shrink-0 w-24 md:w-32 lg:w-40"
                  >
                    <Image
                      src={item.logo}
                      alt={item.name}
                      className="w-auto h-auto max-w-full max-h-12 md:max-h-16 lg:max-h-20 object-contain"
                    />
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {LOGOS.slice(4, 8).map((item, index) => (
                  <div
                    key={`row2-2-${index}`}
                    className="flex items-center justify-center shrink-0 w-24 md:w-32 lg:w-40"
                  >
                    <Image
                      src={item.logo}
                      alt={item.name}
                      className="w-auto h-auto max-w-full max-h-12 md:max-h-16 lg:max-h-20 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
