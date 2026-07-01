import LearnerSidebar from "@/components/dashboard/learner/sidebar";
import LearnerTopbar from "@/components/dashboard/learner/topbar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function LearnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireRole="learner">
      <div className="flex min-h-screen bg-(--gray-100)">
        <LearnerSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <LearnerTopbar />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
