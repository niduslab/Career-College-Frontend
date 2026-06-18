"use client";

import { useEffect, useRef, useState } from "react";
import {
  Trophy,
  Play,
  Flame,
  Target,
  Moon,
  Award,
  MessageCircle,
  Sparkles,
  SplinePointer,
  BookOpen,
  Lock,
  Zap,
  Star,
} from "lucide-react";
import gsap from "gsap";

// ── Data ────────────────────────────────────────────────────────────────────

const badges = [
  {
    icon: Play,
    label: "First Step",
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    earned: true,
  },
  {
    icon: Flame,
    label: "7-Day Streak",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    earned: true,
  },
  {
    icon: Target,
    label: "Goal Setter",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    earned: true,
  },
  {
    icon: Moon,
    label: "Night Owl",
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    earned: true,
  },
  {
    icon: Award,
    label: "Top Scorer",
    color: "text-pink-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    earned: true,
  },
  {
    icon: MessageCircle,
    label: "Collaborator",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    earned: true,
  },
  {
    icon: BookOpen,
    label: "Bookworm",
    color: "text-(--gray-300)",
    bg: "bg-(--gray-50)",
    border: "border-(--gray-200)",
    earned: false,
  },
  {
    icon: Sparkles,
    label: "AI Pioneer",
    color: "text-(--gray-300)",
    bg: "bg-(--gray-50)",
    border: "border-(--gray-200)",
    earned: false,
  },
  {
    icon: Trophy,
    label: "Champion",
    color: "text-(--gray-300)",
    bg: "bg-(--gray-50)",
    border: "border-(--gray-200)",
    earned: false,
  },
];

const skills = [
  {
    label: "Machine Learning",
    pct: 82,
    status: "Strong",
    statusColor: "text-(--primary-600)",
  },
  {
    label: "Data Visualization",
    pct: 64,
    status: "Growing",
    statusColor: "text-(--primary-600)",
  },
  {
    label: "Deep Learning",
    pct: 71,
    status: "Growing",
    statusColor: "text-(--primary-600)",
  },
  {
    label: "MLOps / Deployment",
    pct: 34,
    status: "Needs work",
    statusColor: "text-(--primary-600)",
  },
  {
    label: "Statistics",
    pct: 78,
    status: "Strong",
    statusColor: "text-(--primary-600)",
  },
];

// Mon–Sun activity minutes this week
const weekActivity = [
  { day: "Mon", min: 45, active: true },
  { day: "Tue", min: 30, active: true },
  { day: "Wed", min: 60, active: true },
  { day: "Thu", min: 20, active: true },
  { day: "Fri", min: 50, active: true },
  { day: "Sat", min: 0, active: false },
  { day: "Sun", min: 0, active: false },
];

const MAX_MIN = Math.max(...weekActivity.map((d) => d.min), 1);

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const XP = 8420;
const XP_MAX = 10000;
const PCT = Math.round((XP / XP_MAX) * 100);

function barColor(status: string) {
  if (status === "Strong") return "var(--primary-600)";
  if (status === "Needs work") return "var(--primary-600)";
  return "var(--primary-600)";
}

// Component

export default function ProgressSkill() {
  const progressRef = useRef<HTMLDivElement>(null);
  const skillRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const xpBarRef = useRef<HTMLDivElement>(null);
  const readinessRef = useRef<SVGCircleElement>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    // Level ring
    if (circleRef.current) {
      const fill = (XP / XP_MAX) * CIRCUMFERENCE;
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: CIRCUMFERENCE },
        {
          strokeDashoffset: CIRCUMFERENCE - fill,
          duration: 1.6,
          ease: "power2.out",
          delay: 0.3,
        },
      );
    }

    // Readiness ring
    if (readinessRef.current) {
      const r = 26;
      const circ = 2 * Math.PI * r;
      gsap.fromTo(
        readinessRef.current,
        { strokeDashoffset: circ },
        {
          strokeDashoffset: circ * (1 - 0.66),
          duration: 1.6,
          ease: "power2.out",
          delay: 0.3,
        },
      );
    }

    // XP bar
    if (xpBarRef.current) {
      gsap.fromTo(
        xpBarRef.current,
        { width: "0%" },
        { width: `${PCT}%`, duration: 1.6, ease: "power2.out", delay: 0.3 },
      );
    }

    // Skill bars
    if (skillRef.current) {
      const bars =
        skillRef.current.querySelectorAll<HTMLElement>(".skill-bar-fill");
      gsap.fromTo(
        bars,
        { width: "0%" },
        {
          width: (i) => `${skills[i].pct}%`,
          duration: 1.1,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.4,
        },
      );
    }

    // Fade in panels
    const els = [progressRef.current, skillRef.current].filter(Boolean);
    gsap.fromTo(
      els,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.15,
      },
    );
  }, []);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Your Progress */}
      <div
        ref={progressRef}
        className="opacity-0 flex-1 bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6 flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] lg:text-[18px] font-semibold text-(--text-title) flex items-center gap-2">
            <Trophy className="w-5 h-5 text-(--primary-600)" />
            Your Progress
          </h3>
          <button className="text-[13px] font-semibold cursor-pointer text-(--primary-600) hover:underline">
            View all
          </button>
        </div>

        {/* Level ring + XP + streak row */}
        <div className="flex items-center gap-4">
          {/* Ring */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg width="104" height="104" className="-rotate-90">
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary-700)" />
                  <stop offset="100%" stopColor="var(--primary-400)" />
                </linearGradient>
              </defs>
              <circle
                cx="52"
                cy="52"
                r={RADIUS}
                fill="none"
                stroke="var(--primary-100)"
                strokeWidth="8"
              />
              <circle
                ref={circleRef}
                cx="52"
                cy="52"
                r={RADIUS}
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[20px] font-extrabold text-(--text-title) leading-none">
                14
              </span>
              <span className="text-[10px] font-bold text-(--primary-600) uppercase tracking-wide mt-0.5">
                Level
              </span>
              <span className="text-[9px] text-(--gray-400)">Pathfinder</span>
            </div>
          </div>

          {/* XP bar + stats */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {/* XP */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-(--text-title)">
                  XP to Level 15
                </span>
                <span className="text-[12px] font-bold text-(--primary-600)">
                  {PCT}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-(--primary-50) overflow-hidden">
                <div
                  ref={xpBarRef}
                  className="h-2.5 rounded-full"
                  style={{
                    width: "0%",
                    background:
                      "linear-gradient(90deg, var(--primary-700), var(--primary-400))",
                  }}
                />
              </div>
              <p className="text-[10px] text-(--gray-400) mt-0.5">
                {XP.toLocaleString()} / {XP_MAX.toLocaleString()} XP ·{" "}
                {(XP_MAX - XP).toLocaleString()} remaining
              </p>
            </div>

            {/* 3 stat pills */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
              {[
                {
                  icon: Trophy,
                  label: "Rank",
                  value: "#12",
                  accent: "var(--primary-600)",
                },
                {
                  icon: Award,
                  label: "Badges",
                  value: `${earnedCount}/9`,
                  accent: "var(--primary-600)",
                },
                {
                  icon: BookOpen,
                  label: "Completed",
                  value: "18",
                  accent: "var(--primary-600)",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-(--gray-50) rounded-xl px-2.5 py-2 border border-(--gray-100)"
                >
                  <div className="flex items-center gap-1 text-[10px] text-(--gray-500) font-medium mb-0.5">
                    <Icon className="w-3 h-3 text-(--primary-600)" />
                    {label}
                  </div>
                  <p className="text-[16px] font-extrabold text-(--text-title) leading-none">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Streak + weekly activity */}
        <div className="rounded-2xl bg-(--gray-50) border border-(--gray-100) px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-(--text-title) leading-none">
                  12-Day Streak
                </p>
                <p className="text-[10px] text-(--gray-400) mt-0.5">
                  Keep it going!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-(--primary-50) border border-(--primary-100) px-2.5 py-1 rounded-full">
              <Zap className="w-3 h-3 text-(--primary-600)" />
              <span className="text-[11px] font-bold text-(--primary-600)">
                205 min this week
              </span>
            </div>
          </div>
          {/* Activity bars */}
          <div className="flex items-end gap-1.5">
            {weekActivity.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="w-full rounded-t-md overflow-hidden bg-(--gray-200) h-9">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height:
                        d.min > 0
                          ? `${Math.round((d.min / MAX_MIN) * 100)}%`
                          : "0%",
                      background: d.active
                        ? "linear-gradient(180deg, var(--primary-400), var(--primary-600))"
                        : "transparent",
                      marginTop: "auto",
                    }}
                  />
                </div>
                <span className="text-[9px] text-(--gray-400) font-medium">
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next milestone */}
        <div className="rounded-2xl border border-(--primary-100) bg-(--primary-50) px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-(--primary-200) flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-(--primary-600)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-(--text-title)">
              Next: Bookworm Badge
            </p>
            <p className="text-[11px] text-(--gray-500) mt-0.5">
              Read 2 more articles to unlock
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[13px] font-bold text-(--primary-600)">3/5</p>
            <p className="text-[10px] text-(--gray-400)">articles</p>
          </div>
        </div>

        {/* Badges */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[13px] font-semibold text-(--text-title)">
              Badges
            </p>
            <span className="text-[11px] text-(--gray-400)">
              {earnedCount} of {badges.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-16 gap-4">
            {badges.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="relative flex flex-col items-center cursor-pointer"
                  onMouseEnter={() => setTooltip(b.label)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                      b.earned
                        ? `${b.bg} ${b.border} hover:scale-110`
                        : "bg-(--gray-50) border-dashed border-(--gray-200)"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${b.color}`} />
                    {!b.earned && (
                      <Lock className="absolute bottom-0 right-0 w-2.5 h-2.5 text-(--gray-300)" />
                    )}
                  </div>
                  {tooltip === b.label && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 bg-(--gray-800) text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg pointer-events-none">
                      {b.label}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-(--gray-800)" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div
        ref={skillRef}
        className="opacity-0 flex-1 bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6 flex flex-col gap-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[16px] lg:text-[18px] font-bold text-(--text-title) flex items-center gap-2">
              <Target className="w-5 h-5 text-(--primary-600)" />
              Skill Gap Analysis
            </h3>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              Toward your AI/ML Engineer goal
            </p>
          </div>
          <span className="flex items-center gap-1 text-[12px] font-semibold text-(--primary-600) bg-(--primary-50) border border-(--primary-100) px-2.5 py-1 rounded-lg">
            <Sparkles className="w-4 h-4" /> AI
          </span>
        </div>

        {/* Overall readiness */}
        <div className="rounded-2xl bg-(--gray-50) border border-(--gray-100) px-4 py-3 flex items-center gap-4">
          <div className="relative shrink-0 flex items-center justify-center">
            <svg width="64" height="64" className="-rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="var(--gray-200)"
                strokeWidth="6"
              />
              <circle
                ref={readinessRef}
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="var(--primary-600)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26}
              />
            </svg>
            <span className="absolute text-[14px] font-bold text-(--text-title)">
              66%
            </span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-(--text-title)">
              Overall Readiness
            </p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              You&apos;re 66% ready for AI/ML Engineer roles
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-(--success-500)/10 text-(--success-500) border border-(--success-500)/20">
                3 Strong
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-(--primary-50) text-(--primary-600) border border-(--primary-100)">
                2 Growing
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-100">
                1 Gap
              </span>
            </div>
          </div>
        </div>

        {/* Skill bars */}
        <ul className="space-y-3.5">
          {skills.map((skill) => (
            <li key={skill.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-(--text-title)">
                  {skill.label}
                </span>
                <span
                  className={`text-[11px] font-semibold ${skill.statusColor}`}
                >
                  {skill.status} · {skill.pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-(--gray-100) overflow-hidden">
                <div
                  className="skill-bar-fill h-2 rounded-full"
                  style={{
                    width: "0%",
                    backgroundColor: barColor(skill.status),
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Legend */}
        <div className="flex items-center gap-4">
          {[
            { color: "var(--success-500)", label: "Strong" },
            { color: "var(--primary-600)", label: "Growing" },
            { color: "var(--warning-500)", label: "Needs work" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[11px] text-(--gray-500)">{label}</span>
            </div>
          ))}
        </div>

        {/* Top recommendation */}
        <div className="rounded-2xl border border-(--warning-500)/20 bg-orange-50 px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-(--text-title)">
              Focus area: MLOps / Deployment
            </p>
            <p className="text-[11px] text-(--gray-500) mt-0.5">
              Only 34% — take &ldquo;MLOps Fundamentals&rdquo; to close this gap
              fast
            </p>
          </div>
        </div>

        <button className="mt-auto w-full cursor-pointer flex items-center justify-center gap-2 bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-700) font-semibold text-[14px] py-3 rounded-xl transition-colors border border-(--primary-100)">
          <SplinePointer className="w-4 h-4" />
          Adjust my learning path
        </button>
      </div>
    </div>
  );
}
