import CoursePlayerPage from "@/components/dashboard/learner/course-player";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <CoursePlayerPage courseSlug={slug} />;
}
