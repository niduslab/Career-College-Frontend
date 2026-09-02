"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Clock, CheckCircle2, Wallet, ShieldAlert, Loader2 } from "lucide-react";
import { usePayouts, usePayoutAccounts } from "@/hooks/use-admin-payouts";

function formatNumber(n: number | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString();
}

export default function PayoutsStatsCards() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { data: pending, isLoading: pendingLoading } = usePayouts({
    status: "pending",
    page: 1,
    page_size: 1,
  });
  const { data: approved, isLoading: approvedLoading } = usePayouts({
    status: "approved",
    page: 1,
    page_size: 1,
  });
  const { data: paid, isLoading: paidLoading } = usePayouts({
    status: "paid",
    page: 1,
    page_size: 1,
  });
  const { data: unverifiedAccounts, isLoading: accountsLoading } = usePayoutAccounts({
    is_verified: false,
    page: 1,
    page_size: 1,
  });

  const isLoading = pendingLoading || approvedLoading || paidLoading || accountsLoading;

  const stats = [
    {
      label: "Pending Review",
      value: formatNumber(pending?.count),
      change: "Awaiting admin decision",
      icon: Clock,
    },
    {
      label: "Approved",
      value: formatNumber(approved?.count),
      change: "Ready to be marked paid",
      icon: CheckCircle2,
    },
    {
      label: "Paid",
      value: formatNumber(paid?.count),
      change: "Completed payouts",
      icon: Wallet,
    },
    {
      label: "Accounts Needing Verification",
      value: formatNumber(unverifiedAccounts?.count),
      change: "Blocks payout generation",
      icon: ShieldAlert,
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
