import { notFound } from "next/navigation";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { DreamCareerCta } from "@/components/common/dream-career-cta";
import ExploreMoreCourses from "@/components/common/explore-more-courses";
import { InstructorProfileSection } from "@/components/all-instructor-details/instructor-profile-section";
import { getInstructorBySlug, INSTRUCTORS } from "@/data/instructors";

export function generateStaticParams() {
  return INSTRUCTORS.map((i) => ({ slug: i.slug }));
}

export default async function InstructorDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const instructor = getInstructorBySlug(slug);

  if (!instructor) notFound();

  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title={instructor.name}
        subtitle={instructor.subtitle}
        items={[
          { label: "Home", href: "/" },
          { label: "All Instructors", href: "/all-instructor" },
          { label: instructor.name, active: true },
        ]}
      />
      <InstructorProfileSection instructor={instructor} />
      <div className="mb-10 lg:px-8 md:px-8 lg:mb-25 max-w-7xl mx-auto">
        <ExploreMoreCourses />
      </div>
      <DreamCareerCta />
    </div>
  );
}
