"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { STAT_ICONS } from "./data";
import type { Webinar } from "./types";

const CARD_TINTS = [
  {
    bg: "from-(--primary-50) to-white",
    icon: "from-(--primary-500) to-(--primary-600)",
  },
  {
    bg: "from-indigo-50 to-white",
    icon: "from-indigo-400 to-indigo-500",
  },
  { bg: "from-amber-50 to-white", icon: "from-amber-400 to-amber-500" },
  {
    bg: "from-emerald-50 to-white",
    icon: "from-emerald-400 to-emerald-500",
  },
];

interface StatsCardsProps {
  webinars: Webinar[];
}

export default function WebinarsStatsCards({ webinars }: StatsCardsProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const total = webinars.length;
  const published = webinars.filter((w) => w.status === "published").length;
  const archived = webinars.filter((w) => w.status === "archived").length;
  const upcomingWebinars = webinars
    .filter((w) => w.status === "published" && new Date(w.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const upcoming = upcomingWebinars.length;
  const drafts = webinars.filter((w) => w.status === "draft").length;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const stats = [
    {
      label: "Total Webinars",
      value: String(total),
      change: total > 0 ? `${archived} archived` : "No webinars yet",
    },
    {
      label: "Published",
      value: String(published),
      change: total > 0 ? `${pct(published)}% of total` : "Nothing published yet",
    },
    {
      label: "Upcoming",
      value: String(upcoming),
      change: upcomingWebinars[0]
        ? `Next: ${new Date(upcomingWebinars[0].scheduled_at).toLocaleDateString()}`
        : "None scheduled",
    },
    {
      label: "Drafts",
      value: String(drafts),
      change: total > 0 ? `${pct(drafts)}% of total` : "No drafts yet",
    },
  ];

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: i * 0.08, ease: "back.out(1.4)" },
      );
    });
  }, [total]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = STAT_ICONS[i];
        const { bg, icon } = CARD_TINTS[i % CARD_TINTS.length];
        return (
          <div
            key={s.label}
            ref={(el) => { cardsRef.current[i] = el; }}
            className={`opacity-0 bg-linear-to-b ${bg} rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">{s.label}</p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">{s.value}</p>
              </div>
              <div
                className={`w-10 h-10 xl:w-8 xl:h-8 rounded-[6px_4px_6px_6px] bg-linear-to-br ${icon} flex items-center justify-center shrink-0 shadow-sm`}
              >
                <Icon className="w-6 h-6 xl:w-5 xl:h-5 text-white" />
              </div>
            </div>
            {s.change && (
              <>
                <div className="border border-dashed border-gray-200 mt-1 mb-1" />
                <p className="text-[12px] font-medium text-(--gray-500)">{s.change}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
