import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listPendingReviewCourses,
  listAdminCourses,
  getCourseReviewDetail,
  getCourseAdminCurriculum,
  reviewCourse,
  archiveCourse,
  restoreCourse,
  type ListPendingReviewParams,
  type ListAdminCoursesParams,
} from "@/lib/admin-courses-api";

/** Courses sitting in under_review, oldest-submitted-first. */
export function usePendingReviewCourses(params: ListPendingReviewParams) {
  return useQuery({
    queryKey: ["admin-pending-review", params],
    queryFn: () => listPendingReviewCourses(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Platform-wide course browser — every status, not just under_review. */
export function useAdminCourses(params: ListAdminCoursesParams) {
  return useQuery({
    queryKey: ["admin-courses", params],
    queryFn: () => listAdminCourses(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Full admin-review detail for one course (curriculum stats + schedules). */
export function useCourseReviewDetail(id: number | null) {
  return useQuery({
    queryKey: ["admin-course-review-detail", id],
    queryFn: () => getCourseReviewDetail(id as number),
    enabled: id !== null,
  });
}

/** Full curriculum tree (lectures/quizzes/assignments/coding exercises) for admin preview. */
export function useCourseAdminCurriculum(id: number | null) {
  return useQuery({
    queryKey: ["admin-course-curriculum", id],
    queryFn: () => getCourseAdminCurriculum(id as number),
    enabled: id !== null,
  });
}

/** Approve or reject a course sitting in under_review. */
export function useReviewCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      rejectionReason,
    }: {
      id: number;
      action: "approve" | "reject";
      rejectionReason?: string;
    }) => reviewCourse(id, action, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-review"] });
    },
  });
}

/** Archive any published course (admin override of owner scope). */
export function useArchiveCourse() {
  return useMutation({
    mutationFn: (id: number) => archiveCourse(id),
  });
}

/** Restore any archived course back to draft (admin override of owner scope). */
export function useRestoreCourse() {
  return useMutation({
    mutationFn: (id: number) => restoreCourse(id),
  });
}
