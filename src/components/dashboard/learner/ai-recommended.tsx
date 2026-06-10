"use client";

import { useEffect, useRef } from "react";
import { Sparkles, Globe, Target, ArrowRight, Lightbulb } from "lucide-react";
import gsap from "gsap";

const courses = [
  {
    title: "Generative AI & LLMs in Production",
    reason: "Builds on your ML progress",
    match: "96% match",
    gradient: "linear-gradient(135deg,#7C3AED,#C026D3)",
    Icon: Sparkles,
  },
  {
    title: "MLOps & Model Deployment",
    reason: "Fills your deployment skill gap",
    match: "91% match",
    gradient: "linear-gradient(135deg, #6366F1, #3B82F6)",
    Icon: Globe,
  },
  {
    title: "Advanced Feature Engineering",
    reason: "Recommended for your career goal",
    match: "88% match",
    gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
    Icon: Target,
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        {courses.map((course) => {
          const Icon = course.Icon;
          return (
            <div
              key={course.title}
              className=" bg-white rounded-2xl border border-(--gray-200) overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
            >
              {/* Gradient thumbnail */}
              <div
                className="relative h-36 flex items-center justify-center overflow-hidden"
                style={{ background: course.gradient }}
              >
                {/* stripe texture */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.07) 0px, rgba(255, 255, 255, 0.07) 12px, transparent 12px, transparent 24px)",
                  }}
                />
                <Icon className="w-10 h-10 text-white/80 relative z-10" />
                <span className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/40 backdrop-blur-sm text-white text-[12px] font-semibold px-2.5 py-1 rounded-full">
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
          );
        })}
      </div>
    </div>
  );
}
