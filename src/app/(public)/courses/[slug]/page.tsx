import CourseDetailsPage from "@/components/course-details";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourseDetailsPage slug={slug} />;
}
