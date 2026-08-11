"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  TrendingUp,
  Heart,
  ShoppingCart,
  Trash2,
  Search,
  BookOpen,
} from "lucide-react";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/common/query-states";
import { useEnrollInCourse } from "@/hooks/use-course-catalog";
import { useCreateCheckoutSession } from "@/hooks/use-payments";
import { useToggleWishlist, useWishlist } from "@/hooks/use-wishlist";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { WishlistEntry } from "@/lib/wishlist-api";

const PAGE_SIZE = 4;

const LEVEL_COLOR: Record<string, string> = {
  beginner: "text-emerald-600 bg-emerald-50",
  intermediate: "text-amber-600 bg-amber-50",
  advanced: "text-rose-600 bg-rose-50",
};

function formatDuration(minutes: number | null): string {
  if (!minutes) return "—";
  const hours = minutes / 60;
  return hours >= 1 ? `${Math.round(hours * 10) / 10}h` : `${minutes}m`;
}

function formatAdded(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function WishlistCard({ entry }: { entry: WishlistEntry }) {
  const course = entry.course;
  const price = Number(course.price);
  const isFree = price <= 0;
  const instructor = course.instructors[0];
  const thumbnail = mediaUrl(course.thumbnail);
  const levelLabel =
    course.level.charAt(0).toUpperCase() + course.level.slice(1);

  const wishlistMutation = useToggleWishlist();
  const enrollMutation = useEnrollInCourse();
  const checkoutMutation = useCreateCheckoutSession();

  const handleRemove = () => {
    wishlistMutation.mutate(
      { slug: course.slug, isWishlisted: true },
      {
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Couldn't remove the course.",
          ),
      },
    );
  };

  const startCheckout = () => {
    checkoutMutation.mutate(
      { course_slug: course.slug },
      {
        onSuccess: (session) => {
          window.location.href = session.gateway_url;
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Failed to start checkout.",
          ),
      },
    );
  };

  const handleEnroll = () => {
    enrollMutation.mutate(course.slug, {
      onSuccess: (res) => notify.success(res.message ?? "Enrolled successfully."),
      onError: (err) => {
        // A paid course rejects the free-enroll path with 422 — that is the
        // signal to open checkout, matching the catalog's behaviour.
        if (!isFree && err instanceof ApiError && err.status === 422) {
          startCheckout();
          return;
        }
        notify.error(err instanceof ApiError ? err.message : "Failed to enroll.");
      },
    });
  };

  const busy = enrollMutation.isPending || checkoutMutation.isPending;

  return (
    <div className="wishlist-card opacity-0 bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row">
      <div className="relative h-44 sm:h-auto sm:w-52 sm:shrink-0 overflow-hidden bg-(--gray-50)">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--gray-300) text-[12px]">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-[12px] text-(--gray-500) truncate">
            {course.category?.name ?? "Uncategorised"}
          </span>
          <span
            className={`text-[12px] font-medium px-2 py-0.5 rounded-full shrink-0 ${LEVEL_COLOR[course.level] ?? "text-(--gray-600) bg-(--gray-100)"}`}
          >
            {levelLabel}
          </span>
        </div>

        <Link
          href={`/courses/${course.slug}`}
          className="text-[16px] font-semibold text-(--text-title) leading-snug mb-2 line-clamp-2 hover:text-(--primary-600) transition-colors"
        >
          {course.title}
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] text-(--gray-500) truncate">
            {instructor?.full_name ?? "Career College"}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-auto">
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <Clock className="w-4 h-4 shrink-0" />
            {formatDuration(course.duration_minutes)}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <TrendingUp className="w-4 h-4 shrink-0" />
            {levelLabel}
          </span>
          <span className="text-[12px] text-(--gray-400) ml-auto hidden sm:block">
            Added {formatAdded(entry.created_at)}
          </span>
        </div>

        <div className="border-t border-(--gray-100) mt-3 mb-3" />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold text-(--text-title)">
              {isFree ? "Free" : `$${price.toFixed(2)}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRemove}
              disabled={wishlistMutation.isPending}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-(--gray-200) text-(--gray-400) hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
              title="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleEnroll}
              disabled={busy}
              className="flex items-center gap-1.5 h-9 px-4 rounded-md border border-(--primary-200) bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-600) text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart className="w-4 h-4" />
              {busy ? "Working…" : isFree ? "Enroll Now" : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useWishlist({
    page: currentPage,
    page_size: PAGE_SIZE,
  });

  const entries = useMemo(() => data?.results ?? [], [data]);
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // The wishlist endpoint has no search param, so filtering is client-side
  // over the current page. Clearing the box restores the full page.
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter(
      (entry) =>
        entry.course.title.toLowerCase().includes(query) ||
        entry.course.instructors.some((i) =>
          i.full_name.toLowerCase().includes(query),
        ),
    );
  }, [entries, search]);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const cards = Array.from(listRef.current.querySelectorAll(".wishlist-card"));
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power3.out" },
    );
  }, [filtered.length, search, currentPage]);

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[20px] md:text-[24px] font-semibold text-(--text-title)">
          Wishlist
        </h1>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] font-normal text-(--gray-500) mt-1">
          <span className="font-medium text-(--text-title)">
            {isLoading ? "—" : total}
          </span>{" "}
          saved course{total === 1 ? "" : "s"} · Enroll whenever you&apos;re
          ready.
        </p>
      </div>

      {!isLoading && !isError && total > 0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-(--primary-50) border border-(--primary-100) rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-(--primary-600) flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-(--text-title)">
                  {total} course{total === 1 ? "" : "s"} saved
                </p>
                <p className="text-[12px] text-(--gray-500)">
                  Enroll one at a time — free courses start instantly, paid ones
                  open checkout.
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search this page..."
              className="w-full pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
            />
          </div>
        </>
      )}

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your wishlist"
          onRetry={() => refetch()}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={<Heart className="w-6 h-6" />}
          title="Your wishlist is empty"
          description="Browse the course catalog and save the courses you're interested in."
          action={
            <Link
              href="/dashboard/learner/course-catalog"
              className="inline-flex items-center gap-2 rounded-lg bg-(--primary-600) px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-(--primary-700)"
            >
              <BookOpen className="w-4 h-4" />
              Browse courses
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No courses match your search"
          description="Try a different keyword, or clear the box to see this page again."
        />
      ) : (
        <>
          <div ref={listRef} className="space-y-4">
            {filtered.map((entry) => (
              <WishlistCard key={entry.id} entry={entry} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
