import { Breadcrumb } from "@/components/common/breadcrumb";
import { DreamCareerCta } from "@/components/common/dream-career-cta";
import PartnershipFormSection from "@/components/university-partnership-form/partnership-form-section";

export default function UniversityPartnershipForm() {
  return (
    <div className="min-h-screen">
      <div className="relative bg-(--gray-950) overflow-hidden">
        {/* Gradient Background */}
        <div
          className="pointer-events-none absolute right-0 top-0"
          style={{
            width: "791px",
            height: "403px",
            transform: "translateX(50%)",
            borderRadius: "791px",
            background: "#4508A9",
            filter: "blur(275px)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10 md:py-12 lg:py-16 relative z-10">
          <div className="lg:pr-96">
            <Breadcrumb
              title="Partner with Career College Shape the Future of Learning"
              subtitle="Join hands with Career College to empower learners, expand your reach, and create meaningful impact."
              items={[
                { label: "Home", href: "/" },
                { label: "Become a Partner", active: true },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Partnership Form Section */}
      <PartnershipFormSection />
      <DreamCareerCta />
    </div>
  );
}
