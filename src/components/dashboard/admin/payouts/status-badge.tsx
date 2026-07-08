import { PayoutStatus } from "./types";

const map: Record<PayoutStatus, string> = {
  Paid: "text-emerald-600 bg-emerald-50",
  Pending: "text-blue-600 bg-blue-50",
  Failed: "text-red-500 bg-red-50",
  "On Hold": "text-orange-600 bg-orange-50",
};

export default function StatusBadge({ status }: { status: PayoutStatus }) {
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[status]}`}>
      {status}
    </span>
  );
}
