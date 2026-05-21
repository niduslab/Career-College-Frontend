import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { ContactSection } from "@/components/contact/contact-section";
import { FaqSection } from "@/components/common/faq-section";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Get in Touch With Our Team"
        subtitle="Have a question or need guidance on your learning journey? We're here to help. Reach out to our support team and we'll respond within 24 hours."
        items={[
          { label: "Home", href: "/" },
          { label: "Contact Us", active: true },
        ]}
      />
      <ContactSection />

      <DreamCareerCta />
    </div>
  );
}
