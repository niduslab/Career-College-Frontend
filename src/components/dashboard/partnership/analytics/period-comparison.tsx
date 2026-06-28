"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  TrendingUp, TrendingDown, Wallet, Handshake,
  FileText, Target, DollarSign, Video,
} from "lucide-react";

const ROWS = [
  { metric: "Revenue", icon: Wallet, thisMonth: "$38,540", lastMonth: "$32,580", change: "+18.3%", up: true, pct: 18.3 },
  { metric: "New Partners", icon: Handshake, thisMonth: "3", lastMonth: "2", change: "+50%", up: true, pct: 50 },
  { metric: "Proposals Sent", icon: FileText, thisMonth: "12", lastMonth: "10", change: "+20%", up: true, pct: 20 },
  { metric: "Win Rate", icon: Target, thisMonth: "62%", lastMonth: "55%", change: "+7pp", up: true, pct: 7 },
  { metric: "Avg. Deal Value", icon: DollarSign, thisMonth: "$4,280", lastMonth: "$3,960", change: "+8.1%", up: true, pct: 8.1 },
  { metric: "Webinar Attendance", icon: Video, thisMonth: "78%", lastMonth: "71%", change: "+7pp", up: true, pct: 7 },
];

const maxPct = Math.max(...ROWS.map((r) => r.pct));

export default function PeriodComparison() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    barRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        { width: `${el.dataset.progress}%`, duration: 0.7, delay: 0.1 + i * 0.08, ease: "power3.out" },
      );
    });
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">Month-over-Month</p>
          <p className="text-[12px] text-(--gray-400) mt-0.5">Jun 2026 vs May 2026</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          All metrics up ↑
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-160">

      {/* Table header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_120px_100px] gap-4 px-3 pb-2 border-b border-(--gray-100)">
        {["Metric", "This Month", "Last Month", "Growth", "Change"].map((h) => (
          <p key={h} className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">{h}</p>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-(--gray-50)">
        {ROWS.map((row, i) => {
          const Icon = row.icon;
          const barPct = Math.round((row.pct / maxPct) * 100);
          return (
            <div
              key={row.metric}
              className="grid grid-cols-[2fr_1fr_1fr_120px_100px] gap-4 items-center px-3 py-3.5 hover:bg-(--gray-50) rounded-xl transition-colors"
            >
              {/* Metric */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-(--gray-100) text-(--gray-500)">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-[13px] font-semibold text-(--text-title)">{row.metric}</p>
              </div>

              {/* This month */}
              <p className="text-[14px] font-bold text-(--text-title)">{row.thisMonth}</p>

              {/* Last month */}
              <p className="text-[13px] text-(--gray-400)">{row.lastMonth}</p>

              {/* Growth bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                  <div
                    ref={(el) => { barRefs.current[i] = el; }}
                    data-progress={barPct}
                    className={`h-full rounded-full ${row.up ? "bg-emerald-500" : "bg-red-400"}`}
                    style={{ width: "0%" }}
                  />
                </div>
                <span className="text-[11px] text-(--gray-400) shrink-0 w-7 text-right">{barPct}%</span>
              </div>

              {/* Change badge */}
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold w-fit ${row.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                {row.up
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <TrendingDown className="w-3.5 h-3.5" />}
                {row.change}
              </div>
            </div>
          );
        })}
      </div>
        </div>
      </div>
    </div>
  );
}
