import StatsCards from "@/components/dashboard/instructor/stats-cards";
import RevenueChart from "@/components/dashboard/instructor/revenue-chart";
import AiActivityPanel from "@/components/dashboard/instructor/ai-activity-panel";
import TopCoursesTable from "@/components/dashboard/instructor/top-courses-table";
import { Plus } from "lucide-react";

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            Welcome back, Al Amin.
          </h1>
          <p className="text-[13px] lg:text-[14px] text-[#4a5565] mt-0.5">
            Your courses generated 12% more engagement this week. Three students{" "}
            <br />
            need a check-in.
          </p>
        </div>
        <button className="self-start h-12 flex items-center gap-2 bg-(--primary-700) hover:bg-(--primary-600) text-white text-[14px] lg:text-[16px] font-semibold px-4 py-2.5 rounded-md transition-colors whitespace-nowrap">
          <Plus size={16} color="white" />
          Create New Course
        </button>
      </div>

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
