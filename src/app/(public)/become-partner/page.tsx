import ExpandEducation from "@/components/become-partner/expand-education";
import { PartnershipStartSteps } from "@/components/become-partner/partnership-start-steps";
import PowerfulIndustry from "@/components/become-partner/powerful-industry";
import TrustedUniversityIndustries from "@/components/become-partner/trusted-university-industries";
import UnlockGlobalLearning from "@/components/become-partner/unlock-global-learning";

import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";

export default function BecomePartnerPage() {
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
      {/* Expand Education Section */}
      <ExpandEducation />

      {/* Powerful Industry Connections Section */}
      <PowerfulIndustry />

      {/* Learning Journey Steps */}
      <PartnershipStartSteps />

      {/* Trusted By Section */}
      <TrustedUniversityIndustries />

      {/* Unlock Global Learning Section */}
      <UnlockGlobalLearning />
    </div>
  );
}
