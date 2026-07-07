import { notFound } from "next/navigation";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { DreamCareerCta } from "@/components/common/dream-career-cta";
import { InstructorProfileSection } from "@/components/all-instructors-details/instructor-profile-section";
import { getPublicInstructorProfile } from "@/lib/profile-api";
import { ApiError } from "@/lib/api";

export default async function InstructorDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let instructor;
  try {
    instructor = await getPublicInstructorProfile(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title={instructor.full_name}
        subtitle={instructor.headline}
        items={[
          { label: "Home", href: "/" },
          { label: "All Instructors", href: "/all-instructors" },
          { label: instructor.full_name, active: true },
        ]}
      />
      <InstructorProfileSection instructor={instructor} />
      <DreamCareerCta />
    </div>
  );
}
