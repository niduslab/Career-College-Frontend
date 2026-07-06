import { notFound } from "next/navigation";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { DreamCareerCta } from "@/components/common/dream-career-cta";
import { InstitutionProfileSection } from "@/components/all-institutions-details/institution-profile-section";
import { getPublicPartnerProfile } from "@/lib/profile-api";
import { ApiError } from "@/lib/api";

export default async function InstitutionDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let institution;
  try {
    institution = await getPublicPartnerProfile(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title={institution.institution_name}
        subtitle={institution.tagline}
        items={[
          { label: "Home", href: "/" },
          { label: "All Institutions", href: "/all-institutions" },
          { label: institution.institution_name, active: true },
        ]}
      />
      <InstitutionProfileSection institution={institution} />
      <DreamCareerCta />
    </div>
  );
}
