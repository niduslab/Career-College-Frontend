import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listPendingReviewCourses,
  reviewCourse,
  type ListPendingReviewParams,
} from "@/lib/admin-courses-api";

/** Courses sitting in under_review, oldest-submitted-first. */
export function usePendingReviewCourses(params: ListPendingReviewParams) {
  return useQuery({
    queryKey: ["admin-pending-review", params],
    queryFn: () => listPendingReviewCourses(params),
    placeholderData: (previousData) => previousData,
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
