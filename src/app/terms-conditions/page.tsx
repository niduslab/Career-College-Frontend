import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { TermsConditionsContent } from "@/components/terms-conditions/terms-conditions-content";

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Terms & Conditions"
        subtitle="These Terms & Conditions outline the rules and guidelines for using the Career College platform. By enrolling in any course or creating an account, you agree to these terms."
        items={[
          { label: "Home", href: "/" },
          { label: "Terms & Conditions", active: true },
        ]}
      />
      <TermsConditionsContent />
    </div>
  );
}
