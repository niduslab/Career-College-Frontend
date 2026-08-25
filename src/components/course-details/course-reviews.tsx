"use client";
import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useCourseReviews, useVoteOnReview } from "@/hooks/use-reviews";
import type { CourseReviewSummary } from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface CourseReviewsProps {
  courseSlug: string;
  summary: CourseReviewSummary;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= Math.round(rating)
              ? "fill-(--warning-500) text-(--warning-500)"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

export default function CourseReviews({
  courseSlug,
  summary,
}: CourseReviewsProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCourseReviews(courseSlug, { page });
  const voteMutation = useVoteOnReview(courseSlug);

  const avgRating = summary.avg_rating ? parseFloat(summary.avg_rating) : 0;
  const maxCount = Math.max(1, ...Object.values(summary.distribution));

  const handleVote = (reviewId: number, isHelpful: boolean) => {
    voteMutation.mutate(
      { reviewId, isHelpful },
      {
        onError: (err) => {
          notify.error(
            err instanceof ApiError ? err.message : "Failed to record your vote.",
          );
        },
      },
    );
  };

  if (summary.review_count === 0) {
    return (
      <div className="mt-6 lg:mt-8">
        <h2 className="sg-h5 font-semibold --title-text mb-4">
          Learner Reviews
        </h2>
        <div className="rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="sg-p-default text-gray-500">
            No reviews yet — be the first to review this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="sg-h5 font-semibold --title-text mb-4">
        Learner Reviews
      </h2>

      <div className="rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex flex-col items-center shrink-0">
            <p className="text-[36px] font-bold --title-text leading-none">
              {avgRating.toFixed(1)}
            </p>
            <Stars rating={avgRating} />
            <p className="sg-p-small text-gray-500 mt-1">
              {summary.review_count} review
              {summary.review_count === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[String(star)] ?? 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="sg-p-small text-gray-500 w-8 shrink-0">
                    {star}★
                  </span>
                  <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-(--warning-500)"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="sg-p-small text-gray-400 w-6 text-right shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200" />

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-(--primary-600)" />
          </div>
        ) : (
          <div className="space-y-5">
            {data?.results.map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-medium --text-title sg-p-default">
                      {review.reviewer_name}
                    </p>
                    <Stars rating={review.rating} size={13} />
                  </div>
                  <span className="sg-p-small text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.headline && (
                  <p className="font-medium --text-title sg-p-default">
                    {review.headline}
                  </p>
                )}
                {review.body && (
                  <p className="sg-p-small --text-paragraph leading-relaxed">
                    {review.body}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleVote(review.id, true)}
                    disabled={voteMutation.isPending}
                    className={`flex items-center gap-1 sg-p-small cursor-pointer transition-colors disabled:opacity-50 ${
                      review.viewer_vote === true
                        ? "text-(--primary-700) font-medium"
                        : "text-gray-500 hover:text-(--primary-700)"
                    }`}
                  >
                    <ThumbsUp size={14} />
                    Helpful ({review.helpful_count})
                  </button>
                  <button
                    onClick={() => handleVote(review.id, false)}
                    disabled={voteMutation.isPending}
                    className={`flex items-center gap-1 sg-p-small cursor-pointer transition-colors disabled:opacity-50 ${
                      review.viewer_vote === false
                        ? "text-(--primary-700) font-medium"
                        : "text-gray-500 hover:text-(--primary-700)"
                    }`}
                  >
                    <ThumbsDown size={14} />
                    Not helpful ({review.not_helpful_count})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {data && data.next && (
          <div className="text-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="sg-p-small font-semibold text-(--primary-700) underline cursor-pointer"
            >
              Load more reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
