import StatsCards from "@/components/dashboard/instructor/stats-cards";
import RevenueChart from "@/components/dashboard/instructor/revenue-chart";
import AiActivityPanel from "@/components/dashboard/instructor/ai-activity-panel";
import TopCoursesTable from "@/components/dashboard/instructor/top-courses-table";
import PageHeader from "@/components/dashboard/common/page-header";
import { Plus } from "lucide-react";

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Al Amin."
        subtitle="Your courses generated 12% more engagement this week. Three students need a check-in."
        action={
          <button className="h-12 flex items-center gap-2 bg-(--primary-700) hover:bg-(--primary-600) text-white text-[14px] lg:text-[16px] font-semibold px-4 py-2.5 rounded-md transition-colors whitespace-nowrap">
            <Plus size={16} color="white" />
            Create New Course
          </button>
        }
      />

      {/* Stats */}
      <StatsCards />

      {/* Chart + AI panel */}
      <div className="flex flex-col lg:flex-row gap-4">
        <RevenueChart />
        <AiActivityPanel />
      </div>

      {/* Top courses */}
      <TopCoursesTable />
    </div>
  );
}
