import LiveSessionsPage from "@/components/dashboard/instructor/live-sessions-page";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          Live Sessions
        </h1>
        <p className="text-[14px] text-(--gray-500) mt-0.5">
          Schedule, manage and host live sessions for your students.
        </p>
      </div>
      <LiveSessionsPage />
    </div>
  );
}
