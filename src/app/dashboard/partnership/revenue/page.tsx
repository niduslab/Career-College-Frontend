import RevenuePageContent from "@/components/dashboard/partnership/revenue";
import PageHeader from "@/components/dashboard/common/page-header";

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        subtitle="Gross earnings from paid orders on your courses and webinars."
      />
      <RevenuePageContent />
    </div>
  );
}
