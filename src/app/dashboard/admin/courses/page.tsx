import AdminCoursesContent from "@/components/dashboard/admin/courses";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle="Oversee every course on the platform — publishing status, performance, and moderation."
      />
      <AdminCoursesContent />
    </div>
  );
}
