import AdminPayoutsContent from "@/components/dashboard/admin/payouts";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminPayoutsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts"
        subtitle="Manage and track payouts to instructors and partners."
      />
      <AdminPayoutsContent />
    </div>
  );
}
