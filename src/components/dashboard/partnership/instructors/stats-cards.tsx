"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { STAT_ICONS } from "./data";
import type { Expert } from "./types";

interface StatsCardsProps {
  experts: Expert[];
}

export default function InstructorsStatsCards({ experts }: StatsCardsProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const total = experts.length;
  const active = experts.filter((e) => e.affiliation_status === "active").length;
  const departmentCount = new Set(
    experts.map((e) => e.department?.id).filter(Boolean),
  ).size;
  const unassigned = experts.filter((e) => !e.department).length;
  const totalCourses = experts.reduce((sum, e) => sum + e.course_count, 0);
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;

  const stats = [
    {
      label: "Total Experts",
      value: String(total),
      change: total === 0 ? "no experts yet" : "on your roster",
    },
    {
      label: "Active",
      value: String(active),
      change: `${activePct}% active rate`,
    },
    {
      label: "Departments",
      value: String(departmentCount),
      change:
        departmentCount === 0
          ? "no departments yet"
          : `${unassigned} expert${unassigned === 1 ? "" : "s"} unassigned`,
    },
    {
      label: "Total Courses",
      value: String(totalCourses),
      change: totalCourses === 0 ? "nothing assigned yet" : `across ${active} active expert${active === 1 ? "" : "s"}`,
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
            <div className="border border-dashed border-gray-200 mt-1 mb-1" />
            <p className="text-[12px] font-medium text-(--success-500)">{s.change}</p>
          </div>
        );
      })}
    </div>
  );
}
