"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Users, BarChart2, BadgeCheck, Timer } from "lucide-react";
import type { QuizQuestion } from "../quiz-types";
import { SEED_ATTEMPTS } from "../quiz-types";

const SCORE_RANGES = [
  { label: "0–20%",   min: 0,  max: 20,  color: "bg-red-400" },
  { label: "21–40%",  min: 21, max: 40,  color: "bg-orange-400" },
  { label: "41–60%",  min: 41, max: 60,  color: "bg-yellow-400" },
  { label: "61–80%",  min: 61, max: 80,  color: "bg-blue-500" },
  { label: "81–100%", min: 81, max: 100, color: "bg-green-500" },
];

const STAT_CONFIGS = [
  { label: "Total Attempts", Icon: Users,      bg: "bg-blue-50",   iconColor: "text-blue-600",   text: "text-blue-600" },
  { label: "Avg Score",      Icon: BarChart2,  bg: "bg-purple-50", iconColor: "text-purple-600", text: "text-purple-600" },
  { label: "Pass Rate",      Icon: BadgeCheck, bg: "bg-green-50",  iconColor: "text-green-600",  text: "text-green-600" },
  { label: "Avg Time",       Icon: Timer,      bg: "bg-orange-50", iconColor: "text-orange-500", text: "text-orange-500" },
];

export default function AnalyticsTab({
  questions,
  passMark,
}: {
  questions: QuizQuestion[];
  passMark: number;
}) {
  const barsRef      = useRef<(HTMLDivElement | null)[]>([]);
  const rowsRef      = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef     = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const attempts      = SEED_ATTEMPTS;
  const totalAttempts = attempts.length;

  const avgScore =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / totalAttempts,
        )
      : 0;

  const passRate =
    totalAttempts > 0
      ? Math.round(
          (attempts.filter((a) => (a.score / a.total) * 100 >= passMark).length /
            totalAttempts) *
            100,
        )
      : 0;

  const statValues = [
    { value: String(totalAttempts), sub: "students" },
    { value: `${avgScore}%`,        sub: `Pass mark ${passMark}%` },
    { value: `${passRate}%`,        sub: passRate >= passMark ? "Above pass mark" : "Below pass mark" },
    { value: "4.2 min",             sub: "per attempt" },
  ];

  const distribution = SCORE_RANGES.map((r) => ({
    ...r,
    count: attempts.filter((a) => {
      const pct = (a.score / a.total) * 100;
      return pct >= r.min && pct <= r.max;
    }).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const questionStats = questions.map((q, i) => {
    const hash = q.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const correctRate = 50 + (hash % 51);
    const difficulty  = correctRate >= 75 ? "Easy" : correctRate >= 50 ? "Medium" : "Hard";
    return { q, i, correctRate, difficulty };
  });

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: i * 0.08, ease: "back.out(1.4)" },
      );
    });

    barsRef.current.forEach((el, i) => {
      if (!el) return;
      const pct = (distribution[i].count / maxCount) * 100;
      gsap.fromTo(el,
        { width: "0%" },
        { width: `${pct}%`, duration: 0.8, delay: 0.3 + i * 0.1, ease: "power3.out" },
      );
    });

    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, delay: 0.5 + i * 0.08, ease: "power2.out" },
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_CONFIGS.map((cfg, i) => (
          <div
            key={cfg.label}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="opacity-0 flex flex-col gap-2 bg-white border border-(--gray-200) rounded-2xl px-4 py-4"
          >
            <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}>
              <cfg.Icon className={`w-5 h-5 ${cfg.iconColor}`} />
            </div>
            <p className={`text-[22px] font-bold leading-none ${cfg.text}`}>
              {statValues[i].value}
            </p>
            <div>
              <p className="text-[12px] font-medium text-(--text-title)">{cfg.label}</p>
              <p className="text-[11px] text-(--gray-400)">{statValues[i].sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Score Distribution */}
      <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-(--text-title)">Score Distribution</p>
          <span className="text-[11px] text-(--gray-400) bg-(--gray-100) px-2 py-1 rounded-full">
            {totalAttempts} students
          </span>
        </div>
        <div className="space-y-3">
          {distribution.map((d, i) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-[12px] font-medium text-(--gray-600) w-16 shrink-0">
                {d.label}
              </span>
              <div className="flex-1 h-8 bg-(--gray-100) rounded-lg overflow-hidden relative">
                <div
                  ref={(el) => { barsRef.current[i] = el; }}
                  className={`h-full rounded-lg ${d.color} opacity-85`}
                  style={{ width: "0%" }}
                />
                {d.count > 0 && (
                  <span className="absolute inset-0 flex items-center pl-3 text-[12px] font-semibold text-white pointer-events-none">
                    {d.count} student{d.count !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <span className={`text-[13px] font-bold w-5 shrink-0 text-right ${d.color.replace("bg-", "text-")}`}>
                {d.count}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-(--gray-100)">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-[11px] text-(--gray-500)">
            Pass mark: {passMark}% and above
          </span>
        </div>
      </div>

      {/* Per-Question Breakdown */}
      <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
        <p className="text-[15px] font-semibold text-(--text-title)">
          Per-Question Breakdown
        </p>
        {questions.length === 0 ? (
          <p className="text-[13px] text-(--gray-400) py-6 text-center">
            Add questions in the Build tab to see stats here.
          </p>
        ) : (
          <div className="space-y-1">
            {questionStats.map(({ q, i, correctRate, difficulty }, idx) => (
              <div
                key={q.id}
                ref={(el) => { rowsRef.current[idx] = el; }}
                className="opacity-0 flex items-center gap-3 py-3 border-b border-(--gray-100) last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-(--primary-700) text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <p className="flex-1 text-[13px] text-(--text-title) truncate min-w-0">
                  {q.prompt || "Untitled question"}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-2.5 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        correctRate >= 75
                          ? "bg-green-500"
                          : correctRate >= 50
                            ? "bg-orange-400"
                            : "bg-red-400"
                      }`}
                      style={{ width: `${correctRate}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-(--text-title) w-8 text-right">
                    {correctRate}%
                  </span>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    difficulty === "Easy"
                      ? "bg-green-100 text-green-700"
                      : difficulty === "Medium"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {difficulty}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
