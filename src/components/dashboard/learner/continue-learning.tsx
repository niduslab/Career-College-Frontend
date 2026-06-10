"use client";

import { useEffect, useRef } from "react";
import {
  Play,
  Monitor,
  Clock,
  Radio,
  FileText,
  Users,
  Video,
} from "lucide-react";
import gsap from "gsap";

const upcoming = [
  {
    icon: Radio,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    title: "Gradient Boosting Quiz",
    time: "Today, 4:00 PM",
    action: "Start",
    actionStyle:
      "border border-(--primary-600) text-(--primary-600) hover:bg-(--primary-50)",
  },
  {
    icon: Video,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    title: "Live: Tuning Neural Nets",
    time: "Tomorrow, 6:30 PM",
    action: "Join",
    actionStyle:
      "border border-(--primary-600) text-(--primary-600) hover:bg-(--primary-50)",
  },
  {
    icon: FileText,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    title: "Dashboard Build Submission",
    time: "Thu, 11:59 PM",
    action: "Open",
    actionStyle:
      "border border-(--primary-600) text-(--primary-600) hover:bg-(--primary-50)",
  },
  {
    icon: Users,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "ML Study Circle Sync",
    time: "Fri, 7:00 PM",
    action: "View",
    actionStyle:
      "border border-(--primary-600) text-(--primary-600) hover:bg-(--primary-50)",
  },
];

export default function ContinueLearning() {
  const heroRef = useRef<HTMLDivElement>(null);
  const upcomingRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, x: -32 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.35 },
      );
    }
    if (progressBarRef.current) {
      gsap.fromTo(
        progressBarRef.current,
        { width: "0%" },
        { width: "68%", duration: 1.4, ease: "power2.out", delay: 0.8 },
      );
    }
    if (upcomingRef.current) {
      const rows = upcomingRef.current.querySelectorAll(".upcoming-row");
      gsap.fromTo(
        rows,
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.09,
          ease: "power3.out",
          delay: 0.45,
        },
      );
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Continue Learning — purple hero card */}
      <div
        ref={heroRef}
        className="opacity-0 relative flex-3 rounded-2xl overflow-hidden p-6 lg:p-8 flex flex-col justify-between min-h-55"
        style={{
          background:
            "linear-gradient(135deg, #5B1FD6 0%, #7B2FE8 45%, #8B35F5 100%)",
        }}
      >
        {/* diagonal stripe texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 16px, transparent 16px, transparent 32px)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] font-semibold text-white  tracking-widest uppercase">
              Continue Learning
            </span>
          </div>
          <h2 className="text-[20px] lg:text-[30px] font-bold text-white leading-snug max-w-110">
            Applied Machine Learning with Python
          </h2>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
              DL
            </div>
            <span className="text-[14px] text-white font-normal">
              Dr. Lena Park
            </span>
            <span className="text-gray-400 text-[14px] font-normal">•</span>
            <span className="text-[14px] text-white font-normal">
              AI &amp; ML
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="relative z-10 mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[14px] text-white">
              Up next: Gradient Boosting &amp; XGBoost
            </span>
            <span className="text-[14px] font-semibold text-white">
              68% complete
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/20">
            <div
              ref={progressBarRef}
              className="h-2.5 rounded-full bg-white"
              style={{ width: "0%" }}
            />
          </div>

          <div className="flex items-center gap-5 mt-5">
            <button className="flex items-center gap-2 cursor-pointer bg-white text-(--primary-700) font-semibold text-[14px] px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors">
              <Play className="w-4 h-4 fill-current" />
              Resume Learning
            </button>
            <span className="flex items-center gap-1.5  text-[14px] text-white">
              <Monitor className="w-4 h-4" />
              15 lessons left
            </span>
            <span className="flex items-center gap-1.5 text-[14px] text-white">
              <Clock className="w-4 h-4" />
              6h 20m
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div
        ref={upcomingRef}
        className="flex-2 bg-white rounded-2xl border border-(--gray-200)  p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-(--text-title)">
            Upcoming
          </h3>
          <span className="text-[12px] font-semibold text-(--primary-600) bg-(--primary-50) px-2.5 py-1 rounded-lg">
            4 this week
          </span>
        </div>

        <ul className="space-y-3">
          {upcoming.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="upcoming-row opacity-0 flex bg-gray-100 p-3 rounded-xl items-center gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-(--text-title) truncate">
                    {item.title}
                  </p>
                  <p className="text-[12px] text-(--gray-400) font-medium">
                    {item.time}
                  </p>
                </div>
                <button
                  className={`shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-colors ${item.actionStyle}`}
                >
                  {item.action}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
