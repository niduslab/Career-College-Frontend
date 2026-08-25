import type { CourseBrief } from "@/lib/course-api";

interface CourseInstructorProps {
  instructors: CourseBrief[];
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// `InstructorBriefSerializer` (backend) returns only id/full_name/email — no
// photo, no per-instructor student/review/course counts. Showing those would
// mean inventing numbers with nothing behind them.
export default function CourseInstructor({
  instructors,
}: CourseInstructorProps) {
  if (instructors.length === 0) return null;

  return (
    <div className="lg:mt-10 mt-6">
      <h2 className="sg-h5 font-semibold --title-text mb-4">
        {instructors.length > 1 ? "Course Instructors" : "Course Instructor"}
      </h2>

      <div className="space-y-3">
        {instructors.map((instructor) => (
          <div
            key={instructor.id}
            className="rounded-2xl border border-gray-200 p-6 flex items-center gap-5 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-(--primary-50) text-(--primary-700) text-[18px] font-semibold flex items-center justify-center shrink-0">
              {initialsOf(instructor.full_name)}
            </div>
            <div>
              <h3 className="font-medium --text-title sg-p-big">
                {instructor.full_name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
