import PartnershipSidebar from "@/components/dashboard/partnership/sidebar";
import PartnershipTopbar from "@/components/dashboard/partnership/topbar";

export default function PartnershipDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-(--gray-100)">
      <PartnershipSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PartnershipTopbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
