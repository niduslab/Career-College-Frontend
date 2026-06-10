"use client";

import { useEffect, useRef } from "react";
import { Zap, Flame, CheckSquare, Award, Clock } from "lucide-react";
import gsap from "gsap";

const stats = [
  {
    icon: Zap,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
    iconFill: true,
    value: 8420,
    suffix: "",
    display: "8,420",
    label: "XP Points",
    badge: "+340 this week",
    badgeColor: "text-[var(--primary-600)]",
  },
  {
    icon: Flame,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
    iconFill: true,
    value: 27,
    suffix: "",
    display: "27",
    label: "Day Streak",
    badge: "Personal best!",
    badgeColor: "text-[var(--primary-600)]",
  },
  {
    icon: CheckSquare,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
    iconFill: false,
    value: 9,
    suffix: "",
    display: "9",
    label: "Courses Done",
    badge: "2 in progress",
    badgeColor: "text-[var(--primary-600)]",
  },
  {
    icon: Award,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
    iconFill: false,
    value: 6,
    suffix: "",
    display: "6",
    label: "Certificates",
    badge: "+1 last month",
    badgeColor: "text-[var(--primary-600)]",
  },
  {
    icon: Clock,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
    iconFill: false,
    value: 184,
    suffix: "h",
    display: "184h",
    label: "Hours Learned",
    badge: "12h this week",
    badgeColor: "text-[var(--primary-600)]",
  },
];

export default function LearnerStatsCards() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(".stat-card");

    gsap.fromTo(
      cards,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power3.out" },
    );

    countersRef.current.forEach((el, i) => {
      if (!el) return;
      const { value, suffix } = stats[i];
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
  }, []);

  return (
    <div
      ref={cardsRef}
      className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="stat-card bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 opacity-0"
          >
            {/* Top row: label + value left, icon right */}
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
              <div
                className={`w-10 h-10 rounded-[6px_4px_6px_6px] ${stat.iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon
                  className={`w-6 h-6 ${stat.iconColor}`}
                  fill={stat.iconFill ? "currentColor" : "none"}
                />
              </div>
            </div>

            {/* Dashed divider */}
            <div className="border border-dashed border-gray-200 my-1" />

            {/* Badge */}
            <p className="text-[12px] font-medium text-(--success-500)">
              {stat.badge}
            </p>
          </div>
        );
      })}
    </div>
  );
}
