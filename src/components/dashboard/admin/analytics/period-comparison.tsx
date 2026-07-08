"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  GraduationCap,
  CheckCircle2,
  DollarSign,
  UserCog,
  ArrowUp,
} from "lucide-react";
import { PERIOD_COMPARISON } from "./data";

const ICONS = [Wallet, Users, GraduationCap, CheckCircle2, DollarSign, UserCog];

const maxPct = Math.max(...PERIOD_COMPARISON.map((r) => r.pct));

export default function PeriodComparison() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    barRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${el.dataset.progress}%`,
          duration: 0.7,
          delay: 0.1 + i * 0.08,
          ease: "power3.out",
        },
      );
    });
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
            Month-over-Month
          </p>
          <p className="text-[12px] text-(--gray-400) mt-0.5">
            Jun 2026 vs May 2026
          </p>
        </div>
        <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          Most metrics up <ArrowUp className="w-3.5 h-3.5 inline-block" />
        </span>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-160 border-collapse">
          <thead>
            <tr className="border-b border-(--gray-100)">
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                Metric
              </th>
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                This Month
              </th>
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                Last Month
              </th>
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                Growth
              </th>
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--gray-50)">
            {PERIOD_COMPARISON.map((row, i) => {
              const Icon = ICONS[i];
              const barPct = Math.round((row.pct / maxPct) * 100);
              return (
                <tr
                  key={row.metric}
                  className="hover:bg-(--gray-50) transition-colors"
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-(--gray-100) text-(--gray-500)">
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-[13px] font-semibold text-(--text-title)">
                        {row.metric}
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5 pr-4 text-[14px] font-bold text-(--text-title)">
                    {row.thisMonth}
                  </td>
                  <td className="py-3.5 pr-4 text-[13px] text-(--gray-400)">
                    {row.lastMonth}
                  </td>

                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2 w-30">
                      <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                        <div
                          ref={(el) => {
                            barRefs.current[i] = el;
                          }}
                          data-progress={barPct}
                          className={`h-full rounded-full ${row.up ? "bg-emerald-500" : "bg-red-400"}`}
                          style={{ width: "0%" }}
                        />
                      </div>
                      <span className="text-[11px] text-(--gray-400) shrink-0 w-7 text-right">
                        {barPct}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold w-fit ${row.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                    >
                      {row.up ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {row.change}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
