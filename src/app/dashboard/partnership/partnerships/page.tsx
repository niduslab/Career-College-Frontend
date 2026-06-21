import PartnershipsPageContent from "@/components/dashboard/partnership/partnerships";
import PageHeader from "@/components/dashboard/common/page-header";

export default function PartnershipsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Partnerships"
        subtitle="Manage and track all your active partner relationships."
      />
      <PartnershipsPageContent />
    </div>
  );
}
