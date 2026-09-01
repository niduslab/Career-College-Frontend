"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Building2, ShieldCheck, Clock, UserX, Loader2 } from "lucide-react";
import { useAdminAnalyticsSummary } from "@/hooks/use-admin-analytics";
import { useQuery } from "@tanstack/react-query";
import { countAdminUsers } from "@/lib/admin-console-api";

function formatNumber(n: number | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString();
}

function usePartnerCount(params: { is_verified?: boolean; is_restricted_by_admin?: boolean }) {
  return useQuery({
    queryKey: ["admin-users-count", { user_type: "partner_institution", ...params }],
    queryFn: () => countAdminUsers({ user_type: "partner_institution", ...params }),
    staleTime: 60 * 1000,
  });
}

export default function PartnersStatsCards() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { data: summary, isLoading: summaryLoading } = useAdminAnalyticsSummary();
  const { data: verifiedCount, isLoading: verifiedLoading } = usePartnerCount({
    is_verified: true,
  });
  const { data: unverifiedCount, isLoading: unverifiedLoading } = usePartnerCount({
    is_verified: false,
  });
  const { data: suspendedCount, isLoading: suspendedLoading } = usePartnerCount({
    is_restricted_by_admin: true,
  });

  const isLoading =
    summaryLoading || verifiedLoading || unverifiedLoading || suspendedLoading;

  const total = summary?.users.by_type.partner_institution;

  const pctOfTotal = (n: number | undefined): string => {
    if (n === undefined || !total) return "";
    return `${Math.round((n / total) * 1000) / 10}% of total`;
  };

  const stats = [
    {
      label: "Total Partners",
      value: formatNumber(total),
      change: summary ? `${formatNumber(summary.users.total)} total users` : "",
      icon: Building2,
    },
    {
      label: "Verified",
      value: formatNumber(verifiedCount),
      change: pctOfTotal(verifiedCount),
      icon: ShieldCheck,
    },
    {
      label: "Pending Verification",
      value: formatNumber(unverifiedCount),
      change: pctOfTotal(unverifiedCount),
      icon: Clock,
    },
    {
      label: "Suspended",
      value: formatNumber(suspendedCount),
      change: pctOfTotal(suspendedCount),
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
