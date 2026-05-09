import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { AboutIntro } from "@/components/about-us/about-intro";
import { AboutPrinciples } from "@/components/about-us/about-principles";
import { CareerJourney } from "@/components/common/career-journey";
import { WhyJoinSection } from "@/components/common/why-join-section";
import { FaqSection } from "@/components/common/faq-section";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Empowering Careers Through Practical Learning"
        subtitle="At Career College, we believe education should do more than inform  it should transform. Our mission is to equip learners with real-world skills that open doors to meaningful career opportunities in today’s fast-changing digital world."
        items={[
          { label: "Home", href: "/" },
          { label: "About Us", active: true },
        ]}
      />

      <div className="bg-gray-50">
        <AboutIntro />
      </div>
      <div className="bg-white">
        <AboutPrinciples />
      </div>
      <div className="bg-gray-50">
        <CareerJourney />
      </div>
      <div className="bg-white">
        <WhyJoinSection />
      </div>
      <div>
        <FaqSection />
      </div>
      <div>
        <DreamCareerCta />
      </div>
    </div>
  );
}
