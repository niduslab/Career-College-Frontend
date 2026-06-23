"use client";

import Image from "next/image";
import { TrendingUp, TrendingDown } from "lucide-react";
import { TOP_PARTNERS } from "./data";

const maxRevenue = Math.max(...TOP_PARTNERS.map((p) => p.revenueNum));

export default function TopPartners() {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">Top Partners</p>
      <div className="space-y-3">
        {TOP_PARTNERS.map((p, i) => {
          const pct = Math.round((p.revenueNum / maxRevenue) * 100);
          return (
            <div key={p.name} className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-(--gray-400) w-4 shrink-0">{i + 1}</span>
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                <Image src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-(--text-title) truncate">{p.name}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {p.up
                      ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                      : <TrendingDown className="w-3 h-3 text-red-400" />}
                    <span className={`text-[11px] font-semibold ${p.up ? "text-emerald-600" : "text-red-500"}`}>{p.change}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-(--primary-600) transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-(--text-title) shrink-0">{p.revenue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
