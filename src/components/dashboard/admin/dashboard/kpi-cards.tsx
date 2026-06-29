"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Users, GraduationCap, Wallet, BookOpen } from "lucide-react";

const KPIS = [
  {
    label: "Total Users",
    value: "48,920",
    change: "+1,240 this month",
    icon: Users,
    accent: "bg-(--primary-50) text-(--primary-600)",
  },
  {
    label: "Total Enrollments",
    value: "126,480",
    change: "+8.4% vs last month",
    icon: GraduationCap,
    accent: "bg-(--primary-50) text-(--primary-600)",
  },
  {
    label: "Platform Revenue",
    value: "$842,300",
    change: "+12.7% vs last month",
    icon: Wallet,
    accent: "bg-(--primary-50) text-(--primary-600)",
  },
  {
    label: "Active Courses",
    value: "3,184",
    change: "+96 published this month",
    icon: BookOpen,
    accent: "bg-(--primary-50) text-(--primary-600)",
  },
];

export default function AdminKpiCards() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          delay: i * 0.08,
          ease: "back.out(1.4)",
        },
      );
    });
  }, []);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {KPIS.map((k, i) => {
        const Icon = k.icon;
        return (
          <div
            key={k.label}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="opacity-0 bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                  {k.label}
                </p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                  {k.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 xl:w-8 xl:h-8 rounded-[6px_4px_6px_6px] flex items-center justify-center shrink-0 ${k.accent}`}
              >
                <Icon className="w-6 h-6 xl:w-5 xl:h-5" />
              </div>
            </div>
            <div className="border border-dashed border-gray-200" />
            <p className="text-[12px] font-medium text-(--success-500)">
              {k.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
