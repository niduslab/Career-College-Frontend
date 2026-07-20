import type { CourseStatus } from "./types";

const map: Record<CourseStatus, string> = {
  draft: "text-gray-500 bg-gray-50 border-gray-200",
  institution_review: "text-purple-600 bg-purple-50 border-purple-200",
  under_review: "text-blue-600 bg-blue-50 border-blue-200",
  published: "text-green-600 bg-green-50 border-green-200",
  rejected: "text-red-500 bg-red-50 border-red-200",
  archived: "text-orange-500 bg-orange-50 border-orange-200",
};

const label: Record<CourseStatus, string> = {
  draft: "Draft",
  institution_review: "Institution Review",
  under_review: "Under Review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

export default function CourseStatusBadge({
  status,
}: {
  status: CourseStatus;
}) {
  return (
    <span
      className={`text-[12px] text-center font-semibold px-2.5 py-1 rounded-full border inline-block whitespace-nowrap ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}
