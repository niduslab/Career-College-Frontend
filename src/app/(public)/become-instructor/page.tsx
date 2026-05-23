import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { HowToBecomeSection } from "@/components/become-instructor/how-to-become-section";
import { WhyJoinSection } from "@/components/common/why-join-section";
import { InstructorTestimonialSection } from "@/components/become-instructor/instructor-testimonial-section";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

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
      <InstructorTestimonialSection />
      {/* 
      <DreamCareerCta /> */}
    </div>
  );
}
