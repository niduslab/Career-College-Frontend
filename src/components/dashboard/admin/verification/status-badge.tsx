import type { VerificationStatus } from "@/lib/admin-verification-api";

const map: Record<VerificationStatus, string> = {
  draft: "text-(--gray-500) bg-(--gray-100)",
  submitted: "text-blue-600 bg-blue-50",
  under_review: "text-orange-600 bg-orange-50",
  approved: "text-emerald-600 bg-emerald-50",
  rejected: "text-red-500 bg-red-50",
  action_required: "text-amber-600 bg-amber-50",
  expired: "text-(--gray-500) bg-(--gray-100)",
};

const LABEL: Record<VerificationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  action_required: "Action Required",
  expired: "Expired",
};

export default function StatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${map[status]}`}>
      {LABEL[status]}
    </span>
  );
}
