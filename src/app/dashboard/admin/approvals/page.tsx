import AdminApprovalsContent from "@/components/dashboard/admin/approvals";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminApprovalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        subtitle="Review AI-flagged course submissions and manage the auto-approval queue."
      />
      <AdminApprovalsContent />
    </div>
  );
}
