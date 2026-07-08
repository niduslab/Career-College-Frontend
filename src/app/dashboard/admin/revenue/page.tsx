import AdminRevenueContent from "@/components/dashboard/admin/revenue";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminRevenuePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        subtitle="Track platform-wide revenue, breakdowns, and transaction history."
      />
      <AdminRevenueContent />
    </div>
  );
}
