import { Sparkles } from "lucide-react";

const activities = [
  {
    color: "bg-[var(--success-500)]",
    text: "James L. enrolled in Mastering Form",
  },
  {
    color: "bg-[var(--warning-500)]",
    text: "New 5-star review from Sarah Miller",
  },
  { color: "bg-[var(--gray-300)]", text: "Lesson 4 reached 500 views" },
  { color: "bg-[var(--primary-600)]", text: "Payout of $2,450 processed" },
];

export default function AiActivityPanel() {
  return (
    <div className="w-full xl:w-110 lg:w-75 shrink-0 flex flex-col gap-4">
      {/* AI Assist card */}
      <div className="bg-(--gray-900) rounded-xl p-5 text-white flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-(--primary-400)" />
          <span className="text-[13px] font-semibold">AI Strategy Assist</span>
        </div>
        <p className="text-[12px] text-(--gray-300) leading-relaxed">
          Students are stalling at Module 4. Adding a check-in quiz could
          improve progression by{" "}
          <span className="text-white font-semibold">12%</span>.
        </p>
        <button className="w-full bg-white text-(--text-title) text-[13px] font-semibold py-2.5 rounded-lg hover:bg-(--gray-100) transition-colors">
          Apply Suggestion
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-(--gray-200) p-5 flex-1">
        <h3 className="text-[13px] font-semibold text-(--text-title) mb-4">
          Recent Activity
        </h3>
        <ul className="space-y-3">
          {activities.map((a, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.color}`}
              />
              <span className="text-[12px] text-(--gray-600) leading-snug">
                {a.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
