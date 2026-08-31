import AdminCertificatesContent from "@/components/dashboard/admin/certificates";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminCertificatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        subtitle="Browse issued credentials and revoke or restore them when a certificate was awarded in error."
      />
      <AdminCertificatesContent />
    </div>
  );
}