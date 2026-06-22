import { InstructorStatus } from "./types";

const map: Record<InstructorStatus, string> = {
  Active: "text-green-600 bg-green-50 border-green-200",
  Pending: "text-orange-500 bg-orange-50 border-orange-200",
  Inactive: "text-gray-500 bg-gray-50 border-gray-200",
};

export default function InstructorStatusBadge({ status }: { status: InstructorStatus }) {
  return (
    <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border inline-block w-16 text-center ${map[status]}`}>
      {status}
    </span>
  );
}
