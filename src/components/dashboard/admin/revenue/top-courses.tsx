"use client";

import { TOP_REVENUE_COURSES } from "./data";

const maxRevenue = Math.max(...TOP_REVENUE_COURSES.map((c) => c.revenueNum));

export default function TopRevenueCourses() {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">Top Revenue Courses</p>
      <div className="space-y-3">
        {TOP_REVENUE_COURSES.map((c, i) => {
          const pct = Math.round((c.revenueNum / maxRevenue) * 100);
          return (
            <div key={c.title} className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-(--gray-400) w-4 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-(--text-title) truncate">{c.title}</p>
                  <span className="text-[11px] text-(--gray-400) shrink-0">{c.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-(--primary-600) transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-(--text-title) shrink-0">{c.revenue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
