import AdminSettingsPage from "@/components/dashboard/admin/settings";
import PageHeader from "@/components/dashboard/common/page-header";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, notifications, and platform-wide configuration."
      />
      <AdminSettingsPage />
    </div>
  );
}
