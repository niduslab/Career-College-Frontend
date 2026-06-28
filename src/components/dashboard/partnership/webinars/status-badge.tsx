import { WebinarStatus } from "./types";

const STYLES: Record<WebinarStatus, string> = {
  Live: "text-red-600 bg-red-50 border-red-200",
  Upcoming: "text-blue-600 bg-blue-50 border-blue-200",
  Recorded: "text-gray-500 bg-gray-50 border-gray-200",
  Cancelled: "text-orange-500 bg-orange-50 border-orange-200",
};

export default function WebinarStatusBadge({ status }: { status: WebinarStatus }) {
  return (
    <span className={`inline-flex items-center justify-center text-[11px] font-semibold w-20 px-2.5 py-1 rounded-full border ${STYLES[status]}`}>
      {status}
    </span>
  );
}
