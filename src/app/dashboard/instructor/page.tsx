import StatsCards from "@/components/dashboard/instructor/stats-cards";
import RevenueChart from "@/components/dashboard/instructor/revenue-chart";
import AiActivityPanel from "@/components/dashboard/instructor/ai-activity-panel";
import TopCoursesTable from "@/components/dashboard/instructor/top-courses-table";

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] lg:text-[22px] font-bold text-(--text-title)">
            Welcome back, Al Amin.
          </h1>
          <p className="text-[13px] lg:text-[14px] text-(--gray-500) mt-0.5">
            Your courses generated 12% more engagement this week. Three students
            need a check-in.
          </p>
        </div>
        <button className="self-start flex items-center gap-2 bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
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
