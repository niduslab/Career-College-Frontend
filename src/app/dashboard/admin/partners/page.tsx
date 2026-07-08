import AdminPartnersContent from "@/components/dashboard/admin/partners";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminPartnersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        subtitle="Manage institutional and corporate partnerships across the platform."
      />
      <AdminPartnersContent />
    </div>
  );
}
