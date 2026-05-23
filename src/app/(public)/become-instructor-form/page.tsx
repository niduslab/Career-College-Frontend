import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import InstructorFormSection from "@/components/become-instructor-form/instructor-form-section";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function BecomeInstructorFormPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Apply to Become an Instructor"
        subtitle="Ready to share your expertise with the world? Fill out the form below and our team will get back to you within 2 business days."
        items={[
          { label: "Home", href: "/" },
          { label: "Become an Instructor", href: "/become-instructor" },
          { label: "Apply Now", active: true },
        ]}
      />
      <InstructorFormSection />
      <DreamCareerCta />
    </div>
  );
}
