"use client";

import { useEffect, useRef, useState } from "react";
import {
  Target,
  BookOpen,
  Check,
  Lock,
  Play,
  KeyRound,
  ChevronLeft,
  Loader2,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

import {
  useMyLearningPaths,
  useLearningPathProgress,
  useLearningPaths,
  useEnrollInLearningPath,
  useLeaveLearningPath,
} from "@/hooks/use-learning-paths";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type {
  MyLearningPath,
  LearningPathListItem,
  LearningPathMilestoneProgress,
  MilestoneStatus,
} from "@/lib/course-api";

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({ percent }: { percent: number }) {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!circleRef.current) return;
    const fill = (percent / 100) * CIRCUMFERENCE;
    gsap.fromTo(
      circleRef.current,
      { strokeDashoffset: CIRCUMFERENCE },
      {
        strokeDashoffset: CIRCUMFERENCE - fill,
        duration: 1.2,
        ease: "power2.out",
        delay: 0.2,
      },
    );
  }, [percent]);

  return (
    <div className="relative shrink-0 flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" className="-rotate-90">
        <defs>
          <linearGradient id="progress-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-500)" />
            <stop offset="100%" stopColor="var(--primary-700)" />
          </linearGradient>
        </defs>
        <circle
          cx="56"
          cy="56"
          r={RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          ref={circleRef}
          cx="56"
          cy="56"
          r={RADIUS}
          fill="none"
          stroke="url(#progress-ring-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-tight">
        <span className="text-[20px] lg:text-[24px] font-bold text-(--text-title)">
          {percent}%
        </span>
        <span className="text-[11px] text-(--gray-500)">complete</span>
      </div>
    </div>
  );
}

function statusNode(status: MilestoneStatus, index: number) {
  if (status === "completed") {
    return (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center z-10 shrink-0 bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-sm">
        <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
    );
  }
  if (status === "in_progress" || status === "available") {
    return (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center z-10 shrink-0 bg-gradient-to-br from-(--primary-500) to-(--primary-600) shadow-sm">
        <span className="text-[15px] font-bold text-white">{index + 1}</span>
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center z-10 shrink-0 bg-(--gray-200)">
      <Lock className="w-4 h-4 text-(--gray-400)" />
    </div>
  );
}

function statusBadge(status: MilestoneStatus) {
  if (status === "completed")
    return (
      <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        Completed
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="text-[12px] font-medium text-(--primary-600) bg-(--primary-100) border border-(--primary-200) px-2 py-0.5 rounded-full">
        In progress
      </span>
    );
  if (status === "available")
    return (
      <span className="text-[12px] font-medium text-(--primary-600) bg-(--primary-100) border border-(--primary-200) px-2 py-0.5 rounded-full">
        Up next
      </span>
    );
  return (
    <span className="text-[12px] font-medium text-(--gray-400) bg-(--gray-100) border border-(--gray-200) px-2 py-0.5 rounded-full">
      Locked
    </span>
  );
}

function MilestoneRow({
  milestone,
  index,
  isLast,
}: {
  milestone: LearningPathMilestoneProgress;
  index: number;
  isLast: boolean;
}) {
  const canOpen =
    milestone.status === "in_progress" || milestone.status === "completed";
  const href = `/dashboard/learner/course-player/${milestone.course.slug}`;

  return (
    <li className="milestone-row opacity-0 flex gap-4">
      <div className="relative flex flex-col items-center shrink-0 w-12">
        {statusNode(milestone.status, index)}
        {!isLast && (
          <div
            className={`w-1 flex-1 min-h-6 mt-1 rounded-full ${
              milestone.status === "completed"
                ? "bg-gradient-to-b from-emerald-400 to-emerald-200"
                : "bg-(--gray-200)"
            }`}
          />
        )}
      </div>

      <div
        className={`flex-1 min-w-0 mb-4 rounded-2xl border p-4 lg:p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200 ${
          milestone.status === "in_progress"
            ? "border-(--primary-300) bg-(--primary-50)"
            : milestone.status === "locked"
              ? "border-(--gray-200) bg-white opacity-60"
              : "border-(--gray-200) bg-white"
        }`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
              {milestone.title}
            </h3>
            {statusBadge(milestone.status)}
          </div>
          <p className="text-[12px] text-(--gray-400) mt-1.5 flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {milestone.course.title}
          </p>
        </div>

        <div className="shrink-0">
          {milestone.status === "locked" && (
            <Lock className="w-4 h-4 text-(--gray-300)" />
          )}
          {canOpen && (
            <Link
              href={href}
              className="flex items-center gap-2 text-[14px] font-medium text-white bg-gradient-to-br from-(--primary-500) to-(--primary-600) hover:from-(--primary-600) hover:to-(--primary-700) px-5 py-2 rounded-lg transition-all shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              {milestone.status === "completed" ? "Review" : "Continue"}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

function PathDetail({
  slug,
  onBack,
  onEnrollmentChange,
}: {
  slug: string;
  onBack: () => void;
  onEnrollmentChange?: () => void;
}) {
  const { data: path, isLoading } = useLearningPathProgress(slug);
  const enrollMutation = useEnrollInLearningPath();
  const leaveMutation = useLeaveLearningPath();
  const headerRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      );
    }, headerRef);
    return () => ctx.revert();
  }, [path?.slug]);

  useEffect(() => {
    if (!roadmapRef.current || !path) return;
    const rows = roadmapRef.current.querySelectorAll(".milestone-row");
    if (rows.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.killTweensOf(rows);
      gsap.fromTo(
        rows,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.08, ease: "power3.out", delay: 0.15 },
      );
    }, roadmapRef);
    return () => ctx.revert();
  }, [path]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-(--gray-400) text-[14px] py-12 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading path...
      </div>
    );
  }

  if (!path) {
    return (
      <p className="text-[14px] text-rose-500 py-12 text-center">
        Couldn&apos;t load this learning path.
      </p>
    );
  }

  const isEnrolled = path.is_enrolled;

  const handleEnroll = () => {
    enrollMutation.mutate(slug, {
      onSuccess: (message) => {
        notify.success(message || "Joined learning path.");
        onEnrollmentChange?.();
      },
      onError: (err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to join learning path.",
        ),
    });
  };

  const handleLeave = () => {
    leaveMutation.mutate(slug, {
      onSuccess: () => {
        notify.success("Left learning path.");
        onEnrollmentChange?.();
        onBack();
      },
      onError: (err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to leave learning path.",
        ),
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-(--gray-500) hover:text-(--text-title) cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <div
        ref={headerRef}
        className="opacity-0 bg-gradient-to-br from-(--primary-50) via-white to-white border border-(--gray-200) rounded-2xl p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm"
      >
        <div className="flex-1 min-w-0">
          <span className="flex items-center gap-1 w-fit text-[12px] font-semibold text-(--primary-600) bg-(--primary-50) px-2.5 py-1 rounded-full mb-3">
            <Target className="w-4 h-4" />
            Career Goal
          </span>
          <h2 className="text-[20px] lg:text-[28px] font-bold text-(--text-title)">
            {path.career_goal || path.title}
          </h2>
          {path.description && (
            <p className="text-[14px] text-(--gray-500) mt-2">{path.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-[12px] text-(--gray-500)">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-(--primary-400)" />
              {path.milestones.length} milestone
              {path.milestones.length === 1 ? "" : "s"}
            </span>
          </div>

          {path.skill_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {path.skill_tags.map((s) => (
                <span
                  key={s}
                  className="text-[12px] text-(--gray-500) font-normal border border-(--gray-200) px-3 py-1 rounded-full bg-(--gray-50)"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5">
            {isEnrolled ? (
              <button
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
                className="flex items-center gap-2 text-[13px] font-medium text-(--gray-500) border border-(--gray-200) hover:bg-(--gray-50) px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                <LogOut className="w-4 h-4" />
                Leave path
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrollMutation.isPending}
                className="flex items-center gap-2 text-[14px] font-semibold text-white bg-gradient-to-br from-(--primary-500) to-(--primary-600) hover:from-(--primary-600) hover:to-(--primary-700) px-5 py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {enrollMutation.isPending ? "Joining..." : "Join this path"}
              </button>
            )}
          </div>
        </div>

        <ProgressRing percent={path.progress_percent} />
      </div>

      <div>
        <h2 className="text-[18px] lg:text-[20px] font-semibold text-(--text-title) flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-(--primary-600)" />
          Roadmap
        </h2>
        <p className="text-[14px] text-(--gray-500) -mt-2 mb-5">
          {isEnrolled
            ? "Complete each milestone to unlock the next"
            : "Join this path to start tracking your progress"}
        </p>

        <ul ref={roadmapRef} className="space-y-0">
          {path.milestones.map((m, i) => (
            <MilestoneRow
              key={m.id}
              milestone={m}
              index={i}
              isLast={i === path.milestones.length - 1}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function PathCard({
  enrollment,
  onOpen,
}: {
  enrollment: MyLearningPath;
  onOpen: () => void;
}) {
  const { path } = enrollment;
  return (
    <button
      onClick={onOpen}
      className="learning-path-card opacity-0 text-left bg-white border border-(--gray-200) rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-(--primary-300) transition-all duration-200 cursor-pointer w-full"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="flex items-center gap-1 w-fit text-[11px] font-semibold text-(--primary-700) bg-gradient-to-br from-(--primary-50) to-(--primary-100) px-2 py-0.5 rounded-full mb-2">
            <Target className="w-3.5 h-3.5" />
            Career Goal
          </span>
          <h3 className="text-[16px] font-bold text-(--text-title) truncate">
            {path.career_goal || path.title}
          </h3>
          <p className="text-[12px] text-(--gray-500) mt-1">
            {path.milestones.length} milestone
            {path.milestones.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[18px] font-bold text-(--primary-600)">
            {path.progress_percent}%
          </p>
          <p className="text-[11px] text-(--gray-400)">complete</p>
        </div>
      </div>
    </button>
  );
}

function BrowseCard({
  path,
  onOpen,
}: {
  path: LearningPathListItem;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="learning-path-card opacity-0 text-left bg-white border border-(--gray-200) rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-(--primary-300) transition-all duration-200 cursor-pointer w-full"
    >
      <span className="flex items-center gap-1 w-fit text-[11px] font-semibold text-(--primary-700) bg-gradient-to-br from-(--primary-50) to-(--primary-100) px-2 py-0.5 rounded-full mb-2">
        <Target className="w-3.5 h-3.5" />
        Career Goal
      </span>
      <h3 className="text-[16px] font-bold text-(--text-title) truncate">
        {path.career_goal || path.title}
      </h3>
      {path.description && (
        <p className="text-[13px] text-(--gray-500) mt-1.5 line-clamp-2">
          {path.description}
        </p>
      )}
      <p className="text-[12px] text-(--gray-400) mt-3 flex items-center gap-1">
        <BookOpen className="w-3.5 h-3.5" />
        {path.milestone_count} milestone
        {path.milestone_count === 1 ? "" : "s"}
      </p>
    </button>
  );
}

type Tab = "mine" | "browse";

export default function LearningPathsPage() {
  const [tab, setTab] = useState<Tab>("mine");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { data: enrollments, isLoading: myLoading } = useMyLearningPaths();
  const { data: browsePage, isLoading: browseLoading } = useLearningPaths({
    page_size: 20,
  });

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".learning-path-card");
    if (cards.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.killTweensOf(cards);
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power3.out" },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [tab, enrollments, browsePage]);

  if (openSlug) {
    return (
      <div className="space-y-6">
        <PathDetail
          slug={openSlug}
          onBack={() => setOpenSlug(null)}
          onEnrollmentChange={() => setTab("mine")}
        />
      </div>
    );
  }

  const browseResults = browsePage?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          Learning Paths
        </h1>
        <p className="text-[14px] text-(--gray-500) mt-0.5">
          Guided, curated roadmaps toward a career goal.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-(--gray-200)">
        <button
          onClick={() => setTab("mine")}
          className={`px-4 py-2.5 text-[14px] font-medium cursor-pointer border-b-2 transition-colors -mb-px ${
            tab === "mine"
              ? "border-(--primary-600) text-(--primary-600)"
              : "border-transparent text-(--gray-500) hover:text-(--text-title)"
          }`}
        >
          My Paths
        </button>
        <button
          onClick={() => setTab("browse")}
          className={`px-4 py-2.5 text-[14px] font-medium cursor-pointer border-b-2 transition-colors -mb-px ${
            tab === "browse"
              ? "border-(--primary-600) text-(--primary-600)"
              : "border-transparent text-(--gray-500) hover:text-(--text-title)"
          }`}
        >
          Browse All
        </button>
      </div>

      {tab === "mine" ? (
        myLoading ? (
          <div className="flex items-center gap-2 text-(--gray-400) text-[14px] py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading your paths...
          </div>
        ) : !enrollments || enrollments.length === 0 ? (
          <div className="bg-white border border-(--gray-200) rounded-2xl p-8 text-center">
            <p className="text-[14px] text-(--gray-500) mb-4">
              You&apos;re not enrolled in any learning path yet.
            </p>
            <button
              onClick={() => setTab("browse")}
              className="inline-flex items-center gap-2 bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Browse learning paths
            </button>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((e) => (
              <PathCard
                key={e.id}
                enrollment={e}
                onOpen={() => setOpenSlug(e.path.slug)}
              />
            ))}
          </div>
        )
      ) : browseLoading ? (
        <div className="flex items-center gap-2 text-(--gray-400) text-[14px] py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading learning paths...
        </div>
      ) : browseResults.length === 0 ? (
        <div className="bg-white border border-(--gray-200) rounded-2xl p-8 text-center">
          <p className="text-[14px] text-(--gray-500)">
            No learning paths are published yet.
          </p>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {browseResults.map((p) => (
            <BrowseCard key={p.id} path={p} onOpen={() => setOpenSlug(p.slug)} />
          ))}
        </div>
      )}
    </div>
  );
}
