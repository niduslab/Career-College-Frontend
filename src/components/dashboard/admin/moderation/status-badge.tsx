import { ReportStatus } from "./types";

const map: Record<ReportStatus, string> = {
  Open: "text-orange-600 bg-orange-50",
  Resolved: "text-emerald-600 bg-emerald-50",
  Dismissed: "text-(--gray-500) bg-(--gray-100)",
};

export default function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[status]}`}>
      {status}
    </span>
  );
}
