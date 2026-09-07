"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/lib/use-auth";
import { useLearnerSummary } from "@/hooks/use-learner-dashboard";
import LearnerStatsCards from "@/components/dashboard/learner/stats-cards";
import ContinueLearning from "@/components/dashboard/learner/continue-learning";
import AiRecommended from "@/components/dashboard/learner/ai-recommended";
import ProgressSkill from "@/components/dashboard/learner/progress-skill";
import RecentActivity from "@/components/dashboard/learner/recent-activity";

export default function LearnerDashboardPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth({ withUser: true });
  const { data: summary } = useLearnerSummary();

  const firstName = user?.full_name?.split(" ")[0];
  const streak = summary?.day_streak;

  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[22px] lg:text-[28px] font-bold text-(--text-title) tracking-tight">
          Welcome back{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className=" text-[14px] text-(--text-paragraph) mt-0.5">
          {streak && streak > 0
            ? `You're on a ${streak}-day streak. Keep the momentum going!`
            : "Pick up where you left off and keep the momentum going."}
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
