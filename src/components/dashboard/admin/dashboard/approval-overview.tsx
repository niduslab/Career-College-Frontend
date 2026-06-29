import Link from "next/link";
import { ArrowUpRight, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface Stage {
  label: string;
  count: number;
  icon: typeof CheckCircle2;
  barColor: string;
  iconColor: string;
}

// SRS 6.2 / 6.4 — AI approval workflow monitoring
const STAGES: Stage[] = [
  {
    label: "Auto-approved",
    count: 142,
    icon: CheckCircle2,
    barColor: "bg-emerald-500",
    iconColor: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Flagged for review",
    count: 18,
    icon: AlertTriangle,
    barColor: "bg-orange-400",
    iconColor: "bg-orange-50 text-orange-500",
  },
  {
    label: "Pending submission",
    count: 9,
    icon: Clock,
    barColor: "bg-(--primary-500)",
    iconColor: "bg-(--primary-50) text-(--primary-600)",
  },
];

const FLAGGED = [
  {
    course: "Mastering System Design",
    instructor: "Daniel Roberts",
    score: 68,
    issue: "Readability below threshold",
  },
  {
    course: "Crypto Trading Bootcamp",
    instructor: "Olivia Bennett",
    score: 54,
    issue: "Copyright detection",
  },
  {
    course: "Quick Excel Hacks",
    instructor: "Marcus Lee",
    score: 61,
    issue: "Incomplete content",
  },
];

export default function ApprovalOverview() {
  const total = STAGES.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
            AI Course Approval
          </p>
          <p className="text-[12px] text-(--gray-500) mt-0.5">
            Auto-approval threshold: 75/100
          </p>
        </div>
        <Link
          href="/dashboard/admin/approvals"
          className="text-[12px] text-(--primary-600) font-medium flex items-center gap-0.5 hover:underline"
        >
          Review queue <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stage summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {STAGES.map(({ label, count, icon: Icon, barColor, iconColor }) => (
          <div
            key={label}
            className="rounded-xl border border-(--gray-200) p-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[20px] font-semibold text-(--text-title)">
                {count}
              </span>
            </div>
            <p className="text-[12px] text-(--gray-500)">{label}</p>
            <div className="h-1.5 rounded-full bg-(--gray-100) overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Flagged courses needing manual review */}
      <p className="text-[13px] font-semibold text-(--text-title) mb-3">
        Flagged courses awaiting decision
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-125">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-(--gray-400) border-b border-(--gray-200)">
              <th className="font-medium py-2 pr-4">Course</th>
              <th className="font-medium py-2 pr-4">Instructor</th>
              <th className="font-medium py-2 pr-4">AI Score</th>
              <th className="font-medium py-2">Flagged issue</th>
            </tr>
          </thead>
          <tbody>
            {FLAGGED.map((row) => (
              <tr
                key={row.course}
                className="text-[13px] border-b border-(--gray-100) last:border-0"
              >
                <td className="py-3 pr-4 font-medium text-(--text-title)">
                  {row.course}
                </td>
                <td className="py-3 pr-4 text-(--gray-500)">{row.instructor}</td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-orange-50 text-orange-600">
                    {row.score}
                  </span>
                </td>
                <td className="py-3 text-(--gray-500)">{row.issue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
