import { CourseStatus } from "./types";

const map: Record<CourseStatus, string> = {
  Published: "text-green-600 bg-green-50 border-green-200",
  Draft: "text-gray-500 bg-gray-50 border-gray-200",
  "Under Review": "text-blue-600 bg-blue-50 border-blue-200",
  Archived: "text-orange-500 bg-orange-50 border-orange-200",
};

export default function CourseStatusBadge({
  status,
}: {
  status: CourseStatus;
}) {
  return (
    <span
      className={`text-[12px] w-24 text-center font-semibold px-2.5 py-1 rounded-full border inline-block whitespace-nowrap ${map[status]}`}
    >
      {status}
    </span>
  );
}
