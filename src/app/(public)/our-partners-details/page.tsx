import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import CertificatesSpecializations from "@/components/our-partners-details/certificates-specializations";
import PartnerCourses from "@/components/our-partners-details/partner-courses";
import PartnerInstructors from "@/components/our-partners-details/partner-instructors";

export default function OurPartnersPage() {
  return (
    <div className="min-h-screen ">
      <BreadcrumbHero
        title="Connecting Innovators Worldwide"
        subtitle="Our diverse network of partners across the globe empowers collaboration and drives collective progress in education, technology, and beyond."
        items={[
          { label: "Home", href: "/" },
          { label: "Our Partners", href: "/our-partners" },
          { label: "IBM", active: true },
        ]}
      />

      <PartnerCourses partnerName="IBM" />
      <CertificatesSpecializations />
      <PartnerInstructors />
    </div>
  );
}
