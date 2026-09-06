import type { PayoutStatus } from "@/lib/admin-payouts-api";

const TONE: Record<PayoutStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-600",
  paid: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

const LABEL: Record<PayoutStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

export default function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${TONE[status]}`}>
      {LABEL[status]}
    </span>
  );
}
