import AdminWebinarArchiveContent from "@/components/dashboard/admin/webinar-archive";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminWebinarArchivePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Webinar Archive"
        subtitle="Archive any published webinar, overriding owner/host scope."
      />
      <AdminWebinarArchiveContent />
    </div>
  );
}
