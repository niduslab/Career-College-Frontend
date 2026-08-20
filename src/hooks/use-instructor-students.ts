import { useQuery } from "@tanstack/react-query";
import {
  getInstructorStudentsSummary,
  listInstructorStudents,
  type ListStudentsParams,
} from "@/lib/instructor-students-api";

/** Paginated student roster. Filters live in the query key so changing one
 *  refetches rather than filtering a stale page client-side. */
export function useInstructorStudents(params: ListStudentsParams) {
  return useQuery({
    queryKey: ["instructor-students", params],
    queryFn: () => listInstructorStudents(params),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** Roster-wide KPIs + course-filter options. Separate from the list because it
 *  describes every student, not the current page. */
export function useInstructorStudentsSummary() {
  return useQuery({
    queryKey: ["instructor-students-summary"],
    queryFn: getInstructorStudentsSummary,
    staleTime: 60 * 1000,
  });
}
