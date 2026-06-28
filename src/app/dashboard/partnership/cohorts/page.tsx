import CohortsPageContent from "@/components/dashboard/partnership/cohorts";
import PageHeader from "@/components/dashboard/common/page-header";
import { Plus } from "lucide-react";

export default function CohortsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohorts"
        subtitle="Manage and track all learning cohorts across your partnerships."
        action={
          <button
            type="button"
            className="flex items-center gap-1.5 h-10 px-4 rounded-md bg-(--primary-700) text-white text-[14px] font-medium cursor-pointer hover:bg-(--primary-600) transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Cohort
          </button>
        }
      />
      <CohortsPageContent />
    </div>
  );
}
