"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  DollarSign,
  Eye,
  Clock,
  Award,
} from "lucide-react";

const KPI_DATA = [
  {
    label: "Total Revenue",
    value: "$24,802",
    change: "+12.5% vs last month",
    up: true,
    icon: DollarSign,
  },
  {
    label: "Total Students",
    value: "1,420",
    change: "+4.2% new enrollments",
    up: true,
    icon: Users,
  },
  {
    label: "Course Views",
    value: "38,540",
    change: "+8.1% this month",
    up: true,
    icon: Eye,
  },
  {
    label: "Avg. Rating",
    value: "4.92",
    change: "-0.03 · 204 reviews",
    up: false,
    icon: Star,
  },
  {
    label: "Completion Rate",
    value: "73%",
    change: "+5.3% avg all courses",
    up: true,
    icon: Award,
  },
  {
    label: "Watch Time",
    value: "12,840 h",
    change: "+18.2% total this month",
    up: true,
    icon: Clock,
  },
];

export default function KpiCards() {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {KPI_DATA.map((d, i) => {
        const Icon = d.icon;
        return (
          <div
            key={d.label}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="opacity-0 bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                  {d.label}
                </p>
                <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                  {d.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-(--primary-600)" />
              </div>
            </div>
            <div className="border border-dashed border-gray-200 mt-1 mb-1" />
            <p
              className={`text-[12px] font-medium flex items-center gap-1 ${d.up ? "text-(--success-500)" : "text-red-500"}`}
            >
              {d.up ? (
                <TrendingUp className="w-4 h-4 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 shrink-0" />
              )}
              {d.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
