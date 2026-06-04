import AnalyticsPageContent from "@/components/dashboard/instructor/analytics-page";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          Analytics
        </h1>
        <p className=" text-[14px] text-(--gray-500) mt-0.5">
          Track your course performance and student progress.
        </p>
      </div>
      <AnalyticsPageContent />
    </div>
  );
}
