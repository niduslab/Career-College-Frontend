import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCourseReviews,
  getReviewSummary,
  getMyReview,
  upsertMyReview,
  updateMyReview,
  deleteMyReview,
  voteOnReview,
  type ReviewOrdering,
  type ReviewWriteInput,
} from "@/lib/course-api";

/** Paginated public review list for a course. */
export function useCourseReviews(
  courseSlug: string | undefined,
  params: { rating?: number; ordering?: ReviewOrdering; page?: number } = {},
) {
  return useQuery({
    queryKey: ["course-reviews", courseSlug, params],
    queryFn: () => getCourseReviews(courseSlug as string, params),
    enabled: !!courseSlug,
  });
}

/** Rating summary (avg + star distribution) for a course. */
export function useReviewSummary(courseSlug: string | undefined) {
  return useQuery({
    queryKey: ["review-summary", courseSlug],
    queryFn: () => getReviewSummary(courseSlug as string),
    enabled: !!courseSlug,
  });
}

/** The caller's own review for a course, if any (null when none exists yet). */
export function useMyReview(courseSlug: string | undefined) {
  return useQuery({
    queryKey: ["my-review", courseSlug],
    queryFn: () => getMyReview(courseSlug as string),
    enabled: !!courseSlug,
  });
}

function invalidateReviewQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  courseSlug: string,
) {
  queryClient.invalidateQueries({ queryKey: ["course-reviews", courseSlug] });
  queryClient.invalidateQueries({ queryKey: ["review-summary", courseSlug] });
  queryClient.invalidateQueries({ queryKey: ["my-review", courseSlug] });
}

/** Create or update the caller's own review (upsert). */
export function useUpsertReview(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewWriteInput) =>
      upsertMyReview(courseSlug as string, input),
    onSuccess: () => {
      if (courseSlug) invalidateReviewQueries(queryClient, courseSlug);
    },
  });
}

/** Edit the caller's own existing review. */
export function useUpdateReview(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ReviewWriteInput>) =>
      updateMyReview(courseSlug as string, input),
    onSuccess: () => {
      if (courseSlug) invalidateReviewQueries(queryClient, courseSlug);
    },
  });
}

/** Delete the caller's own review. */
export function useDeleteReview(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteMyReview(courseSlug as string),
    onSuccess: () => {
      if (courseSlug) invalidateReviewQueries(queryClient, courseSlug);
    },
  });
}

/** Cast/flip a helpful vote on someone else's review. */
export function useVoteOnReview(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      isHelpful,
    }: {
      reviewId: number;
      isHelpful: boolean;
    }) => voteOnReview(reviewId, isHelpful),
    onSuccess: () => {
      if (courseSlug)
        queryClient.invalidateQueries({
          queryKey: ["course-reviews", courseSlug],
        });
    },
  });
}
