import InstructorSidebar from "@/components/dashboard/instructor/sidebar";
import InstructorTopbar from "@/components/dashboard/instructor/topbar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireRole="instructor">
      <div className="flex min-h-screen bg-(--gray-100)">
        <InstructorSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <InstructorTopbar />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
