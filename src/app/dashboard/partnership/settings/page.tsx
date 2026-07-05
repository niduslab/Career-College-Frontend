import PageHeader from "@/components/dashboard/common/page-header";
import PartnershipSettingsPage from "@/components/dashboard/partnership/settings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, profile, and preferences."
      />
      <PartnershipSettingsPage />
    </div>
  );
}
