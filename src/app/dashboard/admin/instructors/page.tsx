import AdminInstructorsContent from "@/components/dashboard/admin/instructors";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminInstructorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructors"
        subtitle="Manage instructor accounts, verification, and performance across the platform."
      />
      <AdminInstructorsContent />
    </div>
  );
}
