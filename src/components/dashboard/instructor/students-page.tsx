"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Search,
  ChevronDown,
  BookOpen,
  Loader2,
  Award,
} from "lucide-react";
import {
  STUDENT_STATUSES,
  STUDENT_STATUS_LABELS,
  type StudentRow,
  type StudentSort,
  type StudentStatus,
} from "@/lib/instructor-students-api";
import {
  useInstructorStudents,
  useInstructorStudentsSummary,
} from "@/hooks/use-instructor-students";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { Pagination } from "@/components/common/pagination";
import { SearchableDropdown } from "@/components/dashboard/common/searchable-dropdown";

const PAGE_SIZE = 10;

/** Header and rows must share one grid definition — two copies drift the
 *  moment a column width changes. Status is a fixed 7rem rather than `auto`:
 *  an auto column shrinks to hug the badge, which crowds it against Last
 *  Active and makes the badge edge ragged from row to row. */
const ROW_GRID = "grid grid-cols-[2fr_1.6fr_1.2fr_1fr_7rem] gap-x-6";

const TABLE_COLUMNS: { label: string; align: string }[] = [
  { label: "Student", align: "text-left" },
  { label: "Course", align: "text-left" },
  { label: "Progress", align: "text-left" },
  { label: "Last Active", align: "text-right" },
  { label: "Status", align: "text-right" },
];

const SORT_OPTIONS: { value: StudentSort; label: string }[] = [
  { value: "-last_active", label: "Recently active" },
  { value: "last_active", label: "Least recently active" },
  { value: "-enrolled", label: "Newest enrolled" },
  { value: "enrolled", label: "Oldest enrolled" },
  { value: "-progress", label: "Highest progress" },
  { value: "progress", label: "Lowest progress" },
  { value: "name", label: "Name (A–Z)" },
];

/** Status colours. Only `active`/`completed` are "good"; `unenrolled` is the
 *  only genuinely negative state, so it gets the red treatment. Tailwind
 *  literals for the tints — globals.css only defines --success-500 /
 *  --warning-500 / --danger-500, no 50/200 steps. */
const STATUS_STYLES: Record<StudentStatus, string> = {
  active: "text-green-600 bg-green-50 border-green-200",
  completed: "text-(--primary-700) bg-(--primary-50) border-(--primary-100)",
  inactive: "text-orange-600 bg-orange-50 border-orange-200",
  not_started: "text-(--gray-500) bg-(--gray-50) border-(--gray-200)",
  unenrolled: "text-red-600 bg-red-50 border-red-200",
};

function formatRelative(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Backend returns a path relative to the media root; mediaUrl prepends the
  // API origin (and passes an already-absolute URL through untouched).
  const resolved = mediaUrl(src);
  if (resolved) {
    return (
      <Image
        src={resolved}
        alt=""
        width={36}
        height={36}
        unoptimized
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-(--primary-100) text-(--primary-700) text-[13px] font-semibold flex items-center justify-center shrink-0">
      {initials || "?"}
    </div>
  );
}

function StatusBadge({ status }: { status: StudentStatus }) {
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {STUDENT_STATUS_LABELS[status]}
    </span>
  );
}

function GrowthBadge({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <p className="text-[12px] text-(--gray-400)">No prior data to compare</p>
    );
  }
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <p
      className={`text-[12px] font-medium flex items-center gap-1 ${up ? "text-(--success-500)" : "text-(--danger-500)"}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {up ? "+" : ""}
      {pct}% vs previous period
    </p>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-(--gray-500) font-normal mb-2">
            {label}
          </p>
          <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
            {value}
          </p>
        </div>
        <div className="w-10 h-10 xl:w-8 xl:h-8 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 xl:w-5 xl:h-5 text-(--primary-600)" />
        </div>
      </div>
      <div className="border border-dashed border-(--gray-200)" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function StudentTableRow({ row }: { row: StudentRow }) {
  const { progress_percent: pct } = row;

  return (
    <div
      className={`${ROW_GRID} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors`}
    >
      {/* Student */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={row.student.full_name} src={row.student.avatar} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-(--text-title) truncate flex items-center gap-1.5">
            {row.student.full_name}
            {row.has_certificate && (
              <span
                title="Certificate issued"
                className="shrink-0 leading-none"
              >
                <Award className="w-3.5 h-3.5 text-(--warning-500)" />
              </span>
            )}
          </p>
          <p className="text-[12px] text-(--gray-500) truncate">
            {row.student.email}
          </p>
        </div>
      </div>

      {/* Course */}
      <div className="min-w-0">
        <p className="text-[12px] text-(--gray-600) truncate">
          {row.course.title}
        </p>
        <p className="text-[11px] text-(--gray-400) truncate">
          {row.cohort ? row.cohort : "Self-paced"} ·{" "}
          {row.enrollment_type === "paid" ? "Paid" : "Free"}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-(--primary-600) transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[12px] font-semibold text-(--text-title) shrink-0 w-9 text-right">
          {pct}%
        </span>
      </div>

      {/* Last active */}
      <div className="min-w-0 text-right">
        <p className="text-[12px] text-(--gray-600)">
          {formatRelative(row.last_active_at)}
        </p>
        <p className="text-[11px] text-(--gray-400)">
          Joined {formatDate(row.enrolled_at)}
        </p>
      </div>

      {/* Status — fixed-width column, badge left-aligned within it so every
          row's badge starts at the same x position */}
      <div className="flex justify-end">
        <StatusBadge status={row.status} />
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [courseId, setCourseId] = useState<number | "">("");
  const [status, setStatus] = useState<StudentStatus | "">("");
  const [sort, setSort] = useState<StudentSort>("-last_active");
  const [page, setPage] = useState(1);

  // The backend rejects a 1-character term with a 400, so only send a term
  // once it is long enough to be valid.
  const search = searchInput.trim().length >= 2 ? searchInput.trim() : "";

  const summaryQuery = useInstructorStudentsSummary();
  const listQuery = useInstructorStudents({
    search,
    course_id: courseId,
    status,
    sort,
    page,
    page_size: PAGE_SIZE,
  });

  const summary = summaryQuery.data;
  const list = listQuery.data;

  const courseOptions = useMemo(
    () => [
      { value: "" as number | "", label: "All courses" },
      ...(summary?.courses ?? []).map((c) => ({
        value: c.id as number | "",
        label: c.title,
      })),
    ],
    [summary?.courses],
  );

  const statusOptions = useMemo(
    () => [
      { value: "" as StudentStatus | "", label: "All statuses" },
      ...STUDENT_STATUSES.map((s) => ({
        value: s as StudentStatus | "",
        label: `${STUDENT_STATUS_LABELS[s]}${
          summary ? ` (${summary.status_breakdown[s]})` : ""
        }`,
      })),
    ],
    [summary],
  );

  const resetPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const totalPages = list ? Math.max(1, Math.ceil(list.count / PAGE_SIZE)) : 1;
  const maxBreakdown = summary
    ? Math.max(1, ...Object.values(summary.status_breakdown))
    : 1;
  const maxTopCourse = summary?.top_courses?.length
    ? Math.max(...summary.top_courses.map((c) => c.students))
    : 1;

  if (summaryQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-(--primary-600)" />
      </div>
    );
  }

  if (summaryQuery.isError || !summary) {
    return (
      <div className="bg-white rounded-2xl border border-(--gray-200) p-8 text-center">
        <p className="text-[14px] text-(--gray-500)">
          Could not load your students. Please try again.
        </p>
      </div>
    );
  }

  return (
    // Sidebar goes beside the table only at 2xl. At xl (1280px) the dashboard
    // chrome plus a 288px sidebar leaves the table too narrow, and its columns
    // collapsed instead of scrolling.
    <div className="flex flex-col 2xl:flex-row gap-5">
      {/* Left */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Stat cards */}
        {/* 2-up until lg — at 768px four cards squeeze the growth line onto
            two lines. */}
        <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4  gap-3">
          {/* Labels name the unit they count. "Students" = distinct people,
              "Enrollments" = rows — the two differ whenever a learner takes
              more than one of your courses, so the label must say which. */}
          <StatCard
            label="Total Students"
            value={String(summary.total_students)}
            icon={Users}
          >
            <p className="text-[12px] text-(--gray-500)">
              unique learners in {summary.courses.length} course
              {summary.courses.length === 1 ? "" : "s"}
            </p>
          </StatCard>

          <StatCard
            label="Currently Active"
            value={String(summary.active_students)}
            icon={Activity}
          >
            <p className="text-[12px] text-(--gray-500)">
              studied in the last {summary.inactive_after_days} days
            </p>
          </StatCard>

          <StatCard
            label="Avg. Course Progress"
            value={`${summary.avg_progress}%`}
            icon={TrendingUp}
          >
            <p className="text-[12px] text-(--gray-500)">
              average across all enrollments
            </p>
          </StatCard>

          <StatCard
            label="New Enrollments"
            value={String(summary.new_this_period)}
            icon={UserPlus}
          >
            <p className="text-[12px] text-(--gray-500)">
              in the last {summary.window_days} days
            </p>
            <GrowthBadge pct={summary.new_growth_pct} />
          </StatCard>
        </div>

        {/* Table card */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
          <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
            All Students
            <span className="ml-2 text-[12px] font-normal text-(--gray-500)">
              ({list?.count ?? 0})
            </span>
          </p>

          {/* Search + filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative md:flex-1 lg:flex-none lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or email..."
                className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:items-center gap-3 md:ml-auto">
              <SearchableDropdown
                value={courseId}
                options={courseOptions}
                onChange={resetPage(setCourseId)}
                icon={BookOpen}
                searchable={courseOptions.length > 8}
                searchPlaceholder="Search courses..."
              />
              <SearchableDropdown
                value={status}
                options={statusOptions}
                onChange={resetPage(setStatus)}
                minWidth="min-w-44"
              />
              <SearchableDropdown
                value={sort}
                options={SORT_OPTIONS}
                onChange={resetPage(setSort)}
                minWidth="min-w-48"
              />
            </div>
          </div>

          {searchInput.trim().length === 1 && (
            <p className="text-[12px] text-(--warning-600)">
              Type at least 2 characters to search.
            </p>
          )}

          {/* Table */}
          <div className="overflow-x-auto -mx-5 px-5">
            {/* 5 columns + gap-x-6 need ~800px; below that the wrapper
                scrolls rather than squeezing "Last Active" onto three lines. */}
            <div className="min-w-200">
              <div
                className={`${ROW_GRID} px-3 pb-2 border-b border-(--gray-100)`}
              >
                {TABLE_COLUMNS.map((c) => (
                  <p
                    key={c.label}
                    className={`text-[11px]  font-semibold tracking-widest text-(--gray-400) uppercase ${c.align}`}
                  >
                    {c.label}
                  </p>
                ))}
              </div>

              {listQuery.isLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-(--primary-600)" />
                </div>
              ) : listQuery.isError ? (
                <div className="py-12 text-center">
                  <p className="text-[14px] text-(--gray-500)">
                    Could not load students. Please try again.
                  </p>
                </div>
              ) : !list || list.results.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
                  <p className="text-[14px] text-(--gray-500)">
                    {summary.total_students === 0
                      ? "No one has enrolled in your courses yet."
                      : "No students match your filters."}
                  </p>
                </div>
              ) : (
                <div
                  className={`space-y-1 pt-1 transition-opacity ${listQuery.isFetching ? "opacity-60" : ""}`}
                >
                  {list.results.map((row) => (
                    <StudentTableRow key={row.enrollment_id} row={row} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pagination — shared component, same as every other paginated
              table in the dashboard. */}
          {list && list.count > PAGE_SIZE && (
            <div className="pt-2 border-t border-(--gray-100)">
              <p className="text-[12px] text-(--gray-500)">
                Page {page} of {totalPages} · {list.count} enrollment
                {list.count === 1 ? "" : "s"}
              </p>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar — below 2xl it sits under the table at full width, so
          the two cards go side by side instead of leaving half the row empty.
          At 2xl it becomes a real 288px column and they stack. */}
      <div className="w-full 2xl:w-72 shrink-0 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-1 gap-4 items-start content-start">
        {/* Top enrolled courses */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Top Enrolled Courses
          </p>
          {summary.top_courses.length === 0 ? (
            <p className="text-[12px] text-(--gray-400)">No enrollments yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.top_courses.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-(--primary-700) text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[12px] font-medium text-(--text-title) truncate">
                      {c.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-(--primary-600) transition-all duration-700"
                          style={{
                            width: `${Math.round((c.students / maxTopCourse) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[12px] text-(--gray-500) shrink-0">
                        {c.students}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Status Breakdown
          </p>
          <div className="space-y-2.5">
            {STUDENT_STATUSES.map((s) => {
              const count = summary.status_breakdown[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatus(status === s ? "" : s);
                    setPage(1);
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg px-1 py-1 cursor-pointer transition-colors ${
                    status === s ? "bg-(--primary-50)" : "hover:bg-(--gray-50)"
                  }`}
                >
                  <span className="text-[12px] text-(--gray-600) w-20 shrink-0 text-left">
                    {STUDENT_STATUS_LABELS[s]}
                  </span>
                  <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-(--primary-600) transition-all duration-700"
                      style={{
                        width: `${Math.round((count / maxBreakdown) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-(--text-title) w-6 text-right shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-(--gray-400) leading-snug pt-1 border-t border-(--gray-100)">
            Counts enrollments, not people — a learner in two of your courses
            appears in both.
          </p>
        </div>
      </div>
    </div>
  );
}
