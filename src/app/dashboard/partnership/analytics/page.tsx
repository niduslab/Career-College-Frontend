import AnalyticsPageContent from "@/components/dashboard/partnership/analytics";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Track partnership performance, revenue trends, and key metrics."
      />
      <AnalyticsPageContent />
    </div>
  );
}
