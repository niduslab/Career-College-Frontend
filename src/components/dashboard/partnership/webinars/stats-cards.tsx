"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { STAT_ICONS } from "./data";
import type { Webinar } from "./types";

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
        return (
          <div
            key={s.label}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="opacity-0 bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">{s.label}</p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">{s.value}</p>
              </div>
              <div className="w-10 h-10 xl:w-8 xl:h-8 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 xl:w-5 xl:h-5 text-(--primary-600)" />
              </div>
            </div>
            {s.change && (
              <>
                <div className="border border-dashed border-gray-200 mt-1 mb-1" />
                <p className="text-[12px] font-medium text-(--success-500)">{s.change}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
