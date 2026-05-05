import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import PartnersGrid from "@/components/our-partners/partners-grid";

export default function OurPartnersPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Connecting Innovators Worldwide"
        subtitle="Our diverse network of partners across the globe empowers collaboration and drives collective progress in education, technology, and beyond."
        items={[
          { label: "Home", href: "/" },
          { label: "Our Partners", active: true },
        ]}
      />
      <PartnersGrid />
    </div>
  );
}
