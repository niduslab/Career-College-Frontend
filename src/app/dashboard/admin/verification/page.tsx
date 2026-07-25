import AdminVerificationContent from "@/components/dashboard/admin/verification";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminVerificationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification"
        subtitle="Review instructor identity and partner institution credential submissions."
      />
      <AdminVerificationContent />
    </div>
  );
}
