import StatsCards from "@/components/dashboard/instructor/stats-cards";
import RevenueChart from "@/components/dashboard/instructor/revenue-chart";
import AiActivityPanel from "@/components/dashboard/instructor/ai-activity-panel";
import TopCoursesTable from "@/components/dashboard/instructor/top-courses-table";
import PageHeader from "@/components/dashboard/common/page-header";
import CreateCourseDropdown from "@/components/dashboard/instructor/create-course-dropdown";

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Al Amin."
        subtitle="Your courses generated 12% more engagement this week. Three students need a check-in."
        action={<CreateCourseDropdown />}
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
