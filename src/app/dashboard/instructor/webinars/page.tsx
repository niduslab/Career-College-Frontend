import MyWebinarsPageContent from "@/components/dashboard/instructor/webinars";
import PageHeader from "@/components/dashboard/common/page-header";

export default function InstructorWebinarsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Webinars"
        subtitle="Webinars you're hosting — publish when ready, or archive past sessions."
      />
      <MyWebinarsPageContent />
    </div>
  );
}
