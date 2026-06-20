"use client";

import { useEffect, useRef } from "react";
import {
  Sparkles,
  Target,
  Calendar,
  BookOpen,
  Check,
  Lock,
  Play,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import gsap from "gsap";
import { useRouter } from "next/navigation";

const skills = [
  "Python",
  "Machine Learning",
  "Deep Learning",
  "MLOps",
  "Statistics",
  "Cloud",
];

type MilestoneStatus = "completed" | "in_progress" | "locked";

const milestones: {
  number: number;
  title: string;
  sub: string;
  courses: number;
  status: MilestoneStatus;
}[] = [
  {
    number: 1,
    title: "Programming Foundations",
    sub: "Python, Git & tooling",
    courses: 2,
    status: "completed",
  },
  {
    number: 2,
    title: "Data & Statistics",
    sub: "SQL, stats, analytics",
    courses: 3,
    status: "completed",
  },
  {
    number: 3,
    title: "Machine Learning Core",
    sub: "Supervised, unsupervised, ensembles",
    courses: 4,
    status: "in_progress",
  },
  {
    number: 4,
    title: "Deep Learning",
    sub: "Neural nets, CNNs, transformers",
    courses: 3,
    status: "locked",
  },
  {
    number: 5,
    title: "MLOps & Deployment",
    sub: "Pipelines, serving, monitoring",
    courses: 2,
    status: "locked",
  },
  {
    number: 6,
    title: "Capstone Project",
    sub: "End-to-end ML system build",
    courses: 1,
    status: "locked",
  },
];

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PCT = 58;

export default function LearningPathsPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Hero card slide down
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
      );
    }

    // Ring draw
    if (circleRef.current) {
      const fill = (PCT / 100) * CIRCUMFERENCE;
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: CIRCUMFERENCE },
        {
          strokeDashoffset: CIRCUMFERENCE - fill,
          duration: 1.4,
          ease: "power2.out",
          delay: 0.4,
        },
      );
    }

    // Milestone rows stagger
    if (listRef.current) {
      const rows = listRef.current.querySelectorAll(".milestone-row");
      gsap.fromTo(
        rows,
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.3,
        },
      );
    }

    // Connector lines draw downward
    const lines = linesRef.current.filter(Boolean);
    gsap.fromTo(
      lines,
      { scaleY: 0, transformOrigin: "top center" },
      {
        scaleY: 1,
        duration: 0.35,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.5,
      },
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            Learning Path
          </h1>
          <p className="text-[14px] text-(--gray-500) mt-0.5">
            Your guided roadmap to becoming an AI/ML Engineer.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/learner/ai-assistant")}
          className="self-start flex items-center cursor-pointer gap-2 border border-(--primary-200) bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-700)  text-[14px] font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap">
          <Sparkles className="w-4 h-4" />
          Adjust with AI
        </button>
      </div>

      {/* Hero career goal card */}
      <div
        ref={heroRef}
        className="opacity-0 bg-white border border-(--gray-200) rounded-2xl p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1 text-[12px] font-semibold text-(--primary-600) bg-(--primary-50) px-2.5 py-1 rounded-full">
              <Target className="w-4 h-4" />
              Career Goal
            </span>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Sparkles className="w-4 h-4" />
              AI-optimized
            </span>
          </div>

          <h2 className="text-[20px] lg:text-[28px] font-bold text-(--text-title)">
            AI/ML Engineer
          </h2>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-[12px] text-(--gray-500)">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-(--primary-400)" />6 milestones
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-(--primary-400)" />
              Est. completion Nov 2026
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-(--primary-400)" />
              15 courses
            </span>
          </div>

          {/* Skill pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {skills.map((s) => (
              <span
                key={s}
                className="text-[12px] text-(--gray-500) font-normal border border-(--gray-200) px-3 py-1 rounded-full bg-(--gray-50)"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Progress ring */}
        <div className="relative shrink-0 flex items-center justify-center w-28 h-28">
          <svg width="112" height="112" className="-rotate-90">
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
              stroke="var(--primary-600)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE}
            />
          </svg>
          <div className="absolute flex flex-col items-center leading-tight">
            <span className="text-[20px] lg:text-[24px] font-bold text-(--text-title)">
              {PCT}%
            </span>
            <span className="text-[11px] text-(--gray-500)">complete</span>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div>
        <h2 className="text-[18px] lg:text-[20px] font-semibold text-(--text-title) flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-(--primary-600)" />
          Your Roadmap
        </h2>
        <p className="text-[14px] text-(--gray-500) -mt-2 mb-5">
          Complete each milestone to unlock the next
        </p>

        <ul ref={listRef} className="space-y-0">
          {milestones.map((m, i) => {
            const isLast = i === milestones.length - 1;
            return (
              <li key={m.number} className="milestone-row opacity-0 flex gap-4">
                {/* Step indicator + connector */}
                <div className="relative flex flex-col items-center shrink-0 w-12">
                  {/* Node */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center z-10 shrink-0 ${
                      m.status === "completed"
                        ? "bg-emerald-500"
                        : m.status === "in_progress"
                          ? "bg-(--primary-600)"
                          : "bg-(--gray-200)"
                    }`}
                  >
                    {m.status === "completed" ? (
                      <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                    ) : m.status === "in_progress" ? (
                      <span className="text-[15px] font-bold text-white">
                        {m.number}
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-(--gray-400)" />
                    )}
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div
                      ref={(el) => {
                        linesRef.current[i] = el;
                      }}
                      className={`w-0.5 flex-1 min-h-6 mt-1 ${
                        m.status === "completed"
                          ? "bg-emerald-400"
                          : "bg-(--gray-200)"
                      }`}
                    />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 min-w-0 mb-4 rounded-2xl border p-4 lg:p-5 flex items-center justify-between gap-4 transition-shadow ${
                    m.status === "in_progress"
                      ? "border-(--primary-300) bg-(--primary-50) shadow-sm"
                      : m.status === "locked"
                        ? "border-(--gray-200) bg-white opacity-60"
                        : "border-(--gray-200) bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
                        {m.title}
                      </h3>
                      {m.status === "completed" && (
                        <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                      {m.status === "in_progress" && (
                        <span className="text-[12px] font-medium text-(--primary-600) bg-(--primary-100) border border-(--primary-200) px-2 py-0.5 rounded-full">
                          In progress
                        </span>
                      )}
                      {m.status === "locked" && (
                        <span className="text-[12px] font-medium text-(--gray-400) bg-(--gray-100) border border-(--gray-200) px-2 py-0.5 rounded-full">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] text-(--gray-500)">{m.sub}</p>
                    <p className="text-[12px] text-(--gray-400) mt-1.5 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {m.courses} courses
                    </p>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {m.status === "completed" && (
                      <button className="flex items-center gap-1.5 text-[14px] font-medium text-(--gray-500) border border-(--gray-200) bg-white hover:bg-(--gray-50) px-4 py-2 rounded-lg transition-colors">
                        <RotateCcw className="w-4 h-4" />
                        Review
                      </button>
                    )}
                    {m.status === "in_progress" && (
                      <button className="flex items-center gap-2 text-[14px] font-medium text-white bg-(--primary-600) hover:bg-(--primary-700) px-5 py-2 rounded-lg transition-colors">
                        <Play className="w-4 h-4 fill-current" />
                        Continue
                      </button>
                    )}
                    {m.status === "locked" && (
                      <Lock className="w-4 h-4 text-(--gray-300)" />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
