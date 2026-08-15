"use client";

import { useEffect, useRef } from "react";
import { Flame, CheckSquare, Award, Clock } from "lucide-react";
import gsap from "gsap";

import { StatsSkeleton } from "@/components/common/query-states";
import { useLearnerSummary } from "@/hooks/use-learner-dashboard";
import type { LearnerSummary } from "@/lib/learner-dashboard-api";

/**
 * Four tiles, not five.
 *
 * The XP tile is gone: there is no XP ledger behind it, so any number shown
 * would be invented. The per-tile "+340 this week" style deltas are gone for
 * the same reason — the summary endpoint carries totals, not week-over-week
 * change. Each tile's sub-line now says something the data actually supports.
 */
interface StatTile {
  icon: typeof Flame;
  iconFill: boolean;
  value: number;
  suffix: string;
  label: string;
  badge: string;
}

function buildTiles(summary: LearnerSummary): StatTile[] {
  return [
    {
      icon: Flame,
      iconFill: true,
      value: summary.day_streak,
      suffix: "",
      label: "Day Streak",
      // The streak is derived from activity dates, not an event log — the
      // endpoint flags it approximate and the UI says so rather than hiding it.
      badge: summary.day_streak_is_approximate
        ? `approx. · ${summary.day_streak_timezone}`
        : "consecutive days",
    },
    {
      icon: CheckSquare,
      iconFill: false,
      value: summary.courses_completed,
      suffix: "",
      label: "Courses Done",
      badge: `${summary.courses_in_progress} in progress`,
    },
    {
      icon: Award,
      iconFill: false,
      value: summary.certificates_earned,
      suffix: "",
      label: "Certificates",
      badge: "earned",
    },
    {
      icon: Clock,
      iconFill: false,
      value: Math.round(summary.total_learning_hours),
      suffix: "h",
      label: "Hours Learned",
      badge: `${summary.lectures_completed} lectures completed`,
    },
  ];
}

export default function LearnerStatsCards() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);

  const { data: summary, isLoading, isError } = useLearnerSummary();
  const tiles = summary ? buildTiles(summary) : [];

  useEffect(() => {
    if (!cardsRef.current || tiles.length === 0) return;

    const cards = cardsRef.current.querySelectorAll(".stat-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power3.out" },
    );

    countersRef.current.forEach((el, i) => {
      if (!el || !tiles[i]) return;
      const { value, suffix } = tiles[i];
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 1.4,
        ease: "power2.out",
        delay: i * 0.08,
        onUpdate: () => {
          if (el)
            el.textContent = Math.round(obj.val).toLocaleString() + suffix;
        },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  if (isLoading) return <StatsSkeleton count={4} />;

  // A failed KPI fetch shouldn't blank the dashboard — the rest of the page
  // still works, so the row simply drops out.
  if (isError || !summary) return null;

  return (
    <div
      ref={cardsRef}
      className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {tiles.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="stat-card bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 opacity-0"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                  {stat.label}
                </p>
                <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                  <span
                    ref={(el) => {
                      countersRef.current[i] = el;
                    }}
                  >
                    0{stat.suffix}
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                <Icon
                  className="w-6 h-6 text-(--primary-600)"
                  fill={stat.iconFill ? "currentColor" : "none"}
                />
              </div>
            </div>

            <div className="border border-dashed border-gray-200 my-1" />

            <p className="text-[12px] font-medium text-(--success-500)">
              {stat.badge}
            </p>
          </div>
        );
      })}
    </div>
  );
}
