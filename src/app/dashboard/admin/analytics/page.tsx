import AdminAnalyticsContent from "@/components/dashboard/admin/analytics";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Platform-wide performance across users, enrollments, courses, and instructors."
      />
      <AdminAnalyticsContent />
    </div>
  );
}
