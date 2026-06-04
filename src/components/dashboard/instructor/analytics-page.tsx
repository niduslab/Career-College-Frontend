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
  BarChart2,
} from "lucide-react";

// Data

const KPI_DATA = [
  {
    label: "Total Revenue",
    value: "$24,802",
    change: "+12.5%",
    up: true,
    sub: "vs last month",
    icon: DollarSign,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    valueColor: "text-purple-600",
  },
  {
    label: "Total Students",
    value: "1,420",
    change: "+4.2%",
    up: true,
    sub: "new enrollments",
    icon: Users,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    valueColor: "text-blue-600",
  },
  {
    label: "Course Views",
    value: "38,540",
    change: "+8.1%",
    up: true,
    sub: "this month",
    icon: Eye,
    bg: "bg-green-50",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
  },
  {
    label: "Avg. Rating",
    value: "4.92",
    change: "-0.03",
    up: false,
    sub: "204 reviews",
    icon: Star,
    bg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    valueColor: "text-yellow-600",
  },
  {
    label: "Completion Rate",
    value: "73%",
    change: "+5.3%",
    up: true,
    sub: "avg all courses",
    icon: Award,
    bg: "bg-orange-50",
    iconColor: "text-orange-500",
    valueColor: "text-orange-600",
  },
  {
    label: "Watch Time",
    value: "12,840 h",
    change: "+18.2%",
    up: true,
    sub: "total this month",
    icon: Clock,
    bg: "bg-pink-50",
    iconColor: "text-pink-500",
    valueColor: "text-pink-600",
  },
];

const TOP_COURSES = [
  {
    name: "UI/UX Design Mastery",
    students: 420,
    revenue: "$8,200",
    rating: 4.9,
    completion: 78,
  },
  {
    name: "React & Next.js Bootcamp",
    students: 380,
    revenue: "$7,600",
    rating: 4.8,
    completion: 71,
  },
  {
    name: "Figma for Beginners",
    students: 310,
    revenue: "$4,650",
    rating: 4.9,
    completion: 85,
  },
  {
    name: "Advanced CSS Techniques",
    students: 190,
    revenue: "$2,850",
    rating: 4.7,
    completion: 66,
  },
  {
    name: "Product Design Principles",
    students: 120,
    revenue: "$1,800",
    rating: 4.6,
    completion: 60,
  },
];

const TRAFFIC_DATA = [
  { source: "Organic Search", pct: 42, color: "bg-purple-500" },
  { source: "Direct", pct: 28, color: "bg-blue-500" },
  { source: "Social Media", pct: 18, color: "bg-green-500" },
  { source: "Referral", pct: 12, color: "bg-orange-400" },
];

// KPI Cards

function KpiCards() {
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
            className="opacity-0 flex flex-col gap-2 bg-white border border-(--gray-200) rounded-2xl px-4 py-4"
          >
            <div
              className={`w-9 h-9 rounded-xl ${d.bg} flex items-center justify-center`}
            >
              <Icon className={`w-5 h-5 ${d.iconColor}`} />
            </div>
            <p className={`text-[22px] font-bold leading-none ${d.valueColor}`}>
              {d.value}
            </p>
            <div>
              <p className="text-[12px] font-medium text-(--text-title)">
                {d.label}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {d.up ? (
                  <TrendingUp className="w-3 h-3 text-green-500 shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />
                )}
                <span
                  className={`text-[11px] font-semibold ${d.up ? "text-green-600" : "text-red-500"}`}
                >
                  {d.change}
                </span>
                <span className="text-[11px] text-(--gray-400)">{d.sub}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Traffic Sources

function TrafficSources() {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const legendRefs = useRef<(HTMLDivElement | null)[]>([]);
  const maxPct = Math.max(...TRAFFIC_DATA.map((d) => d.pct));

  useEffect(() => {
    barsRef.current.forEach((el, i) => {
      if (!el) return;
      const pct = (TRAFFIC_DATA[i].pct / maxPct) * 100;
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${pct}%`,
          duration: 0.8,
          delay: 0.2 + i * 0.1,
          ease: "power3.out",
        },
      );
    });
    legendRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          delay: 0.3 + i * 0.08,
          ease: "power2.out",
        },
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4 w-full xl:w-72 shrink-0">
      <div>
        <p className="text-[15px] font-semibold text-(--text-title)">
          Traffic Sources
        </p>
        <p className="text-[12px] text-(--gray-400) mt-0.5">
          Where students come from
        </p>
      </div>

      {/* stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {TRAFFIC_DATA.map((d) => (
          <div
            key={d.source}
            className={`${d.color} h-full`}
            style={{ width: `${d.pct}%` }}
          />
        ))}
      </div>

      <div className="space-y-3">
        {TRAFFIC_DATA.map((d, i) => (
          <div
            key={d.source}
            ref={(el) => {
              legendRefs.current[i] = el;
            }}
            className="opacity-0 flex items-center gap-3"
          >
            <span className="text-[12px] font-medium text-(--gray-600) w-28 shrink-0">
              {d.source}
            </span>
            <div className="flex-1 h-7 bg-(--gray-100) rounded-lg overflow-hidden relative">
              <div
                ref={(el) => {
                  barsRef.current[i] = el;
                }}
                className={`h-full rounded-lg ${d.color} opacity-85`}
                style={{ width: "0%" }}
              />
              <span className="absolute inset-0 flex items-center pl-3 text-[12px] font-semibold text-white pointer-events-none">
                {d.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top Courses

function TopCourses() {
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          delay: 0.3 + i * 0.08,
          ease: "power2.out",
        },
      );
    });
  }, []);

  const maxStudents = Math.max(...TOP_COURSES.map((c) => c.students));

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-(--primary-600)" />
        <p className="text-[15px] font-semibold text-(--text-title)">
          Top Performing Courses
        </p>
      </div>

      <div className="space-y-1">
        {TOP_COURSES.map((c, i) => (
          <div
            key={c.name}
            ref={(el) => {
              rowsRef.current[i] = el;
            }}
            className="opacity-0 flex items-center gap-3 py-3 border-b border-(--gray-100) last:border-0"
          >
            <div className="w-7 h-7 rounded-full bg-(--primary-700) text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            <p className="flex-1 text-[13px] font-medium text-(--text-title) truncate min-w-0">
              {c.name}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-24 h-2.5 bg-(--gray-100) rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-(--primary-600)"
                  style={{ width: `${(c.students / maxStudents) * 100}%` }}
                />
              </div>
              <span className="text-[12px] font-semibold text-(--text-title) w-10 text-right">
                {c.students.toLocaleString()}
              </span>
            </div>
            <span className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span className="text-[12px] font-semibold text-(--text-title)">
                {c.rating}
              </span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0 w-20">
              <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    c.completion >= 80
                      ? "bg-green-500"
                      : c.completion >= 65
                        ? "bg-blue-500"
                        : "bg-orange-400"
                  }`}
                  style={{ width: `${c.completion}%` }}
                />
              </div>
              <span className="text-[11px] text-(--gray-500) shrink-0">
                {c.completion}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Export

export default function AnalyticsPageContent() {
  return (
    <div className="flex flex-col gap-4">
      <KpiCards />
      <div className="flex flex-col xl:flex-row gap-4">
        <TopCourses />
        <TrafficSources />
      </div>
    </div>
  );
}
