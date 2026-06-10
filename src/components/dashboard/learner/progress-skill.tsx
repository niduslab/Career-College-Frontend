"use client";

import { useEffect, useRef } from "react";
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
} from "lucide-react";
import gsap from "gsap";

const badges = [
  { icon: Play, bg: "bg-purple-100", color: "text-purple-500" },
  { icon: Flame, bg: "bg-orange-100", color: "text-orange-500" },
  { icon: Target, bg: "bg-emerald-100", color: "text-emerald-500" },
  { icon: Moon, bg: "bg-blue-100", color: "text-blue-500" },
  { icon: Award, bg: "bg-pink-100", color: "text-pink-500" },
  { icon: MessageCircle, bg: "bg-gray-100", color: "text-gray-400" },
];

const skills = [
  {
    label: "Machine Learning",
    pct: 82,
    status: "Strong",
    statusColor: "text-emerald-600",
  },
  {
    label: "Data Visualization",
    pct: 64,
    status: "Growing",
    statusColor: "text-blue-500",
  },
  {
    label: "Deep Learning",
    pct: 71,
    status: "Growing",
    statusColor: "text-blue-500",
  },
  {
    label: "MLOps / Deployment",
    pct: 34,
    status: "Needs work",
    statusColor: "text-orange-500",
  },
  {
    label: "Statistics",
    pct: 78,
    status: "Strong",
    statusColor: "text-emerald-600",
  },
];

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressSkill() {
  const progressRef = useRef<HTMLDivElement>(null);
  const skillRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Animate level ring
    if (circleRef.current) {
      const fill = (8420 / 10000) * CIRCUMFERENCE;
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: CIRCUMFERENCE },
        {
          strokeDashoffset: CIRCUMFERENCE - fill,
          duration: 1.4,
          ease: "power2.out",
          delay: 0.3,
        },
      );
    }

    // Animate skill bars
    if (skillRef.current) {
      const bars = skillRef.current.querySelectorAll(".skill-bar-fill");
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

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Your Progress */}
      <div
        ref={progressRef}
        className="opacity-0 flex-1 bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title) flex items-center gap-2">
            <Trophy className="w-5 h-5 text-(--primary-600)" />
            Your Progress
          </h3>
          <button className="text-[14px] font-semibold cursor-pointer text-(--primary-600) hover:underline">
            View all
          </button>
        </div>

        <div className="flex items-center gap-6">
          {/* Level ring */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg width="108" height="108" className="-rotate-90">
              <circle
                cx="54"
                cy="54"
                r={RADIUS}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                ref={circleRef}
                cx="54"
                cy="54"
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
              <span className="text-[18px] lg:text-[24px] font-bold text-(--text-title) leading-none">
                Lv 14
              </span>
              <span className="text-[12px] text-(--gray-500)">Pathfinder</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-(--text-title) font-semibold">
                XP to Level 15
              </span>
              <span className="text-[12px] font-semibold text-(--gray-400)">
                8,420 / 10,000
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-(--gray-100)">
              <div
                className="h-2.5 rounded-full bg-(--primary-600) transition-all"
                style={{ width: "84.2%" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-(--gray-50) rounded-xl px-4 py-3">
                <p className="text-[12px] text-(--gray-500) font-semibold flex items-center gap-1">
                  <Trophy className="w-4 h-4" /> Rank
                </p>
                <p className="text-[18px] font-bold text-(--text-title) mt-0.5">
                  #12
                </p>
              </div>
              <div className="bg-(--gray-50) rounded-xl px-4 py-3">
                <p className="text-[12px] text-(--gray-500) font-semibold flex items-center gap-1">
                  <Award className="w-4 h-4" /> Badges
                </p>
                <p className="text-[20px] font-semibold text-(--text-title) mt-0.5">
                  6/9
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Badge row */}
        <div className="flex items-center gap-2 mt-5">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className={`w-9 h-9 rounded-lg cursor-pointer ${b.bg} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${b.color}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div
        ref={skillRef}
        className="opacity-0 flex-1 bg-white rounded-2xl border border-(--gray-200) p-5 lg:p-6"
      >
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-[16px] lg:text-[20px] font-bold text-(--text-title) flex items-center gap-2">
              <Target className="w-5 h-5 text-(--primary-600)" />
              Skill Gap Analysis
            </h3>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              Toward your AI/ML Engineer goal
            </p>
          </div>
          <span className="flex items-center gap-1 text-[14px] font-semibold text-(--primary-600) bg-(--primary-50) px-2.5 py-1 rounded-md">
            <Sparkles className="w-4 h-4" /> AI
          </span>
        </div>

        <ul className="mt-5 space-y-4">
          {skills.map((skill) => (
            <li key={skill.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[14px] font-medium text-(--text-title)">
                  {skill.label}
                </span>
                <span
                  className={`text-[12px] font-semibold ${skill.statusColor}`}
                >
                  {skill.status} · {skill.pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-(--gray-100)">
                <div
                  className="skill-bar-fill h-2 rounded-full bg-(--primary-600)"
                  style={{ width: "0%" }}
                />
              </div>
            </li>
          ))}
        </ul>

        <button className="mt-6 w-full cursor-pointer flex items-center justify-center gap-2 bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-700) font-semibold text-[14px] py-3 rounded-lg transition-colors">
          <SplinePointer className="w-4 h-4" />
          Adjust my learning path
        </button>
      </div>
    </div>
  );
}
