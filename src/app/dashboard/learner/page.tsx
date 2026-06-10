"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import LearnerStatsCards from "@/components/dashboard/learner/stats-cards";
import ContinueLearning from "@/components/dashboard/learner/continue-learning";
import AiRecommended from "@/components/dashboard/learner/ai-recommended";
import ProgressSkill from "@/components/dashboard/learner/progress-skill";
import RecentActivity from "@/components/dashboard/learner/recent-activity";

export default function LearnerDashboardPage() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      );
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          Welcome back, Al Amin.
        </h1>
        <p className=" text-[14px] text-(--text-paragraph) mt-0.5">
          You&apos;re on a 27-day streak. Keep the momentum going!
        </p>
      </div>

      {/* Stats row */}
      <LearnerStatsCards />

      {/* Continue Learning + Upcoming */}
      <ContinueLearning />

      {/* AI Recommended */}
      <AiRecommended />

      {/* Progress + Skill Gap */}
      <ProgressSkill />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
