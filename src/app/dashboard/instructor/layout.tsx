import InstructorSidebar from "@/components/dashboard/instructor/sidebar";
import InstructorTopbar from "@/components/dashboard/instructor/topbar";

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f7f7fa]">
      <InstructorSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <InstructorTopbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
