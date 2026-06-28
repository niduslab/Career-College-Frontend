import { ProposalStatus } from "./types";

const map: Record<ProposalStatus, string> = {
  Approved: "text-green-600 bg-green-50 border-green-200",
  Pending: "text-orange-500 bg-orange-50 border-orange-200",
  Rejected: "text-red-500 bg-red-50 border-red-200",
  Draft: "text-gray-500 bg-gray-50 border-gray-200",
};

export default function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border inline-block w-18 text-center ${map[status]}`}>
      {status}
    </span>
  );
}
