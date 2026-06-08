import CertificatesPage from "@/components/dashboard/instructor/certificates-page";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          Certificates
        </h1>
        <p className="text-[14px] text-(--gray-500) mt-0.5">
          Issue and manage student certificates across your courses.
        </p>
      </div>
      <CertificatesPage />
    </div>
  );
}
