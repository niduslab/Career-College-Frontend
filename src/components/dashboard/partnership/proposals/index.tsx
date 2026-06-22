"use client";

import { useEffect, useRef } from "react";
import { Sparkles, Clock } from "lucide-react";
import gsap from "gsap";
import ProposalsStatsCards from "./stats-cards";
import ProposalsTable from "./table";
import { RECENT_ACTIVITY, TIPS, PROPOSALS } from "./data";
import { ProposalStatus } from "./types";

export default function ProposalsPageContent() {
  const breakdownRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    breakdownRef.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        { width: `${el.dataset.progress}%`, duration: 0.8, delay: 0.4, ease: "power3.out" },
      );
    });
  }, []);

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* Left */}
      <div className="flex-1 space-y-5">
        <ProposalsStatsCards />
        <ProposalsTable />
      </div>

      {/* Right sidebar */}
      <div className="w-full xl:w-60 2xl:w-72 shrink-0 space-y-4">

        {/* Recent Activity */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-(--primary-600)" />
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Recent Activity
            </p>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${item.color}`}>
                  {item.action}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-(--text-title) truncate leading-snug">{item.label}</p>
                  <p className="text-[11px] text-(--gray-400) truncate">{item.org} · {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Status Breakdown
          </p>
          <div className="space-y-2">
            {(["Approved", "Pending", "Rejected", "Draft"] as ProposalStatus[]).map((st, i) => {
              const count = PROPOSALS.filter((p) => p.status === st).length;
              const pct = Math.round((count / PROPOSALS.length) * 100);
              const bar =
                st === "Approved" ? "bg-green-500"
                : st === "Pending" ? "bg-orange-400"
                : st === "Rejected" ? "bg-red-400"
                : "bg-gray-300";
              const text =
                st === "Approved" ? "text-green-600"
                : st === "Pending" ? "text-orange-500"
                : st === "Rejected" ? "text-red-500"
                : "text-gray-500";
              return (
                <div key={st} className="flex items-center gap-3">
                  <span className="text-[12px] text-(--gray-600) w-16 shrink-0">{st}</span>
                  <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      ref={(el) => { breakdownRef.current[i] = el; }}
                      data-progress={pct}
                      className={`h-full rounded-full ${bar}`}
                      style={{ width: "0%" }}
                    />
                  </div>
                  <span className={`text-[12px] font-semibold ${text} w-8 text-right shrink-0`}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-600)" />
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Proposal Tips
            </p>
          </div>
          <div className="space-y-2.5">
            {TIPS.map(({ color, text }) => (
              <div key={text} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color.replace("text-", "bg-")}`} />
                <p className="text-[12px] text-(--gray-500) leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
