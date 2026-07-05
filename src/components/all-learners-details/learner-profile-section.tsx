"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { MapPin, GraduationCap, Briefcase, Target } from "lucide-react";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";
import { gsap, prepareGsap } from "@/lib/gsap";
import { mediaUrl, initialsOf } from "@/components/dashboard/settings-shared/helpers";
import { EXPERIENCE_LEVELS, DEGREE_OPTIONS } from "@/lib/profile-api";
import type { PublicLearnerProfile } from "@/lib/profile-api";

type Props = { learner: PublicLearnerProfile };

const EXPERIENCE_LABEL = (v: string) =>
  EXPERIENCE_LEVELS.find((o) => o.value === v)?.label ?? v;

const DEGREE_LABEL = (v: string) =>
  DEGREE_OPTIONS.find((o) => o.value === v)?.label ?? v;

function formatDateRange(start: string, end: string | null, isCurrent: boolean) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  return `${fmt(start)} — ${isCurrent ? "Present" : end ? fmt(end) : ""}`;
}

export function LearnerProfileSection({ learner }: Props) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const photoUrl = mediaUrl(learner.profile_photo);
  const location = [learner.city, learner.state, learner.country]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    if (!sectionRef.current) return;
    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
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
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Left — profile card */}
        <div
          ref={cardRef}
          className="w-full lg:w-100 rounded-2xl bg-gray-100 p-6 lg:shrink-0"
        >
          <div className="relative overflow-hidden rounded-xl aspect-4/5 bg-(--gray-200) flex items-center justify-center">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={learner.full_name}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover object-top"
                loading="eager"
                priority
              />
            ) : (
              <span className="text-[64px] font-semibold text-(--primary-700)">
                {initialsOf(learner.full_name)}
              </span>
            )}
          </div>

          <h2 className="mt-4 text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            {learner.full_name}
          </h2>
          {learner.headline && (
            <p className="mt-2 text-[14px] lg:text-[16px] font-normal text-[#4e4758]">
              {learner.headline}
            </p>
          )}

          <div className="mt-5 border-t border-dashed pt-5">
            <h3 className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
              Overview
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {location && (
                <li className="flex items-center gap-2 font-normal text-[14px] text-(--text-paragraph)">
                  <MapPin size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" />
                  {location}
                </li>
              )}
              {learner.experience_level && (
                <li className="flex items-center gap-2 font-normal text-[14px] text-(--text-paragraph)">
                  <Briefcase size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" />
                  {EXPERIENCE_LABEL(learner.experience_level)}
                </li>
              )}
              {learner.learning_goal && (
                <li className="flex items-center gap-2 font-normal text-[14px] text-(--text-paragraph)">
                  <Target size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" />
                  {learner.learning_goal}
                </li>
              )}
            </ul>
          </div>

          {learner.interests.length > 0 && (
            <div className="mt-6 border-t border-dashed pt-5">
              <h3 className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
                Interests
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {learner.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-full bg-white border border-(--gray-200) text-[12px] text-(--text-paragraph)"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(learner.linkedin_url || learner.github_url || learner.website_url) && (
            <div className="mt-6 border-t border-dashed pt-5">
              <h3 className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
                Social Media
              </h3>
              <div className="mt-3 flex items-center gap-2">
                {learner.linkedin_url && (
                  <a
                    href={learner.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-6 w-6 p-1 items-center justify-center rounded-md border border-[#100d14] text-(--text-title) transition-colors hover:border-(--primary-700) hover:bg-(--primary-700) hover:text-white"
                  >
                    <FaLinkedinIn size={16} />
                  </a>
                )}
                {learner.github_url && (
                  <a
                    href={learner.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="flex h-6 w-6 p-1 items-center justify-center rounded-md border border-[#100d14] text-(--text-title) transition-colors hover:border-(--primary-700) hover:bg-(--primary-700) hover:text-white"
                  >
                    <FaGithub size={16} />
                  </a>
                )}
                {learner.website_url && (
                  <a
                    href={learner.website_url}
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

        {/* Right — about, education, work experience */}
        <div ref={contentRef} className="flex-1">
          {learner.bio && (
            <>
              <h2 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
                About {learner.full_name}
              </h2>
              <div
                className="mt-4 text-[14px] leading-[1.75] text-[#4e4758] [&_p]:mb-3 last:[&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: learner.bio }}
              />
            </>
          )}

          {learner.education.length > 0 && (
            <>
              <h3 className="mt-8 lg:mt-10 text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
                Education
              </h3>
              <ul className="mt-4 flex flex-col gap-4">
                {learner.education.map((edu, i) => (
                  <li
                    key={edu.id ?? `${edu.institution}-${edu.start_date}-${i}`}
                    className="flex items-start gap-3"
                  >
                    <GraduationCap
                      size={20}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-(--primary-700)"
                    />
                    <div>
                      <p className="text-[16px] font-semibold text-(--text-title)">
                        {DEGREE_LABEL(edu.degree)}
                        {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                      </p>
                      <p className="text-[14px] text-[#4e4758]">{edu.institution}</p>
                      <p className="text-[13px] text-(--gray-400)">
                        {formatDateRange(edu.start_date, edu.end_date, edu.is_current)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {learner.work_experience.length > 0 && (
            <>
              <h3 className="mt-8 lg:mt-10 text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
                Work Experience
              </h3>
              <ul className="mt-4 flex flex-col gap-4">
                {learner.work_experience.map((exp, i) => (
                  <li
                    key={exp.id ?? `${exp.company}-${exp.start_date}-${i}`}
                    className="flex items-start gap-3"
                  >
                    <Briefcase
                      size={20}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-(--primary-700)"
                    />
                    <div>
                      <p className="text-[16px] font-semibold text-(--text-title)">
                        {exp.job_title}
                      </p>
                      <p className="text-[14px] text-[#4e4758]">
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </p>
                      <p className="text-[13px] text-(--gray-400)">
                        {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
