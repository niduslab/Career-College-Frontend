"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Flame, Award, BookOpen, KeyRound, Loader2, ArrowRight } from "lucide-react";
import gsap from "gsap";

import { useLearnerSummary } from "@/hooks/use-learner-dashboard";
import { useMyLearningPaths } from "@/hooks/use-learning-paths";
import { useMyCertificates } from "@/hooks/use-certificates";
import { CertificateCard } from "@/components/dashboard/learner/certificates";

// Page component
//
// The original mock here had an XP/Level ring, 9 fake badges, a global rank,
// and a leaderboard — none of that is backed by any real data. The backend
// deliberately has no XP/points ledger or badge model (see
// docs/architecture/27-learner-dashboard.md §10 "Not built" and
// 28-learning-paths.md — same honesty rule: don't invent numbers that would
// need a new ledger model to be real). This page only shows counters that
// already exist and are already correct elsewhere in the dashboard.

export default function AchievementsPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { data: summary, isLoading: summaryLoading } = useLearnerSummary();
  const { data: paths, isLoading: pathsLoading } = useMyLearningPaths();
  const { data: certPage, isLoading: certsLoading } = useMyCertificates({
    page_size: 3,
  });
  const certificates = certPage?.results ?? [];
  const totalCertificates = certPage?.count ?? 0;

  const pathsCompleted =
    paths?.filter((p) => p.path.progress_percent === 100).length ?? 0;

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4 },
    ).fromTo(
      cardsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4 },
      "-=0.2",
    );
  }, []);

  const isLoading = summaryLoading || pathsLoading;

  const STATS = [
    {
      icon: Flame,
      iconFill: true,
      label: "Day Streak",
      value: summary?.day_streak ?? 0,
      badge: summary?.day_streak_is_approximate
        ? `approx. · ${summary.day_streak_timezone}`
        : "consecutive days",
    },
    {
      icon: BookOpen,
      iconFill: false,
      label: "Courses Completed",
      value: summary?.courses_completed ?? 0,
      badge: `${summary?.courses_in_progress ?? 0} in progress`,
    },
    {
      icon: Award,
      iconFill: false,
      label: "Certificates",
      value: summary?.certificates_earned ?? 0,
      badge: "earned",
    },
    {
      icon: KeyRound,
      iconFill: false,
      label: "Learning Paths",
      value: pathsCompleted,
      badge: "completed",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-bold text-(--text-title)">
          Achievements
        </h1>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-0.5">
          Your real learning milestones, at a glance.
        </p>
      </div>

      {/* Stats */}
      <div
        ref={cardsRef}
        className="opacity-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-16 text-(--gray-400)">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                      {s.label}
                    </p>
                    <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                      {s.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                    <Icon
                      className="w-6 h-6 text-(--primary-600)"
                      fill={s.iconFill ? "currentColor" : "none"}
                    />
                  </div>
                </div>

                <div className="border border-dashed border-gray-200 my-1" />

                <p className="text-[12px] font-medium text-(--success-500)">
                  {s.badge}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Certificates preview */}
      <div className="bg-white rounded-2xl border border-(--gray-200) p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-(--primary-600)" />
            <h2 className="text-[18px] md:text-[20px] font-semibold text-(--text-title)">
              Certificates
            </h2>
          </div>
          <Link
            href="/dashboard/learner/certificates"
            className="flex items-center gap-1 text-[13px] font-semibold text-(--primary-600) hover:underline"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {certsLoading ? (
          <div className="flex items-center justify-center py-10 text-(--gray-400)">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : certificates.length === 0 ? (
          <p className="text-[14px] text-(--gray-400) text-center py-10">
            No certificates yet. Finish a course to earn your first one.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <CertificateCard key={cert.certificate_uid} cert={cert} />
            ))}
          </div>
        )}
        {totalCertificates > certificates.length && (
          <p className="text-[12px] text-(--gray-400) text-center mt-4">
            Showing {certificates.length} of {totalCertificates}
          </p>
        )}
      </div>
    </div>
  );
}
