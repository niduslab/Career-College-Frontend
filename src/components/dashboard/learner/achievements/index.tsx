"use client";

import { useEffect, useRef, useState } from "react";
import {
  Flame,
  Trophy,
  Award,
  Zap,
  Play,
  Moon,
  Target,
  MessageCircle,
  TrendingUp,
  GraduationCap,
  Lock,
} from "lucide-react";
import gsap from "gsap";
import Image from "next/image";
import avatar1 from "@/assets/images/hero/avatar1.webp";
import avatar2 from "@/assets/images/hero/avatar2.webp";
import avatar3 from "@/assets/images/hero/avatar3.webp";
import instructor1 from "@/assets/images/instructors/instructor1.webp";
import instructor2 from "@/assets/images/instructors/instructor2.webp";
import instructor3 from "@/assets/images/instructors/instructor3.webp";
import instructor4 from "@/assets/images/instructors/instructor4.webp";

// Data structures for stats, badges, and leaderboard entries

const STATS = [
  {
    icon: Flame,
    label: "Day streak",
    value: "27",
    color: "text-orange-500",
    bg: "bg-orange-50",
    badge: "Best streak: 34 days",
  },
  {
    icon: Trophy,
    label: "Global rank",
    value: "#12",
    color: "text-amber-500",
    bg: "bg-amber-50",
    badge: "Up 3 places this week",
  },
  {
    icon: Award,
    label: "Badges earned",
    value: "6",
    color: "text-(--primary-600)",
    bg: "bg-(--primary-50)",
    badge: "3 more badges to unlock",
  },
  {
    icon: Zap,
    label: "XP this week",
    value: "340",
    color: "text-pink-500",
    bg: "bg-pink-50",
    badge: "+340 XP earned this week",
  },
];

const BADGES = [
  {
    id: 1,
    label: "First Steps",
    desc: "Complete your first lesson",
    icon: Play,
    unlocked: true,
    iconColor: "text-(--primary-500)",
    iconBg: "bg-(--primary-50)",
  },
  {
    id: 2,
    label: "Consistency King",
    desc: "21-day learning streak",
    icon: Flame,
    unlocked: true,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
  },
  {
    id: 3,
    label: "Quiz Master",
    desc: "Score 90%+ on 10 quizzes",
    icon: Target,
    unlocked: true,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-50",
  },
  {
    id: 4,
    label: "Night Owl",
    desc: "Study after midnight 5×",
    icon: Moon,
    unlocked: true,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50",
  },
  {
    id: 5,
    label: "Certified",
    desc: "Earn your first certificate",
    icon: Award,
    unlocked: true,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-50",
  },
  {
    id: 6,
    label: "Helping Hand",
    desc: "Answer 25 forum questions",
    icon: MessageCircle,
    unlocked: true,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50",
  },
  {
    id: 7,
    label: "Marathon",
    desc: "100-day learning streak",
    icon: TrendingUp,
    unlocked: false,
    iconColor: "text-(--gray-400)",
    iconBg: "bg-(--gray-100)",
  },
  {
    id: 8,
    label: "Polymath",
    desc: "Complete 5 learning paths",
    icon: GraduationCap,
    unlocked: false,
    iconColor: "text-(--gray-400)",
    iconBg: "bg-(--gray-100)",
  },
  {
    id: 9,
    label: "Top 1%",
    desc: "Reach global top 1%",
    icon: Trophy,
    unlocked: false,
    iconColor: "text-(--gray-400)",
    iconBg: "bg-(--gray-100)",
  },
];

const LEADERBOARD = [
  {
    rank: 1,
    initials: "KT",
    name: "Kenji Tanaka",
    xp: 14820,
    you: false,
    avatar: instructor1,
  },
  {
    rank: 2,
    initials: "AO",
    name: "Amara Okafor",
    xp: 13340,
    you: false,
    avatar: instructor2,
  },
  {
    rank: 3,
    initials: "LF",
    name: "Liam Foster",
    xp: 12010,
    you: true,
    avatar: instructor3,
  },
  {
    rank: 4,
    initials: "JS",
    name: "James Sullivan",
    xp: 11540,
    you: false,
    avatar: instructor4,
  },
  {
    rank: 5,
    initials: "SM",
    name: "Sara Mendez",
    xp: 8710,
    you: false,
    avatar: avatar1,
  },
  {
    rank: 6,
    initials: "AR",
    name: "Ayesha Rahman",
    xp: 8420,
    you: false,
    avatar: avatar2,
  },
  {
    rank: 7,
    initials: "DK",
    name: "David Kim",
    xp: 8190,
    you: false,
    avatar: avatar3,
  },
];

const CURRENT_XP = 8420;
const NEXT_LEVEL_XP = 10000;
const LEVEL = 14;
const xpPct = Math.round((CURRENT_XP / NEXT_LEVEL_XP) * 100);

// Sub-components

function XPRing({ pct }: { pct: number }) {
  const r = 58;
  const circ = 2 * Math.PI * r;
  return (
    <svg className="w-36 h-36 -rotate-90" viewBox="0 0 136 136">
      <circle
        cx="68"
        cy="68"
        r={r}
        fill="none"
        stroke="var(--primary-100)"
        strokeWidth="12"
      />
      <circle
        cx="68"
        cy="68"
        r={r}
        fill="none"
        stroke="var(--primary-600)"
        strokeWidth="12"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round"
      />
    </svg>
  );
}

const PERIODS = ["This Week", "This Month", "All Time"] as const;
type Period = (typeof PERIODS)[number];

function Leaderboard({
  leaderRef,
}: {
  leaderRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [period, setPeriod] = useState<Period>("This Month");
  const topXP = LEADERBOARD[0].xp;

  // find index where rank jumps by more than 1
  const gapIndex = LEADERBOARD.findIndex(
    (e, i) => i > 0 && e.rank - LEADERBOARD[i - 1].rank > 1,
  );

  return (
    <div
      ref={leaderRef}
      className="opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 sm:p-6 self-start"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-[18px] md:text-[20px] font-semibold text-(--text-title)">
            Leaderboard
          </h2>
        </div>
        {/* Period switcher */}
        <div className="flex items-center gap-1 bg-(--gray-100) p-1 rounded-lg">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                period === p
                  ? "bg-white text-(--text-title) shadow-sm"
                  : "text-(--gray-500) hover:text-(--text-title)"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[12px] text-(--gray-400) mb-4">
        {period} · AI &amp; Data track
      </p>

      <div className="space-y-1">
        {LEADERBOARD.map((entry, i) => {
          const entryXpPct = Math.round((entry.xp / topXP) * 100);

          return (
            <div key={entry.rank}>
              {/* Gap separator */}
              {i === gapIndex && gapIndex !== -1 && (
                <div className="flex items-center gap-2 py-1.5 px-3">
                  <div className="flex-1 border-t border-dashed border-(--gray-200)" />
                  <span className="text-[11px] text-(--gray-400) font-medium">
                    {entry.rank - LEADERBOARD[i - 1].rank - 1} more
                  </span>
                  <div className="flex-1 border-t border-dashed border-(--gray-200)" />
                </div>
              )}

              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  entry.you
                    ? "bg-(--primary-50) border border-(--primary-100)"
                    : "hover:bg-(--gray-50)"
                }`}
              >
                {/* Rank */}
                <span className="w-6 flex items-center justify-center shrink-0 text-[12px] font-medium text-(--gray-400)">
                  {entry.rank}
                </span>

                {/* Avatar image */}
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-(--gray-100)">
                  <Image
                    src={entry.avatar}
                    alt={entry.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Name + XP bar */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-medium truncate leading-tight ${
                      entry.you ? "text-(--primary-700)" : "text-(--text-title)"
                    }`}
                  >
                    {entry.name}
                    {entry.you && (
                      <span className="ml-1.5 text-[11px] font-semibold text-(--primary-500)">
                        · You
                      </span>
                    )}
                  </p>
                  {/* Mini XP bar */}
                  <div className="mt-1 h-1 rounded-full bg-(--gray-100) overflow-hidden w-full">
                    <div
                      className={`h-full rounded-full ${entry.you ? "bg-(--primary-500)" : "bg-(--gray-300)"}`}
                      style={{ width: `${entryXpPct}%` }}
                    />
                  </div>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1 shrink-0">
                  <Zap
                    className={`w-3.5 h-3.5 ${entry.you ? "text-(--primary-500)" : "text-(--gray-400)"}`}
                  />
                  <span
                    className={`text-[12px] font-semibold tabular-nums ${
                      entry.you ? "text-(--primary-600)" : "text-(--gray-500)"
                    }`}
                  >
                    {entry.xp.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — view full leaderboard */}
      <button className="mt-4 w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-500) hover:bg-(--gray-50) transition-colors cursor-pointer">
        View full leaderboard
      </button>
    </div>
  );
}

// Page component

export default function AchievementsPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const leaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4 },
    )
      .fromTo(
        heroRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.2",
      )
      .fromTo(
        [badgesRef.current, leaderRef.current],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
        "-=0.15",
      );
    if (badgesRef.current) {
      gsap.fromTo(
        Array.from(badgesRef.current.querySelectorAll(".badge-card")),
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: 0.06,
          ease: "back.out(1.4)",
          delay: 0.5,
        },
      );
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div
        ref={headerRef}
        className="opacity-0 flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-bold text-(--text-title)">
            Achievements &amp; Badges
          </h1>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-0.5">
            Level up by learning consistently and hitting milestones.
          </p>
        </div>
      </div>

      {/* Hero / XP card */}
      <div
        ref={heroRef}
        className="opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Ring + level */}
          <div className="relative shrink-0 flex items-center justify-center">
            <XPRing pct={xpPct} />
            <div className="absolute flex flex-col items-center text-center leading-tight">
              <span className="text-[20px] md:text-[24px] lg:text-[24px] font-bold text-(--text-title)">
                Lv {LEVEL}
              </span>
              <span className="text-[12px] font-medium text-(--gray-400) uppercase tracking-wide">
                Pathfinder
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h2 className="text-[20px] md:text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
                Pathfinder
              </h2>
              <span className="text-[12px] font-semibold text-(--primary-600) bg-(--primary-50) px-3 py-0.5 rounded-full border border-(--primary-100)">
                Level {LEVEL}
              </span>
            </div>
            <p className="text-[12px] text-(--gray-400) mb-4">
              {CURRENT_XP.toLocaleString()} XP ·{" "}
              {(NEXT_LEVEL_XP - CURRENT_XP).toLocaleString()} XP to next level
            </p>

            {/* XP bar */}
            <div className="h-2.5 rounded-full bg-(--gray-100) mb-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-(--primary-600) transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[12px] text-(--gray-400) mb-5">
              <span>{CURRENT_XP.toLocaleString()} XP</span>
              <span>
                {NEXT_LEVEL_XP.toLocaleString()} XP Level {LEVEL + 1}
              </span>
            </div>

            {/* Stats — same pattern as dashboard stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {STATS.map((s) => {
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
                        <p className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                          {s.value}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-[6px_4px_6px_6px] ${s.bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`w-6 h-6 ${s.color}`} />
                      </div>
                    </div>
                    <div className="border border-dashed border-(--gray-200)" />
                    <p className="text-[12px] font-medium text-(--success-500)">
                      {s.badge}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom two-column */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Badges */}
        <div
          ref={badgesRef}
          className="opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-(--primary-600)" />
            <h2 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
              Badges
            </h2>
          </div>
          <p className="text-[12px] text-(--gray-400) mb-5">
            {BADGES.filter((b) => b.unlocked).length} of {BADGES.length}{" "}
            unlocked
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:grid-cols-3 gap-3 sm:gap-4">
            {BADGES.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className={`badge-card opacity-0 relative flex flex-col items-center text-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    b.unlocked
                      ? "border-(--gray-100) bg-(--gray-50) hover:border-(--primary-200) hover:shadow-sm"
                      : "border-dashed border-(--gray-200) bg-white opacity-60"
                  }`}
                >
                  {!b.unlocked && (
                    <Lock className="absolute top-2.5 right-2.5 w-4 h-4 text-(--gray-300)" />
                  )}
                  <div
                    className={`w-12 h-12 rounded-2xl ${b.iconBg} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${b.iconColor}`} />
                  </div>
                  <div>
                    <p
                      className={`text-[14px] font-semibold leading-tight ${b.unlocked ? "text-(--text-title)" : "text-(--gray-400)"}`}
                    >
                      {b.label}
                    </p>
                    <p className="text-[12px] text-(--gray-400) mt-0.5 leading-snug">
                      {b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard leaderRef={leaderRef} />
      </div>
    </div>
  );
}
