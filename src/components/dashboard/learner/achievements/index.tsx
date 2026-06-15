"use client";

import { useEffect, useRef } from "react";
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
    avatarBg: "bg-amber-500",
  },
  {
    rank: 2,
    initials: "AO",
    name: "Amara Okafor",
    xp: 13340,
    you: false,
    avatarBg: "bg-orange-500",
  },
  {
    rank: 3,
    initials: "LF",
    name: "Liam Foster",
    xp: 12010,
    you: false,
    avatarBg: "bg-emerald-500",
  },
  {
    rank: 4,
    initials: "LF",
    name: "Liam Foster",
    xp: 12010,
    you: false,
    avatarBg: "bg-emerald-500",
  },
  {
    rank: 11,
    initials: "SM",
    name: "Sara Mendez",
    xp: 8710,
    you: false,
    avatarBg: "bg-blue-500",
  },
  {
    rank: 12,
    initials: "AR",
    name: "Ayesha Rahman",
    xp: 8420,
    you: true,
    avatarBg: "bg-(--primary-600)",
  },
  {
    rank: 13,
    initials: "DK",
    name: "David Kim",
    xp: 8190,
    you: false,
    avatarBg: "bg-slate-500",
  },
];

const RANK_ICONS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

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
        <div
          ref={leaderRef}
          className="opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 sm:p-6 self-start"
        >
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
              Leaderboard
            </h2>
          </div>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-400) mb-5">
            This month · AI &amp; Data track
          </p>

          <div className="space-y-1.5">
            {LEADERBOARD.map((entry) => {
              return (
                <div key={entry.rank}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      entry.you
                        ? "bg-(--primary-50) border border-(--primary-100)"
                        : "hover:bg-(--gray-50)"
                    }`}
                  >
                    {/* Rank */}
                    <span className="w-6 text-center text-[14px] shrink-0">
                      {RANK_ICONS[entry.rank] ?? (
                        <span className="text-[12px] font-medium text-(--gray-400)">
                          {entry.rank}
                        </span>
                      )}
                    </span>
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full ${entry.avatarBg} flex items-center justify-center text-white text-[12px] font-bold shrink-0`}
                    >
                      {entry.initials}
                    </div>
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13px] font-medium truncate ${entry.you ? "text-(--primary-700)" : "text-(--text-title)"}`}
                      >
                        {entry.name}
                        {entry.you && (
                          <span className="ml-1.5 text-[12px] font-semibold text-(--primary-500)">
                            · You
                          </span>
                        )}
                      </p>
                    </div>
                    {/* XP */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Zap
                        className={`w-3.5 h-3.5 ${entry.you ? "text-(--primary-500)" : "text-(--gray-400)"}`}
                      />
                      <span
                        className={`text-[12px] md:text-[14px] lg:text-[14px] font-semibold tabular-nums ${entry.you ? "text-(--primary-600)" : "text-(--gray-500)"}`}
                      >
                        {entry.xp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
