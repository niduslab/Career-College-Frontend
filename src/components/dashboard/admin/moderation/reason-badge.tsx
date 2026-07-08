import { ReportReason } from "./types";

const dotColor: Record<ReportReason, string> = {
  Spam: "bg-blue-500",
  Harassment: "bg-red-500",
  Copyright: "bg-purple-500",
  Inappropriate: "bg-orange-500",
  Misinformation: "bg-(--primary-500)",
};

export default function ReasonBadge({ reason }: { reason: ReportReason }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-(--gray-600)">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor[reason]}`} />
      {reason}
    </span>
  );
}
