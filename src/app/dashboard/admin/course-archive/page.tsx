import AdminCourseArchiveContent from "@/components/dashboard/admin/course-archive";
import PageHeader from "@/components/dashboard/common/page-header";

export default function AdminCourseArchivePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Archive"
        subtitle="Archive or restore any course, overriding owner scope."
      />
      <AdminCourseArchiveContent />
    </div>
  );
}
