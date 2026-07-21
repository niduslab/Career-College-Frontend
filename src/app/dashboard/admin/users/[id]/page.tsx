import UserDetail from "@/components/dashboard/admin/users/user-detail";
import PageHeader from "@/components/dashboard/common/page-header";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile"
        subtitle="View account details and manage this user's status and role."
      />
      <UserDetail userId={Number(id)} />
    </div>
  );
}
