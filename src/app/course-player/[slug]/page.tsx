import { AuthGuard } from "@/components/auth/auth-guard";
import CoursePlayerPage from "@/components/dashboard/learner/course-player";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Top-level (not under dashboard/learner/) so instructors can open this to
 * preview their own course — the learner dashboard layout's AuthGuard.
 */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return (
    <AuthGuard>
      <div className="min-h-screen bg-(--gray-100) p-4 lg:p-6">
        <CoursePlayerPage courseSlug={slug} topOffsetPx={0} />
      </div>
    </AuthGuard>
  );
}
