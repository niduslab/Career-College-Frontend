import LiveSessionsPage from "@/components/dashboard/instructor/live-sessions-page";
import PageHeader from "@/components/dashboard/common/page-header";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Sessions"
        subtitle="Schedule, manage and host live sessions for your students."
      />
      <LiveSessionsPage />
    </div>
  );
}
