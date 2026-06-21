import AnalyticsPageContent from "@/components/dashboard/instructor/analytics-page";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Track your course performance and student progress."
      />
      <AnalyticsPageContent />
    </div>
  );
}
