import SettingsPage from "@/components/dashboard/instructor/settings-page";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          Settings
        </h1>
        <p className="text-[14px] text-(--gray-500) mt-0.5">
          Manage your account, profile, and preferences.
        </p>
      </div>
      <SettingsPage />
    </div>
  );
}
