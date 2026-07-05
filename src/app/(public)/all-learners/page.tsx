import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { LearnersGridSection } from "@/components/all-learners/learners-grid-section";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function AllLearnersPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Meet the Learners Building Their Careers With Us"
        subtitle="Explore public profiles of learners growing their skills, sharing their goals, and progressing toward real-world careers."
        items={[
          { label: "Home", href: "/" },
          { label: "All Learners", active: true },
        ]}
      />
      <LearnersGridSection />
      <DreamCareerCta />
    </div>
  );
}
