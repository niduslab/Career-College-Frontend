import Link from "next/link";
import CoursesPageContent from "@/components/dashboard/partnership/courses";
import PageHeader from "@/components/dashboard/common/page-header";
import { Plus } from "lucide-react";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle="Manage and track all courses offered through your partnerships."
        action={
          <Link
            href="/dashboard/partnership/course-builder"
            className="flex items-center gap-1.5 h-10 px-4 rounded-md bg-linear-to-br from-(--primary-600) to-(--primary-700) hover:from-(--primary-700) hover:to-(--primary-900) text-white text-[14px] font-medium cursor-pointer transition-all whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Link>
        }
      />
      <CoursesPageContent />
    </div>
  );
}
