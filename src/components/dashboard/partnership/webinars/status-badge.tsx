import type { WebinarStatus } from "./types";

const STYLES: Record<WebinarStatus, string> = {
  draft: "text-gray-500 bg-gray-50 border-gray-200",
  published: "text-green-600 bg-green-50 border-green-200",
  archived: "text-orange-500 bg-orange-50 border-orange-200",
};

const LABEL: Record<WebinarStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export default function WebinarStatusBadge({
  status,
}: {
  status: WebinarStatus;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center text-[11px] font-semibold w-20 px-2.5 py-1 rounded-full border ${STYLES[status]}`}
    >
      {LABEL[status]}
    </span>
  );
}
