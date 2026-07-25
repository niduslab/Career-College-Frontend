import AdminCategoriesContent from "@/components/dashboard/admin/categories";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Manage the course category tree used across the public catalog."
      />
      <AdminCategoriesContent />
    </div>
  );
}
