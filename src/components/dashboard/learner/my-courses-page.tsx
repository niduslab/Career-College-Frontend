"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Clock,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/common/pagination";
import { useMyCourses } from "@/hooks/use-course-catalog";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import type { Enrollment, EnrollmentStatusFilter } from "@/lib/course-api";
import type { Enrollment, EnrollmentStatusFilter } from "@/lib/course-api";

const PAGE_SIZE = 6;

type Tab = "All" | "In Progress" | "Completed";

const TABS: { label: Tab; status: EnrollmentStatusFilter }[] = [
  { label: "All", status: "all" },
  { label: "In Progress", status: "in_progress" },
  { label: "Completed", status: "completed" },
];
const TABS: { label: Tab; status: EnrollmentStatusFilter }[] = [
  { label: "All", status: "all" },
  { label: "In Progress", status: "in_progress" },
  { label: "Completed", status: "completed" },
];

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "Never accessed";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const LEVEL_COLOR: Record<string, string> = {
  beginner: "text-emerald-600 bg-emerald-50",
  intermediate: "text-amber-600 bg-amber-50",
  advanced: "text-rose-600 bg-rose-50",
};

export default function MyCoursesPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const activeStatus =
    TABS.find((t) => t.label === activeTab)?.status ?? "all";

  // Filtering and pagination are server-side. They used to run client-side
  // over an unpaginated fetch, which silently capped the page at the server's
  // default 10 enrollments — a finished course, having the oldest
  // `last_accessed_at`, was the first thing to fall off the end.
  const { data, isLoading, isError } = useMyCourses({
    status: activeStatus,
    page: currentPage,
    page_size: PAGE_SIZE,
  });

  const enrollments = useMemo(() => data?.results ?? [], [data]);
  const statusCounts = data?.status_counts;
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const activeStatus =
    TABS.find((t) => t.label === activeTab)?.status ?? "all";

  // Filtering and pagination are server-side. They used to run client-side
  // over an unpaginated fetch, which silently capped the page at the server's
  // default 10 enrollments — a finished course, having the oldest
  // `last_accessed_at`, was the first thing to fall off the end.
  const { data, isLoading, isError } = useMyCourses({
    status: activeStatus,
    page: currentPage,
    page_size: PAGE_SIZE,
  });

  const enrollments = useMemo(() => data?.results ?? [], [data]);
  const statusCounts = data?.status_counts;
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetPage = () => setCurrentPage(1);

  const tabs: { label: Tab; count: number }[] = useMemo(
    () => [
      { label: "All", count: statusCounts?.all ?? 0 },
      { label: "In Progress", count: statusCounts?.in_progress ?? 0 },
      { label: "Completed", count: statusCounts?.completed ?? 0 },
      { label: "All", count: statusCounts?.all ?? 0 },
      { label: "In Progress", count: statusCounts?.in_progress ?? 0 },
      { label: "Completed", count: statusCounts?.completed ?? 0 },
    ],
    [statusCounts],
    [statusCounts],
  );

  // The endpoint has no search param, so this narrows the current page only.
  const paginated = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enrollments;
    return enrollments.filter((e) =>
      e.course.title.toLowerCase().includes(query),
    );
  }, [enrollments, search]);
  // The endpoint has no search param, so this narrows the current page only.
  const paginated = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enrollments;
    return enrollments.filter((e) =>
      e.course.title.toLowerCase().includes(query),
    );
  }, [enrollments, search]);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll(".course-card"));
    gsap.killTweensOf(cards);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power3.out" },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [activeTab, search, view, currentPage, enrollments.length]);
  }, [activeTab, search, view, currentPage, enrollments.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            My Courses
          </h1>
          <p className="text-[14px] text-(--gray-500) mt-0.5">
            Pick up where you left off across {statusCounts?.all ?? 0} enrolled
            Pick up where you left off across {statusCounts?.all ?? 0} enrolled
            courses.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/learner/course-catalog")}
          className="self-start flex items-center cursor-pointer gap-2 bg-(--primary-700) hover:bg-(--primary-600) text-white text-[14px] font-semibold px-4 py-2.5 rounded-lg transition-colors truncate"
        >
          <Plus className="w-4 h-4" />
          Browse Catalog
        </button>
      </div>

      {/* Tabs + Search + View toggle */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={() => {
                setActiveTab(t.label);
                resetPage();
              }}
              className={`flex items-center gap-1.5 cursor-pointer px-3.5 h-11 rounded-md text-[12px] md:text-[14px] transition-colors border whitespace-nowrap shrink-0 ${
                activeTab === t.label
                  ? "bg-(--primary-600) text-white border-(--primary-600) font-medium"
                  : "bg-white text-(--gray-500) font-normal border-(--gray-200) hover:border-(--primary-300)"
              }`}
            >
              {t.label}
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === t.label
                    ? "bg-white/20 text-white"
                    : "bg-(--gray-100) text-(--gray-500)"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="w-full h-12 pl-9 pr-4 text-[12px] md:text-[14px] lg:text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) focus:outline-none focus:border-(--primary-400)"
            />
          </div>
          <div className="flex items-center border border-(--gray-200) rounded-xl overflow-hidden bg-white shrink-0">
            <button
              onClick={() => setView("grid")}
              className={`w-10 h-12 flex items-center cursor-pointer justify-center transition-colors ${
                view === "grid"
                  ? "bg-(--primary-50) text-(--primary-600)"
                  : "text-(--gray-400) hover:bg-(--gray-50)"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`w-10 h-12 flex items-center cursor-pointer justify-center transition-colors ${
                view === "list"
                  ? "bg-(--primary-50) text-(--primary-600)"
                  : "text-(--gray-400) hover:bg-(--gray-50)"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Course grid / list */}
      {isError ? (
        <div className="py-16 text-center text-(--gray-400)">
          <p className="text-[16px] font-medium text-rose-500">
            Failed to load your courses
          </p>
          <p className="text-[14px] mt-1">Please try again in a moment.</p>
        </div>
      ) : (
        <div
          ref={gridRef}
          className={
            view === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="h-75 rounded-2xl border border-(--gray-200) bg-(--gray-50) animate-pulse"
                />
              ))
            : paginated.map((enrollment, i) =>
                view === "grid" ? (
                  <GridCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    isPriority={i === 0}
                  />
                ) : (
                  <ListCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    isPriority={i === 0}
                  />
                ),
              )}
          {!isLoading && paginated.length === 0 && (
            <p className="text-(--gray-400) text-[14px] col-span-full py-12 text-center">
              No courses found.
            </p>
          )}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 rounded-full bg-(--gray-100)">
      <div
        className="h-2 rounded-full bg-(--primary-700) transition-all duration-700"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

<<<<<<< HEAD
function GridCard({
  enrollment,
  isPriority,
}: {
  enrollment: Enrollment;
  isPriority?: boolean;
}) {
=======
/** A completed course the learner later unenrolled from still appears here —
 *  the certificate is theirs to keep — but the player would reject them, so
 *  the card points at the certificate instead. */
function cardHref(enrollment: Enrollment): string {
  return enrollment.is_active
    ? `/dashboard/learner/course-player/${enrollment.course.slug}`
    : "/dashboard/learner/certificates";
}

function statusLabel(enrollment: Enrollment): string {
  if (!enrollment.completed_at) return "In progress";
  return enrollment.is_active ? "Completed" : "Completed · access ended";
}

function GridCard({ enrollment }: { enrollment: Enrollment }) {
>>>>>>> 26783de57d5304630505edab82b59d0207508e36
  const router = useRouter();
  const { course } = enrollment;
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const thumbnail = thumbnailFailed ? null : mediaUrl(course.thumbnail);
  const instructor = course.instructors[0];
  const levelLabel =
    course.level.charAt(0).toUpperCase() + course.level.slice(1);

  return (
    <div
      onClick={() => router.push(cardHref(enrollment))}
      onClick={() => router.push(cardHref(enrollment))}
      className="course-card bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="relative h-40 overflow-hidden bg-(--gray-50)">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setThumbnailFailed(true)}
            priority={isPriority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--gray-300) text-[12px]">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 z-10 text-[12px] font-semibold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {levelLabel}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLOR[course.level]}`}
          >
            {enrollment.enrollment_type === "paid" ? "Paid" : "Free"}
          </span>
        </div>

        <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title) leading-snug group-hover:text-(--primary-600) transition-colors line-clamp-2">
          {course.title}
        </h3>

        <span className="text-[12px] font-medium text-(--gray-500) truncate block">
          {instructor?.full_name ?? "Career College"}
        </span>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-medium text-(--gray-500)">
              Progress
            </span>
            <span className="text-[12px] font-semibold text-(--primary-700)">
              {enrollment.progress_percent}%
            </span>
          </div>
          <ProgressBar percent={enrollment.progress_percent} />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-[12px] text-(--gray-500)">
            <Clock className="w-4 h-4" />
            {statusLabel(enrollment)}
            {statusLabel(enrollment)}
          </span>
          <span className="text-[12px] text-(--gray-500)">
            {formatRelativeTime(enrollment.last_accessed_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ListCard({
  enrollment,
  isPriority,
}: {
  enrollment: Enrollment;
  isPriority?: boolean;
}) {
  const router = useRouter();
  const { course } = enrollment;
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const thumbnail = thumbnailFailed ? null : mediaUrl(course.thumbnail);
  const instructor = course.instructors[0];
  const levelLabel =
    course.level.charAt(0).toUpperCase() + course.level.slice(1);

  return (
    <div
      onClick={() =>
        router.push(`/dashboard/learner/course-player/${course.slug}`)
      }
      className="course-card bg-white rounded-2xl border border-(--gray-200) p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="relative w-16 h-16 rounded-xl shrink-0 overflow-hidden bg-(--gray-50)">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            sizes="64px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setThumbnailFailed(true)}
            priority={isPriority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--gray-300) text-[10px]">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[course.level]}`}
          >
            {enrollment.enrollment_type === "paid" ? "Paid" : "Free"}
          </span>
          <span className="text-[12px] text-(--gray-500)">{levelLabel}</span>
        </div>
        <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title) truncate group-hover:text-(--primary-600) transition-colors">
          {course.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[12px] text-(--gray-500) font-normal">
            {instructor?.full_name ?? "Career College"}
          </span>
          <span className="flex items-center gap-1 text-[12px] font-normal text-(--gray-500)">
            <Clock className="w-4 h-4" />
            {statusLabel(enrollment)}
            {statusLabel(enrollment)}
          </span>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 w-36">
        <div className="flex items-center justify-between w-full">
          <span className="text-[12px] text-(--gray-500)">Progress</span>
          <span className="text-[12px] font-semibold text-(--primary-700)">
            {enrollment.progress_percent}%
          </span>
        </div>
        <div className="w-full">
          <ProgressBar percent={enrollment.progress_percent} />
        </div>
        <span className="text-[12px] text-(--gray-500) self-end">
          {formatRelativeTime(enrollment.last_accessed_at)}
        </span>
      </div>
    </div>
  );
}
