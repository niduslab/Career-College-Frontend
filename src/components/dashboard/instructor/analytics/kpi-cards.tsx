"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { TrendingUp, TrendingDown, Users, Star, DollarSign, Eye, Clock, Award } from "lucide-react";

const KPI_DATA = [
  { label: "Total Revenue",   value: "$24,802",  change: "+12.5%", up: true,  sub: "vs last month",    icon: DollarSign, bg: "bg-purple-50", iconColor: "text-purple-600", valueColor: "text-purple-600" },
  { label: "Total Students",  value: "1,420",    change: "+4.2%",  up: true,  sub: "new enrollments",  icon: Users,      bg: "bg-blue-50",   iconColor: "text-blue-600",   valueColor: "text-blue-600" },
  { label: "Course Views",    value: "38,540",   change: "+8.1%",  up: true,  sub: "this month",       icon: Eye,        bg: "bg-green-50",  iconColor: "text-green-600",  valueColor: "text-green-600" },
  { label: "Avg. Rating",     value: "4.92",     change: "-0.03",  up: false, sub: "204 reviews",      icon: Star,       bg: "bg-yellow-50", iconColor: "text-yellow-500", valueColor: "text-yellow-600" },
  { label: "Completion Rate", value: "73%",      change: "+5.3%",  up: true,  sub: "avg all courses",  icon: Award,      bg: "bg-orange-50", iconColor: "text-orange-500", valueColor: "text-orange-600" },
  { label: "Watch Time",      value: "12,840 h", change: "+18.2%", up: true,  sub: "total this month", icon: Clock,      bg: "bg-pink-50",   iconColor: "text-pink-500",   valueColor: "text-pink-600" },
];

export default function KpiCards() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: i * 0.08, ease: "back.out(1.4)" },
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
            ref={(el) => { cardsRef.current[i] = el; }}
            className="opacity-0 flex flex-col gap-2 bg-white border border-(--gray-200) rounded-2xl px-4 py-4"
          >
            <div className={`w-9 h-9 rounded-xl ${d.bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${d.iconColor}`} />
            </div>
            <p className={`text-[22px] font-bold leading-none ${d.valueColor}`}>{d.value}</p>
            <div>
              <p className="text-[12px] font-medium text-(--text-title)">{d.label}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {d.up
                  ? <TrendingUp className="w-3 h-3 text-green-500 shrink-0" />
                  : <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />
                }
                <span className={`text-[11px] font-semibold ${d.up ? "text-green-600" : "text-red-500"}`}>{d.change}</span>
                <span className="text-[11px] text-(--gray-500)">{d.sub}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
