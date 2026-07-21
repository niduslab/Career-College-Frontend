"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Users, UserCheck, UserPlus, UserX, Loader2 } from "lucide-react";
import { useAdminAnalyticsSummary, useSuspendedUserCount } from "@/hooks/use-admin-analytics";

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

export default function UsersStatsCards() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { data: summary, isLoading: summaryLoading } = useAdminAnalyticsSummary();
  const { data: suspendedCount, isLoading: suspendedLoading } = useSuspendedUserCount();

  const isLoading = summaryLoading || suspendedLoading;
  const users = summary?.users;

  const activePct =
    users && users.total > 0 ? Math.round((users.active / users.total) * 1000) / 10 : null;
  const suspendedPct =
    users && users.total > 0 && suspendedCount !== undefined
      ? Math.round((suspendedCount / users.total) * 1000) / 10
      : null;

  const stats = [
    {
      label: "Total Users",
      value: users ? formatNumber(users.total) : "—",
      change: users ? `${formatPct(users.growth_pct)} vs previous 30 days` : "",
      icon: Users,
    },
    {
      label: "Active Users",
      value: users ? formatNumber(users.active) : "—",
      change: activePct !== null ? `${activePct}% of total` : "",
      icon: UserCheck,
    },
    {
      label: "New Signups",
      value: users ? formatNumber(users.new_this_window) : "—",
      change: "Last 30 days",
      icon: UserPlus,
    },
    {
      label: "Suspended",
      value: suspendedCount !== undefined ? formatNumber(suspendedCount) : "—",
      change: suspendedPct !== null ? `${suspendedPct}% of total` : "",
      icon: UserX,
    },
  ];

  useEffect(() => {
    if (isLoading) return;
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
  }, [isLoading]);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className={`${isLoading ? "" : "opacity-0"} bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                  {s.label}
                </p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-(--gray-300)" />
                  ) : (
                    s.value
                  )}
                </p>
              </div>
              <div className="w-10 h-10 xl:w-8 xl:h-8 rounded-[6px_4px_6px_6px] flex items-center justify-center shrink-0 bg-(--primary-50) text-(--primary-600)">
                <Icon className="w-6 h-6 xl:w-5 xl:h-5" />
              </div>
            </div>
            <div className="border border-dashed border-gray-200" />
            <p className="text-[12px] font-medium text-(--gray-500)">
              {isLoading ? "Loading…" : s.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
