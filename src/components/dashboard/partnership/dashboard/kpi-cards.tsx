"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Wallet, Handshake, FileText, GraduationCap } from "lucide-react";

const KPIS = [
  {
    label: "Total Revenue",
    value: "$38,540",
    change: "+18.3% vs last month",
    icon: Wallet,
    accent: "bg-(--primary-50) text-(--primary-600)",
  },
  {
    label: "Active Partners",
    value: "24",
    change: "+3 new this month",
    icon: Handshake,
    accent: "bg-(--primary-50) text-(--primary-600)",
  },
  {
    label: "Open Proposals",
    value: "9",
    change: "3 expiring within 7 days",
    icon: FileText,
    accent: "bg-(--primary-50) text-(--primary-600)",
  },
  {
    label: "Active Courses",
    value: "56",
    change: "+8 added this month",
    icon: GraduationCap,
    accent: "bg-(--primary-50) text-(--primary-600)",
  },
];

export default function DashboardKpiCards() {
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
