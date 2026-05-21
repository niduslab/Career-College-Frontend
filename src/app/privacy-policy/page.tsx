import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { PrivacyPolicyContent } from "@/components/privacy-policy/privacy-policy-content";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Privacy Policy"
        subtitle="Your privacy matters to us. This policy explains how Career College collects, uses, and protects your personal information when you use our platform and services."
        items={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy", active: true },
        ]}
      />
      <PrivacyPolicyContent />
    </div>
  );
}
