"use client";

import { useEffect, useRef } from "react";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import course1 from "@/assets/images/popular-courses/image1.webp";
import course2 from "@/assets/images/popular-courses/image2.webp";
import course3 from "@/assets/images/popular-courses/image3.webp";

const courses = [
  {
    title: "Generative AI & LLMs in Production",
    reason: "Builds on your ML progress",
    match: "96% match",
    image: course1,
  },
  {
    title: "MLOps & Model Deployment",
    reason: "Fills your deployment skill gap",
    match: "91% match",
    image: course2,
  },
  {
    title: "Advanced Feature Engineering",
    reason: "Recommended for your career goal",
    match: "88% match",
    image: course3,
  },
];

export default function AiRecommended() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll(".rec-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
      },
    );
  }, []);

  return (
    <div ref={sectionRef}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[18px] lg:text-[20px]  font-semibold text-(--text-title) flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-700)" />
            AI Recommended for You
          </h2>
          <p className="text-[12px] lg:text-[14px] text-(--gray-500) mt-0.5">
            Personalized from your progress, goals &amp; skill gaps
          </p>
        </div>
        <button className="flex items-center gap-1.5  text-[12px] truncate lg:text-[14px] font-semibold text-(--text-title) border border-(--gray-200) px-4 py-2 rounded-lg hover:bg-(--gray-50) transition-colors">
          Explore catalog
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.title}
            className="rec-card bg-white rounded-2xl border border-(--gray-200) overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative h-44 overflow-hidden">
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* dark gradient overlay for badge readability */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[12px] font-semibold px-2.5 py-1 rounded-full">
                <Sparkles className="w-4 h-4" />
                {course.match}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title) leading-snug group-hover:text-(--primary-600) transition-colors">
                {course.title}
              </h3>
              <p className="text-[12px] text-(--gray-500) mt-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-(--primary-600) shrink-0" />
                {course.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
