"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { MapPin, BadgeCheck, CalendarDays, Mail, Phone } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";
import { gsap, prepareGsap } from "@/lib/gsap";
import {
  mediaUrl,
  initialsOf,
} from "@/components/dashboard/settings-shared/helpers";
import { INSTITUTION_TYPE_OPTIONS } from "@/lib/profile-api";
import type { PublicPartnerProfile } from "@/lib/profile-api";

type Props = { institution: PublicPartnerProfile };

const INSTITUTION_TYPE_LABEL = (v: string) =>
  INSTITUTION_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v;

export function InstitutionProfileSection({ institution }: Props) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const logoUrl = mediaUrl(institution.logo);
  const coverUrl = mediaUrl(institution.cover_image);
  const location = [institution.city, institution.state, institution.country]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    if (!sectionRef.current) return;
    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-25 lg:mb-25 mb-12"
    >
      {/* Banner: cover image with the logo overlapping its bottom-left */}
      <div
        ref={bannerRef}
        className="bg-white border border-(--gray-200) rounded-2xl overflow-hidden"
      >
        <div className="relative w-full h-40 sm:h-56 bg-(--gray-100)">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt="Cover"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[13px] text-(--gray-400)">
              No cover image
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4">
            <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 -mt-10 sm:-mt-12 rounded-2xl overflow-hidden ring-4 ring-white bg-(--gray-100) flex items-center justify-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={institution.institution_name}
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span className="text-[24px] font-semibold text-(--primary-700)">
                  {initialsOf(institution.institution_name)}
                </span>
              )}
            </div>
            <div className="pb-1 pt-3 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) truncate">
                  {institution.institution_name}
                </h1>
                {institution.is_verified && (
                  <BadgeCheck
                    size={20}
                    className="text-(--primary-700) shrink-0"
                  />
                )}
              </div>
              <p className="text-[14px] text-(--gray-400)">
                {INSTITUTION_TYPE_LABEL(institution.institution_type)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Left — overview / contact */}
        <div className="w-full lg:w-100 rounded-2xl bg-gray-100 p-6 lg:shrink-0">
          {institution.tagline && (
            <p className="text-[14px] lg:text-[16px] font-normal text-[#4e4758]">
              {institution.tagline}
            </p>
          )}

          <div className="mt-5 border-t border-dashed pt-5">
            <h3 className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
              Overview
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {location && (
                <li className="flex items-center gap-2 font-normal text-[14px] text-(--text-paragraph)">
                  <MapPin
                    size={16}
                    strokeWidth={1.5}
                    className="shrink-0 text-gray-500"
                  />
                  {location}
                </li>
              )}
              {institution.address && (
                <li className="flex items-start gap-2 font-normal text-[14px] text-(--text-paragraph)">
                  <MapPin
                    size={16}
                    strokeWidth={1.5}
                    className="shrink-0 text-gray-500 mt-0.5"
                  />
                  {institution.address}
                </li>
              )}
              {institution.founded_year != null && (
                <li className="flex items-center gap-2 font-normal text-[14px] text-(--text-paragraph)">
                  <CalendarDays
                    size={16}
                    strokeWidth={1.5}
                    className="shrink-0 text-gray-500"
                  />
                  Founded in {institution.founded_year}
                </li>
              )}
            </ul>
          </div>

          {(institution.contact_email || institution.contact_phone) && (
            <div className="mt-6 border-t border-dashed pt-5">
              <h3 className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
                Contact
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {institution.contact_email && (
                  <li className="flex items-center gap-2 font-normal text-[14px] text-(--text-paragraph)">
                    <Mail
                      size={16}
                      strokeWidth={1.5}
                      className="shrink-0 text-gray-500"
                    />
                    <a
                      href={`mailto:${institution.contact_email}`}
                      className="hover:underline"
                    >
                      {institution.contact_email}
                    </a>
                  </li>
                )}
                {institution.contact_phone && (
                  <li className="flex items-center gap-2 font-normal text-[14px] text-(--text-paragraph)">
                    <Phone
                      size={16}
                      strokeWidth={1.5}
                      className="shrink-0 text-gray-500"
                    />
                    {institution.contact_phone}
                  </li>
                )}
              </ul>
            </div>
          )}

          {(institution.linkedin_url || institution.website_url) && (
            <div className="mt-6 border-t border-dashed pt-5">
              <h3 className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
                Links
              </h3>
              <div className="mt-3 flex items-center gap-2">
                {institution.linkedin_url && (
                  <a
                    href={institution.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-6 w-6 p-1 items-center justify-center rounded-md border border-[#100d14] text-(--text-title) transition-colors hover:border-(--primary-700) hover:bg-(--primary-700) hover:text-white"
                  >
                    <FaLinkedinIn size={16} />
                  </a>
                )}
                {institution.website_url && (
                  <a
                    href={institution.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Website"
                    className="flex h-6 w-6 p-1 items-center justify-center rounded-md border border-[#100d14] text-(--text-title) transition-colors hover:border-(--primary-700) hover:bg-(--primary-700) hover:text-white"
                  >
                    <FiGlobe size={16} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right — about */}
        <div ref={contentRef} className="flex-1">
          {institution.description && (
            <>
              <h2 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
                About {institution.institution_name}
              </h2>
              <div
                className="mt-4 text-[14px] leading-[1.75] text-[#4e4758] wrap-break-word [&_p]:mb-3 last:[&_p]:mb-0 [&_pre]:whitespace-pre-wrap [&_pre]:wrap-break-word [&_pre]:overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: institution.description }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
