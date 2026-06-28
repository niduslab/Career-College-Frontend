import { COURSE_PERFORMANCE } from "./data";

export default function CoursePerformance() {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">Course Performance</p>

      {/* Header */}
      <div className="grid grid-cols-[2fr_80px_90px_80px] gap-2 px-1">
        {["Course", "Enrolled", "Completion", "Revenue"].map((h) => (
          <p key={h} className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">{h}</p>
        ))}
      </div>

      <div className="space-y-1">
        {COURSE_PERFORMANCE.map((c) => (
          <div key={c.title} className="grid grid-cols-[2fr_80px_90px_80px] gap-2 items-center px-1 py-2.5 rounded-xl hover:bg-(--gray-50) transition-colors">
            <p className="text-[13px] font-medium text-(--text-title) truncate">{c.title}</p>
            <p className="text-[13px] font-semibold text-(--text-title)">{c.enrolled.toLocaleString()}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.completion >= 90 ? "bg-emerald-500" : c.completion >= 80 ? "bg-(--primary-600)" : "bg-orange-400"}`}
                  style={{ width: `${c.completion}%` }}
                />
              </div>
              <span className="text-[12px] font-semibold text-(--text-title) shrink-0">{c.completion}%</span>
            </div>
            <p className="text-[13px] font-semibold text-(--text-title)">{c.revenue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
