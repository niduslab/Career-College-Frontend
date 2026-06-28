import { CohortStatus } from "./types";

const STYLES: Record<CohortStatus, string> = {
  Active: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Upcoming: "text-blue-600 bg-blue-50 border-blue-200",
  Completed: "text-gray-500 bg-gray-50 border-gray-200",
  Cancelled: "text-red-500 bg-red-50 border-red-200",
};

export default function CohortStatusBadge({
  status,
}: {
  status: CohortStatus;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center  text-[12px] w-20 font-semibold px-2.5 py-1 rounded-full border ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
