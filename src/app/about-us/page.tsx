import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { AboutIntro } from "@/components/about-us/about-intro";

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

      <div className="bg-gray">
        <AboutIntro />
      </div>
    </div>
  );
}
