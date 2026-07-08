import AdminUsersContent from "@/components/dashboard/admin/users";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage students, instructors, and admin accounts across the platform."
      />
      <AdminUsersContent />
    </div>
  );
}
