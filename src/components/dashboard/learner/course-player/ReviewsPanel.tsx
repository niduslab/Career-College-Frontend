"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  useCourseReviews,
  useReviewSummary,
  useMyReview,
  useUpsertReview,
  useDeleteReview,
  useVoteOnReview,
} from "@/hooks/use-reviews";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

function StarRow({
  value,
  size = "w-4 h-4",
}: {
  value: number;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${
            n <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "text-(--gray-200)"
          }`}
        />
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="cursor-pointer"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "text-(--gray-200) hover:text-amber-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPanel({
  courseSlug,
}: {
  courseSlug?: string;
}) {
  const { data: summary } = useReviewSummary(courseSlug);
  const { data: reviewsPage, isLoading: reviewsLoading } =
    useCourseReviews(courseSlug);
  const { data: myReview, isLoading: myReviewLoading } =
    useMyReview(courseSlug);
  const upsertMutation = useUpsertReview(courseSlug);
  const deleteMutation = useDeleteReview(courseSlug);
  const voteMutation = useVoteOnReview(courseSlug);

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");

  const startEditing = () => {
    setRating(myReview?.rating ?? 0);
    setHeadline(myReview?.headline ?? "");
    setBody(myReview?.body ?? "");
    setEditing(true);
  };

  const handleSubmit = () => {
    if (rating < 1) {
      notify.error("Please pick a star rating.");
      return;
    }
    upsertMutation.mutate(
      { rating, headline, body },
      {
        onSuccess: (res) => {
          notify.success(res.message || "Review saved.");
          setEditing(false);
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Failed to save review.",
          ),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => notify.success("Review deleted."),
      onError: (err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to delete review.",
        ),
    });
  };

  const handleVote = (reviewId: number, isHelpful: boolean) => {
    voteMutation.mutate(
      { reviewId, isHelpful },
      {
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Failed to vote.",
          ),
      },
    );
  };

  const avg = summary?.avg_rating ? parseFloat(summary.avg_rating) : 0;
  const reviews = reviewsPage?.results ?? [];

  return (
    <div className="max-w-3xl mt-4">
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-[28px] font-bold text-(--text-title)">
          {avg > 0 ? avg.toFixed(1) : "—"}
        </div>
        <div>
          <StarRow value={avg} />
          <p className="text-[12px] text-(--gray-500) mt-1">
            {summary?.review_count ?? 0} review
            {(summary?.review_count ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Own review — enrolled learners only */}
      <div className="mb-6 p-4 rounded-lg border border-(--gray-200) bg-(--gray-50)">
          {myReviewLoading ? (
            <div className="flex items-center gap-2 text-(--gray-400) text-[13px]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading your review...
            </div>
          ) : editing ? (
            <div className="space-y-3">
              <StarPicker value={rating} onChange={setRating} />
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={150}
                placeholder="Headline (optional)"
                className="w-full h-9 px-3 rounded-md border border-(--gray-200) text-[14px] outline-none focus:border-(--primary-600)"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-(--gray-200) text-[14px] outline-none focus:border-(--primary-600) resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={upsertMutation.isPending}
                  className="px-4 py-2 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
                >
                  {upsertMutation.isPending ? "Saving..." : "Save review"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-md text-(--gray-500) hover:bg-(--gray-100) text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : myReview ? (
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <StarRow value={myReview.rating} />
                  {myReview.headline && (
                    <p className="text-[14px] font-semibold text-(--text-title) mt-1">
                      {myReview.headline}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={startEditing}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-(--gray-100) cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-(--gray-500)" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-(--gray-100) cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              </div>
              {myReview.body && (
                <p className="text-[13px] text-(--gray-500) mt-2">
                  {myReview.body}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="px-4 py-2 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Write a review
            </button>
          )}
        </div>

      {/* Review list */}
      {reviewsLoading ? (
        <div className="flex items-center gap-2 text-(--gray-400) text-[14px]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-[13px] text-(--gray-400)">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="pb-4 border-b border-(--gray-100) last:border-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StarRow value={r.rating} size="w-3.5 h-3.5" />
                  <span className="text-[13px] font-semibold text-(--text-title)">
                    {r.reviewer_name}
                  </span>
                </div>
                <span className="text-[11px] text-(--gray-400)">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.headline && (
                <p className="text-[14px] font-semibold text-(--text-title) mt-1.5">
                  {r.headline}
                </p>
              )}
              {r.body && (
                <p className="text-[13px] text-(--gray-500) mt-1">{r.body}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleVote(r.id, true)}
                  disabled={voteMutation.isPending}
                  className={`flex items-center gap-1 text-[12px] cursor-pointer transition-colors ${
                    r.viewer_vote === true
                      ? "text-(--primary-600) font-semibold"
                      : "text-(--gray-400) hover:text-(--text-title)"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {r.helpful_count}
                </button>
                <button
                  onClick={() => handleVote(r.id, false)}
                  disabled={voteMutation.isPending}
                  className={`flex items-center gap-1 text-[12px] cursor-pointer transition-colors ${
                    r.viewer_vote === false
                      ? "text-rose-600 font-semibold"
                      : "text-(--gray-400) hover:text-(--text-title)"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {r.not_helpful_count}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
