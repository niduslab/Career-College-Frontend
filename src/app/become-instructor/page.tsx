import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { HowToBecomeSection } from "@/components/become-instructor/how-to-become-section";
import { WhyJoinSection } from "@/components/become-instructor/why-join-section";

export default function BecomeInstructorPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Turn Your Expertise into Impact — Teach the World"
        subtitle="Join Career College as an instructor and share your knowledge with a global audience. Create engaging courses, inspire learners, and build your personal brand while making a meaningful difference in thousands of careers."
        items={[
          { label: "Home", href: "/" },
          { label: "Become an Instructor", active: true },
        ]}
      />
      <HowToBecomeSection />
      <WhyJoinSection />
    </div>
  );
}
