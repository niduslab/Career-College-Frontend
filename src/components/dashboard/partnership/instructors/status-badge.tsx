import { AffiliationStatus } from "./types";

const map: Record<AffiliationStatus, string> = {
  active: "text-green-600 bg-green-50 border-green-200",
  removed: "text-gray-500 bg-gray-50 border-gray-200",
};

const label: Record<AffiliationStatus, string> = {
  active: "Active",
  removed: "Removed",
};

export default function InstructorStatusBadge({
  status,
}: {
  status: AffiliationStatus;
}) {
  return (
    <span
      className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border inline-block w-16 text-center ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}
