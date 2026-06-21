import PartnershipStatsCards from "@/components/dashboard/partnership/stats-cards";
import PartnershipRevenueChart from "@/components/dashboard/partnership/revenue-chart";
import PartnershipActivityPanel from "@/components/dashboard/partnership/activity-panel";
import PartnershipsTable from "@/components/dashboard/partnership/partnerships-table";
import PageHeader from "@/components/dashboard/common/page-header";
import { Plus } from "lucide-react";

export default function PartnershipDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Al Amin."
        subtitle="You have 3 pending proposals and 2 new partnership requests this week."
        action={
          <button className="h-12 flex items-center gap-2 bg-(--primary-700) hover:bg-(--primary-600) text-white text-[14px] lg:text-[16px] font-semibold px-4 py-2.5 rounded-md transition-colors whitespace-nowrap">
            <Plus size={16} color="white" />
            New Proposal
          </button>
        }
      />

      {/* Stats */}
      <PartnershipStatsCards />

      {/* Chart + Activity panel */}
      <div className="flex flex-col lg:flex-row gap-4">
        <PartnershipRevenueChart />
        <PartnershipActivityPanel />
      </div>

      {/* Partnerships table */}
      <PartnershipsTable />
    </div>
  );
}
