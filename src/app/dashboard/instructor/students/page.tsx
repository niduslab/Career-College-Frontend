import StudentsPage from "@/components/dashboard/instructor/students-page";
import PageHeader from "@/components/dashboard/common/page-header";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Manage and track your enrolled students."
      />
      <StudentsPage />
    </div>
  );
}
