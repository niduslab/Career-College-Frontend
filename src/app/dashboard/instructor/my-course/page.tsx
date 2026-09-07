"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageOff, Pencil } from "lucide-react";
import gsap from "gsap";
import PageHeader from "@/components/dashboard/common/page-header";
import CreateCourseDropdown from "@/components/dashboard/instructor/create-course-dropdown";
import SearchFilterBar from "@/components/dashboard/instructor/search-filter-bar";
import { Pagination } from "@/components/common/pagination";
import {
  listCourses,
  type Course,
  type CourseStatus,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";

const STATUS_LABEL: Record<CourseStatus, string> = {
  draft: "Draft",
  under_review: "In Review",
  institution_review: "In Review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

const STATUS_STYLE: Record<CourseStatus, string> = {
  draft: "bg-[#E5E7EB] text-[#6A7282]",
  under_review: "bg-[#FFF5C4] text-[#8F4300]",
  institution_review: "bg-[#FFF5C4] text-[#8F4300]",
  published: "bg-[#D0FAE5] text-[#007A55]",
  rejected: "bg-red-50 text-red-700",
  archived: "bg-[#E5E7EB] text-[#6A7282]",
};

const STATUS_FILTER_OPTIONS = [
  "All Status",
  "Draft",
  "In Review",
  "Published",
  "Rejected",
  "Archived",
];

const PAGE_SIZE = 8;

export default function MyCoursePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    listCourses(page, PAGE_SIZE)
      .then((res) => {
        if (!active) return;
        setCourses(res.results);
        setCount(res.count);
      })
      .catch((err) => {
        if (!active) return;
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load courses.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page]);

  const goToPage = (next: number) => {
    setLoading(true);
    setPage(next);
  };

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || STATUS_LABEL[c.status] === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const publishedCount = courses.filter((c) => c.status === "published").length;
  const inReviewCount = courses.filter(
    (c) => c.status === "under_review" || c.status === "institution_review",
  ).length;

  const goToEdit = (course: Course) => {
    router.push(`/dashboard/instructor/course-builder?courseId=${course.id}`);
  };

  const viewDetails = (course: Course) => {
    if (course.status !== "published") {
      notify.info("This course isn't published yet — preview isn't available.");
      return;
    }
    window.open(`/course-player/${course.slug}`, "_blank");
  };

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll(".course-card"));
    if (cards.length === 0) return;
    gsap.killTweensOf(cards);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power3.out" },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [filtered.length, loading]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Courses"
        subtitle={`${publishedCount} active courses, ${inReviewCount} currently in review.`}
        action={<CreateCourseDropdown />}
      />

      <SearchFilterBar
        searchPlaceholder="search courses..."
        filterOptions={STATUS_FILTER_OPTIONS}
        searchValue={search}
        filterValue={statusFilter}
        onSearchChange={(v) => setSearch(v)}
        onFilterChange={(v) => setStatusFilter(v)}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-(--gray-200) bg-(--gray-50) animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
          No courses found.
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((course) => (
            <GridCourseCard
              key={course.id}
              course={course}
              onEdit={goToEdit}
              onViewDetails={viewDetails}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onViewDetails: (course: Course) => void;
}

function GridCourseCard({ course, onEdit, onViewDetails }: CourseCardProps) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const thumb = thumbnailFailed ? null : mediaUrl(course.thumbnail);

  return (
    <div className="course-card bg-white rounded-2xl border border-(--gray-200) overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative h-42.5 overflow-hidden bg-(--gray-100)">
        {thumb ? (
          <Image
            src={thumb}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setThumbnailFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-linear-to-br from-(--gray-100) to-(--gray-50) text-(--gray-400)">
            <ImageOff className="w-6 h-6" />
            <span className="text-[11px] font-medium">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        {course.category && (
          <span className="absolute top-3 left-3 z-10 bg-black/30 text-white text-[12px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {course.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span
          className={`self-start text-[12px] font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[course.status]}`}
        >
          {STATUS_LABEL[course.status]}
        </span>

        <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title) leading-snug line-clamp-2 group-hover:text-(--primary-600) transition-colors">
          {course.title}
        </p>

        <p className="text-[12px] text-(--gray-500) capitalize">
          {course.level} · {course.language}
        </p>

        <div className="border border-(--gray-200) mt-4 mb-4 border-dashed"></div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="lg:text-[14px] text-[12px] font-semibold text-(--text-title)">
            ৳{course.price}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewDetails(course)}
              className="text-[12px] cursor-pointer text-(--primary-600) font-normal hover:underline"
            >
              View Details
            </button>
            <button
              onClick={() => onEdit(course)}
              className="flex items-center gap-1 text-[12px] font-normal h-6 p-1.5 rounded-sm bg-(--gray-100) cursor-pointer text-(--text-paragraph) hover:text-(--text-title) transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
