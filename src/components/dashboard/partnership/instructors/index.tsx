"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import InstructorsStatsCards from "./stats-cards";
import InstructorsTable from "./table";
import { getExperts, getDepartments } from "@/lib/partner-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { Department, Expert } from "./types";

const TIPS = [
  {
    color: "text-blue-500",
    text: "Experts you onboard are auto-verified and can start authoring content immediately.",
  },
  {
    color: "text-green-500",
    text: "Assign a department when onboarding so experts are easy to filter later.",
  },
  {
    color: "text-orange-500",
    text: "Deactivating an expert removes them from future course assignments.",
  },
];

const BAR_COLORS = [
  "bg-(--primary-600)",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-pink-500",
];

async function fetchExpertsAndDepartments(): Promise<{
  experts: Expert[];
  departments: Department[];
} | null> {
  try {
    const [expertsRes, departments] = await Promise.all([
      getExperts(),
      getDepartments(),
    ]);
    return { experts: expertsRes.results, departments };
  } catch (err) {
    notify.error(
      err instanceof ApiError ? err.message : "Failed to load experts.",
    );
    return null;
  }
}

export default function InstructorsPageContent() {
  const barRef = useRef<(HTMLDivElement | null)[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    let active = true;
    fetchExpertsAndDepartments().then((result) => {
      if (!active || !result) return;
      setExperts(result.experts);
      setDepartments(result.departments);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const deptBreakdown = departments
    .map((dept) => ({
      label: dept.name,
      count: experts.filter((e) => e.department?.id === dept.id).length,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(1, ...deptBreakdown.map((d) => d.count));

  const specializationTags = Array.from(
    new Set(experts.flatMap((e) => e.specialization)),
  ).slice(0, 12);

  useEffect(() => {
    barRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${el.dataset.progress}%`,
          duration: 0.8,
          delay: 0.3 + i * 0.1,
          ease: "power3.out",
        },
      );
    });
  }, [deptBreakdown]);

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* Left */}
      <div className="flex-1 space-y-5">
        <InstructorsStatsCards experts={experts} />
        <InstructorsTable
          experts={experts}
          departments={departments}
          loading={loading}
          onRefresh={refresh}
        />
      </div>

      {/* Right sidebar */}
      <div className="w-full xl:w-60 2xl:w-72 shrink-0 space-y-4">
        {/* Department Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            By Department
          </p>
          {deptBreakdown.length === 0 ? (
            <p className="text-[12px] text-(--gray-400)">
              No experts assigned to departments yet.
            </p>
          ) : (
            <div className="space-y-3">
              {deptBreakdown.map((dept, i) => {
                const pct = Math.round((dept.count / maxCount) * 100);
                return (
                  <div key={dept.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-(--text-title) truncate">
                        {dept.label}
                      </span>
                      <span className="text-[12px] text-(--gray-500) shrink-0 ml-2">
                        {dept.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                      <div
                        ref={(el) => {
                          barRef.current[i] = el;
                        }}
                        data-progress={pct}
                        className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                        style={{ width: "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Specializations */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Specializations
          </p>
          {specializationTags.length === 0 ? (
            <p className="text-[12px] text-(--gray-400)">
              No specializations recorded yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {specializationTags.map((label) => (
                <span
                  key={label}
                  className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-(--gray-100) text-(--gray-600)"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-600)" />
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Tips
            </p>
          </div>
          <div className="space-y-2.5">
            {TIPS.map(({ color, text }) => (
              <div key={text} className="flex items-start gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color.replace("text-", "bg-")}`}
                />
                <p className="text-[12px] text-(--gray-500) leading-snug">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
