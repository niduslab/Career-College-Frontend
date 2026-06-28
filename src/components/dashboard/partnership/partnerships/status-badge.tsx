import { PartnerStatus } from "./types";

const map: Record<PartnerStatus, string> = {
  Active: "text-green-600 bg-green-50 border-green-200",
  Pending: "text-orange-500 bg-orange-50 border-orange-200",
  Inactive: "text-gray-500 bg-gray-100 border-gray-200",
};

export default function StatusBadge({ status }: { status: PartnerStatus }) {
  return (
    <span className={`text-[12px] w-17 font-semibold px-2.5 py-1 rounded-full border ${map[status]}`}>
      {status}
    </span>
  );
}
