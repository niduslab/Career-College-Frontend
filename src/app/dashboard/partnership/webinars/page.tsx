import WebinarsPageContent from "@/components/dashboard/partnership/webinars";
import PageHeader from "@/components/dashboard/common/page-header";

export default function WebinarsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Webinars"
        subtitle="Manage and track all webinars hosted through your partnerships."
      />
      <WebinarsPageContent />
    </div>
  );
}
