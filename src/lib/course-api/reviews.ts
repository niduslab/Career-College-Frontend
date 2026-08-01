import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from "../api";
import {
  type PaginatedResponse,
  type WithMessage,
  withMessage,
} from "./shared";

// Reviews & Ratings

export type ReviewOrdering =
  | "-created_at"
  | "created_at"
  | "-helpful_count"
  | "-rating"
  | "rating";

export interface CourseReview {
  id: number;
  reviewer_name: string;
  rating: number;
  headline: string;
  body: string;
  helpful_count: number;
  not_helpful_count: number;
  /** The current caller's own vote on this review, if any (null when logged out or no vote cast). */
  viewer_vote: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CourseReviewSummary {
  avg_rating: string | null;
  review_count: number;
  /** Count of reviews per star rating, keyed "1".."5". */
  distribution: Record<string, number>;
}

export interface ReviewWriteInput {
  rating: number;
  headline: string;
  body: string;
}

/** Public paginated review list for a course. */
export async function getCourseReviews(
  courseSlug: string,
  params: { rating?: number; ordering?: ReviewOrdering; page?: number } = {},
): Promise<PaginatedResponse<CourseReview>> {
  const qs = new URLSearchParams();
  if (params.rating) qs.set("rating", String(params.rating));
  if (params.ordering) qs.set("ordering", params.ordering);
  if (params.page) qs.set("page", String(params.page));
  const s = qs.toString();
  const res = await apiGet<PaginatedResponse<CourseReview>>(
    `/courses/${courseSlug}/reviews/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Public rating summary (avg + distribution) for a course. */
export async function getReviewSummary(
  courseSlug: string,
): Promise<CourseReviewSummary> {
  const res = await apiGet<CourseReviewSummary>(
    `/courses/${courseSlug}/reviews/summary/`,
  );
  return (
    res.data ?? { avg_rating: null, review_count: 0, distribution: {} }
  );
}

/** The caller's own review for a course, if any (404 → null). */
export async function getMyReview(
  courseSlug: string,
): Promise<CourseReview | null> {
  try {
    const res = await apiGet<CourseReview>(
      `/courses/${courseSlug}/reviews/my-review/`,
    );
    return res.data as CourseReview;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Create (201) or update (200) the caller's own review — enrolled learners only. */
export async function upsertMyReview(
  courseSlug: string,
  input: ReviewWriteInput,
): Promise<WithMessage<CourseReview>> {
  const res = await apiPost<CourseReview>(
    `/courses/${courseSlug}/reviews/`,
    input,
  );
  return withMessage(res);
}

export async function updateMyReview(
  courseSlug: string,
  input: Partial<ReviewWriteInput>,
): Promise<WithMessage<CourseReview>> {
  const res = await apiPatch<CourseReview>(
    `/courses/${courseSlug}/reviews/my-review/`,
    input,
  );
  return withMessage(res);
}

export async function deleteMyReview(courseSlug: string): Promise<void> {
  await apiDelete(`/courses/${courseSlug}/reviews/my-review/`);
}

/** Cast/flip a helpful vote on someone else's review. */
export async function voteOnReview(
  reviewId: number,
  isHelpful: boolean,
): Promise<{ helpful_count: number; not_helpful_count: number }> {
  const res = await apiPost<{
    helpful_count: number;
    not_helpful_count: number;
  }>(`/courses/reviews/${reviewId}/vote/`, { is_helpful: isHelpful });
  return res.data as { helpful_count: number; not_helpful_count: number };
}
