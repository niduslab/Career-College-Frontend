"use client";

import { useEffect, useRef } from "react";
import { Sparkles, Globe, Target, ArrowRight, Lightbulb } from "lucide-react";
import gsap from "gsap";

const courses = [
  {
    title: "Generative AI & LLMs in Production",
    reason: "Builds on your ML progress",
    match: "96% match",
    gradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
    Icon: Sparkles,
  },
  {
    title: "MLOps & Model Deployment",
    reason: "Fills your deployment skill gap",
    match: "91% match",
    gradient: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
    Icon: Globe,
  },
  {
    title: "Advanced Feature Engineering",
    reason: "Recommended for your career goal",
    match: "88% match",
    gradient: "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
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
          <h2 className="text-[18px] font-semibold text-(--text-title) flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-(--primary-600)" />
            AI Recommended for You
          </h2>
          <p className="text-[13px] text-(--gray-500) mt-0.5">
            Personalized from your progress, goals &amp; skill gaps
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-[13px] font-semibold text-(--text-title) border border-(--gray-200) px-4 py-2 rounded-xl hover:bg-(--gray-50) transition-colors">
          Explore catalog
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((course) => {
          const Icon = course.Icon;
          return (
            <div
              key={course.title}
              className="rec-card opacity-0 bg-white rounded-2xl border border-(--gray-200) overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
            >
              {/* Gradient thumbnail */}
              <div
                className="relative h-36 flex items-center justify-center overflow-hidden"
                style={{ background: course.gradient }}
              >
                {/* stripe texture */}
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
                    backgroundSize: "12px 12px",
                  }}
                />
                <Icon className="w-10 h-10 text-white/80 relative z-10" />
                <span className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  {course.match}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-[14px] font-semibold text-(--text-title) leading-snug group-hover:text-(--primary-600) transition-colors">
                  {course.title}
                </h3>
                <p className="text-[12px] text-(--gray-500) mt-1.5 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-(--primary-400) shrink-0" />
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
