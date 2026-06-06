import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { DreamCareerCta } from "@/components/common/dream-career-cta";
import PartnershipFormSection from "@/components/university-partnership-form/partnership-form-section";

export default function UniversityPartnershipForm() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Partner with Career College Shape the Future of Learning"
        subtitle="Join hands with Career College to empower learners, expand your reach, and create meaningful impact."
        items={[
          { label: "Home", href: "/" },
          { label: "Become a Partner", active: true },
        ]}
      />

      {/* Partnership Form Section */}
      <PartnershipFormSection />
      <DreamCareerCta />
    </div>
  );
}
