"use client";
import Image from "next/image";
import { Clock, BarChart3, Layers, Heart, Loader2 } from "lucide-react";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import {
  useEnrollInCourse,
  useUnenrollFromCourse,
} from "@/hooks/use-course-catalog";
import { useCreateCheckoutSession } from "@/hooks/use-payments";
import { useToggleWishlist } from "@/hooks/use-wishlist";
import type { CatalogCourseDetail } from "@/lib/course-api";

interface CourseInformationProps {
  course: CatalogCourseDetail;
  /** Undefined while the enrollment check is still loading. */
  isEnrolled: boolean | undefined;
  isOwnCourse: boolean;
  hideImage?: boolean;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "Self-paced";
  const hours = minutes / 60;
  return hours >= 1
    ? `${Math.round(hours * 10) / 10} hours`
    : `${minutes} minutes`;
}

// No subscriptions, no cart, no membership tier — this platform sells one
// course at one price via a hosted checkout, or lets a learner enroll free.
// The mock version modeled a business (subscription plans, cart) that has no
// backend behind it; see the instructor Billing tab removal for the same
// reasoning applied the other direction.
export default function CourseInformation({
  course,
  isEnrolled,
  isOwnCourse,
  hideImage = false,
}: CourseInformationProps) {
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useUnenrollFromCourse();
  const checkoutMutation = useCreateCheckoutSession();
  const wishlistMutation = useToggleWishlist();

  const price = Number(course.price);
  const isFree = price <= 0;
  const thumbnail = mediaUrl(course.thumbnail);
  const busy =
    enrollMutation.isPending ||
    unenrollMutation.isPending ||
    checkoutMutation.isPending;

  const startCheckout = () => {
    checkoutMutation.mutate(
      { course_slug: course.slug },
      {
        onSuccess: (session) => {
          window.location.href = session.gateway_url;
        },
        onError: (err) => {
          notify.error(
            err instanceof ApiError ? err.message : "Failed to start checkout.",
          );
        },
      },
    );
  };

  const handleEnroll = () => {
    enrollMutation.mutate(course.slug, {
      onSuccess: (res) => {
        notify.success(res.message ?? "Enrolled successfully.");
      },
      onError: (err) => {
        // Paid course with no prior order — the server refuses direct
        // enrollment and expects checkout first, same pattern as the catalog card.
        if (!isFree && err instanceof ApiError && err.status === 422) {
          startCheckout();
          return;
        }
        notify.error(err instanceof ApiError ? err.message : "Failed to enroll.");
      },
    });
  };

  const handleUnenroll = () => {
    unenrollMutation.mutate(course.slug, {
      onSuccess: (res) => {
        notify.success(res.message ?? "Unenrolled successfully.");
      },
      onError: (err) => {
        notify.error(
          err instanceof ApiError ? err.message : "Failed to unenroll.",
        );
      },
    });
  };

  const handleToggleWishlist = () => {
    wishlistMutation.mutate(
      { slug: course.slug, isWishlisted: course.is_wishlisted },
      {
        onError: (err) => {
          notify.error(
            err instanceof ApiError
              ? err.message
              : "Couldn't update your wishlist.",
          );
        },
      },
    );
  };

  return (
    <div className="sticky top-24 rounded-2xl w-full lg:w-90 xl:w-90 bg-white border border-(--gray-200) shadow-lg overflow-hidden">
      {!hideImage && (
        <div className="w-full h-50 relative rounded-t-2xl overflow-hidden bg-(--gray-50)">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={course.title}
              fill
              sizes="(max-width: 1024px) 100vw, 360px"
              className="object-cover"
              loading="eager"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-(--gray-300) text-[13px]">
              No image
            </div>
          )}
        </div>
      )}

      <div className="p-5 pb-6">
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-5">
          <span className="text-[26px] font-bold --title-text">
            {isFree ? "Free" : `BDT ${price.toFixed(2)}`}
          </span>
        </div>

        {/* Course info list */}
        <ul className="space-y-2.5 --text-paragraph sg-p-default mb-6">
          <li className="flex items-center gap-2">
            <Layers size={20} className="text-gray-500 shrink-0" />
            {course.total_sections} section
            {course.total_sections === 1 ? "" : "s"} ·{" "}
            {course.total_content_items} item
            {course.total_content_items === 1 ? "" : "s"}
          </li>
          <li className="flex items-center gap-2">
            <Clock size={20} className="text-gray-500 shrink-0" />
            {formatDuration(course.duration_minutes)}
          </li>
          <li className="flex items-center gap-2">
            <BarChart3 size={20} className="text-gray-500 shrink-0" />
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)} level
          </li>
        </ul>

        <div className="border mb-5"></div>

        {/* Action */}
        {isOwnCourse ? (
          <p className="text-center sg-p-default --text-paragraph py-2">
            This is your own course.
          </p>
        ) : isEnrolled === undefined ? (
          <div className="h-12 rounded-lg bg-(--gray-100) animate-pulse" />
        ) : isEnrolled ? (
          <div className="space-y-3">
            <p className="text-center sg-p-default font-medium text-(--success-500)">
              You&apos;re enrolled in this course.
            </p>
            <button
              onClick={handleUnenroll}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 --text-title cursor-pointer font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors sg-p-default disabled:opacity-60"
            >
              {unenrollMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Unenroll
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleEnroll}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-(--primary-700) cursor-pointer text-white font-semibold py-3 rounded-lg transition-colors sg-p-default disabled:opacity-60"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {isFree ? "Enroll for Free" : "Buy Now"}
            </button>
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 --text-title cursor-pointer font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors sg-p-default disabled:opacity-60"
            >
              <Heart
                size={16}
                className={
                  course.is_wishlisted ? "fill-(--primary-600) text-(--primary-600)" : ""
                }
              />
              {course.is_wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
