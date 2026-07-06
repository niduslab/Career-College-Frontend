import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { InstitutionsGridSection } from "@/components/all-institutions/institutions-grid-section";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function AllInstitutionsPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Learning Powered by Trusted Institutions"
        subtitle="Discover the universities, colleges, and training organizations partnering with us to deliver real-world, career-focused education."
        items={[
          { label: "Home", href: "/" },
          { label: "All Institutions", active: true },
        ]}
      />
      <InstitutionsGridSection />
      <DreamCareerCta />
    </div>
  );
}
