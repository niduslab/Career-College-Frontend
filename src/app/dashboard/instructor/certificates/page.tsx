import CertificatesPage from "@/components/dashboard/instructor/certificates-page";
import PageHeader from "@/components/dashboard/common/page-header";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        subtitle="Issue and manage student certificates across your courses."
      />
      <CertificatesPage />
    </div>
  );
}
