import SettingsPage from "@/components/dashboard/instructor/settings";
import PageHeader from "@/components/dashboard/common/page-header";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, profile, and preferences."
      />
      <SettingsPage />
    </div>
  );
}
