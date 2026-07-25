import AdminAuditLogContent from "@/components/dashboard/admin/audit-log";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminAuditLogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        subtitle="Track suspend, reactivate, and role-change actions taken by platform admins."
      />
      <AdminAuditLogContent />
    </div>
  );
}
