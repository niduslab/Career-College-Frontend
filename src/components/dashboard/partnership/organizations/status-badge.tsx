import { OrgStatus } from "./types";

const map: Record<OrgStatus, string> = {
  Active: "text-green-600 bg-green-50 border-green-200",
  Pending: "text-orange-500 bg-orange-50 border-orange-200",
  Inactive: "text-gray-500 bg-gray-50 border-gray-200",
};

export default function OrgStatusBadge({ status }: { status: OrgStatus }) {
  return (
    <span
      className={`text-[12px] w-17  font-semibold px-2.5 py-1 rounded-full border inline-block ${map[status]}`}
    >
      {status}
    </span>
  );
}
