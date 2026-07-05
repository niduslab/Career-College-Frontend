import { notFound } from "next/navigation";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { DreamCareerCta } from "@/components/common/dream-career-cta";
import { LearnerProfileSection } from "@/components/all-learners-details/learner-profile-section";
import { getPublicLearnerProfile } from "@/lib/profile-api";
import { ApiError } from "@/lib/api";

export default async function LearnerDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let learner;
  try {
    learner = await getPublicLearnerProfile(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title={learner.full_name}
        subtitle={learner.headline}
        items={[
          { label: "Home", href: "/" },
          { label: "All Learners", href: "/all-learners" },
          { label: learner.full_name, active: true },
        ]}
      />
      <LearnerProfileSection learner={learner} />
      <DreamCareerCta />
    </div>
  );
}
