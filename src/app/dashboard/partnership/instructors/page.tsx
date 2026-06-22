import InstructorsPageContent from "@/components/dashboard/partnership/instructors";
import PageHeader from "@/components/dashboard/common/page-header";

export default function InstructorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructors"
        subtitle="Manage partner instructors — add, invite, and track their activity."
      />
      <InstructorsPageContent />
    </div>
  );
}
