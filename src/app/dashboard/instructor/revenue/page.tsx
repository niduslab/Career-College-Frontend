import RevenuePage from "@/components/dashboard/instructor/revenue-page";
import PageHeader from "@/components/dashboard/common/page-header";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        subtitle="Track your earnings, payouts and platform fees."
      />
      <RevenuePage />
    </div>
  );
}
