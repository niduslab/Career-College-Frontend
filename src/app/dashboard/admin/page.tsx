import AdminDashboard from "@/components/dashboard/admin/dashboard";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Al Amin."
        subtitle="Platform-wide performance across users, enrollments, courses, and revenue."
      />

      <AdminDashboard />
    </div>
  );
}
