"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Wallet,
  Handshake,
  FileText,
  GraduationCap,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const KPIS = [
  {
    label: "Total Revenue",
    value: "$38,540",
    change: "+18.3%",
    trend: "up",
    sub: "vs last month",
    icon: Wallet,
    accent: "bg-emerald-50 text-emerald-600",
    ring: "stroke-emerald-500",
    pct: 78,
  },
  {
    label: "Active Partners",
    value: "24",
    change: "+3",
    trend: "up",
    sub: "new this month",
    icon: Handshake,
    accent: "bg-(--primary-50) text-(--primary-600)",
    ring: "stroke-(--primary-600)",
    pct: 65,
  },
  {
    label: "Open Proposals",
    value: "9",
    change: "3 expiring",
    trend: "warn",
    sub: "within 7 days",
    icon: FileText,
    accent: "bg-orange-50 text-orange-500",
    ring: "stroke-orange-400",
    pct: 40,
  },
  {
    label: "Active Courses",
    value: "56",
    change: "+8",
    trend: "up",
    sub: "added this month",
    icon: GraduationCap,
    accent: "bg-blue-50 text-blue-600",
    ring: "stroke-blue-500",
    pct: 85,
  },
];

const R = 20;
const CIRC = 2 * Math.PI * R;

export default function DashboardKpiCards() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ringRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 24, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          delay: i * 0.09,
          ease: "back.out(1.4)",
        },
      );
    });
    ringRefs.current.forEach((el, i) => {
      if (!el) return;
      const pct = KPIS[i].pct;
      const target = CIRC - (pct / 100) * CIRC;
      gsap.fromTo(
        el,
        { strokeDashoffset: CIRC },
        {
          strokeDashoffset: target,
          duration: 1,
          delay: 0.3 + i * 0.09,
          ease: "power3.out",
        },
      );
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {KPIS.map((k, i) => {
        const Icon = k.icon;
        const dashTarget = CIRC - (k.pct / 100) * CIRC;
        return (
          <div
            key={k.label}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="opacity-0 bg-white rounded-2xl p-5 border border-(--gray-200) flex flex-col gap-4"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.accent}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {/* Progress ring */}
              <svg
                width="52"
                height="52"
                viewBox="0 0 52 52"
                className="-mt-1 -mr-1"
              >
                <circle
                  cx="26"
                  cy="26"
                  r={R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-(--gray-100)"
                />
                <circle
                  ref={(el) => {
                    ringRefs.current[i] = el;
                  }}
                  cx="26"
                  cy="26"
                  r={R}
                  fill="none"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashTarget}
                  className={k.ring}
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                  }}
                />
                <text
                  x="26"
                  y="30"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="currentColor"
                  className="text-(--text-title) fill-current"
                >
                  {k.pct}%
                </text>
              </svg>
            </div>

            {/* Value */}
            <div>
              <p className="text-[12px] text-(--gray-500) font-normal mb-1">
                {k.label}
              </p>
              <p className="text-[22px] lg:text-[26px] font-bold text-(--text-title) leading-none">
                {k.value}
              </p>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-1.5">
              {k.trend === "up" && (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              )}
              {k.trend === "down" && (
                <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" />
              )}
              {k.trend === "warn" && (
                <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
              )}
              <span
                className={`text-[12px] font-semibold ${k.trend === "up" ? "text-emerald-600" : k.trend === "warn" ? "text-orange-500" : "text-red-500"}`}
              >
                {k.change}
              </span>
              <span className="text-[12px] text-(--gray-400)">{k.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
