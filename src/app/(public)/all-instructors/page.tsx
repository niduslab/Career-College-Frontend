import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { InstructorsGridSection } from "@/components/all-instructors/instructors-grid-section";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function AllInstructorsPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Learn from Experts Who Shape Real-World Careers"
        subtitle="Explore our diverse community of industry professionals, mentors, and educators who bring real-world experience into every lesson."
        items={[
          { label: "Home", href: "/" },
          { label: "All Instructors", active: true },
        ]}
      />
      <InstructorsGridSection />
      <DreamCareerCta />
    </div>
  );
}
