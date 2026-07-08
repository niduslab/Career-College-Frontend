import AdminModerationContent from "@/components/dashboard/admin/moderation";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation"
        subtitle="Review reported reviews, comments, and messages flagged for policy violations."
      />
      <AdminModerationContent />
    </div>
  );
}
