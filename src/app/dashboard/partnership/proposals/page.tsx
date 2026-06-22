import ProposalsPageContent from "@/components/dashboard/partnership/proposals";
import PageHeader from "@/components/dashboard/common/page-header";
import { Plus } from "lucide-react";

export default function ProposalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposals"
        subtitle="Track, manage and follow up on all partnership proposals."
        action={
          <button
            type="button"
            className="flex items-center gap-1.5 h-10 px-4 rounded-md bg-(--primary-700) text-white text-[14px] font-medium cursor-pointer hover:bg-(--primary-600) transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Proposal
          </button>
        }
      />
      <ProposalsPageContent />
    </div>
  );
}
