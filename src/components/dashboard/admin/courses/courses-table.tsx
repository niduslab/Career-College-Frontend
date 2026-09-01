"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import CoursesFilterBar from "./filter-bar";
import RowActionsMenu from "./row-actions-menu";
import CourseDetailModal from "../approvals/course-detail-modal";
import { Pagination } from "@/components/common/pagination";
import { mediaUrl } from "../../settings-shared/helpers";
import {
  useAdminCourses,
  useArchiveCourse,
  useRestoreCourse,
} from "@/hooks/use-admin-courses";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";
import type { AdminCourse, CourseStatus, DeliveryMode } from "@/lib/admin-courses-api";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<CourseStatus, string> = {
  draft: "Draft",
  institution_review: "Institution Review",
  under_review: "Under Review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

const STATUS_TONE: Record<CourseStatus, string> = {
  draft: "bg-(--gray-100) text-(--gray-600)",
  institution_review: "bg-blue-50 text-blue-600",
  under_review: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  archived: "bg-(--gray-100) text-(--gray-500)",
};

const DELIVERY_MODE_LABEL: Record<DeliveryMode, string> = {
  self_paced: "Self-paced",
  scheduled: "Scheduled",
};

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function ownerLabel(course: AdminCourse): string {
  if (course.partner_institution) return course.partner_institution.institution_name;
  return course.created_by?.full_name ?? "—";
}

function initialsOf(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function CoursesTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CourseStatus | "">("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | "">("");
  const [deliveryModeOpen, setDeliveryModeOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);

  const debouncedSearch = useDebounced(search, 350);

  const { data, isLoading, isError, isFetching } = useAdminCourses({
    search: debouncedSearch || undefined,
    status: status || undefined,
    delivery_mode: deliveryMode || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const archive = useArchiveCourse();
  const restore = useRestoreCourse();

  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const updateAndResetPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const handleArchive = (course: AdminCourse) => {
    archive.mutate(course.id, {
      onSuccess: () => notify.success(`"${course.title}" archived.`),
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to archive course."),
    });
  };

  const handleRestore = (course: AdminCourse) => {
    restore.mutate(course.id, {
      onSuccess: () => notify.success(`"${course.title}" restored to draft.`),
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to restore course."),
    });
  };

  return (
    <div className="space-y-4">
      <CoursesFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        status={status}
        onStatusChange={(v) => {
          updateAndResetPage(setStatus)(v);
          setStatusOpen(false);
        }}
        deliveryMode={deliveryMode}
        onDeliveryModeChange={(v) => {
          updateAndResetPage(setDeliveryMode)(v);
          setDeliveryModeOpen(false);
        }}
        statusOpen={statusOpen}
        onStatusToggle={() => {
          setStatusOpen((v) => !v);
          setDeliveryModeOpen(false);
        }}
        deliveryModeOpen={deliveryModeOpen}
        onDeliveryModeToggle={() => {
          setDeliveryModeOpen((v) => !v);
          setStatusOpen(false);
        }}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Course
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Owner
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Category
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Status
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Delivery Mode
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Created
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13px] text-(--gray-400)">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading courses…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13px] text-red-500">
                    Failed to load courses. Please try again.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[13px] text-(--gray-400)">
                    No courses match your filters.
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const busy =
                    (archive.isPending && archive.variables === c.id) ||
                    (restore.isPending && restore.variables === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-(--gray-50) transition-colors">
                      <td className="py-3 pr-8">
                        <button
                          type="button"
                          onClick={() => setDetailId(c.id)}
                          className="flex items-center gap-3 min-w-0 text-left cursor-pointer hover:opacity-80"
                        >
                          {mediaUrl(c.thumbnail) ? (
                            <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden bg-(--gray-50) border border-(--gray-100)">
                              <Image
                                src={mediaUrl(c.thumbnail) as string}
                                alt=""
                                width={36}
                                height={36}
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                              {initialsOf(c.title)}
                            </div>
                          )}
                          <p className="text-[13px] font-semibold text-(--text-title) truncate">
                            {c.title}
                          </p>
                        </button>
                      </td>
                      <td className="py-3 pr-8 text-[13px] text-(--gray-600) truncate">
                        {ownerLabel(c)}
                      </td>
                      <td className="py-3 pr-8 text-[12px] text-(--gray-500) truncate">
                        {c.category?.name ?? "—"}
                      </td>
                      <td className="py-3 pr-8">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_TONE[c.status]}`}
                        >
                          {STATUS_LABEL[c.status]}
                        </span>
                      </td>
                      <td className="py-3 pr-8">
                        <span className="inline-block truncate text-[11px] font-semibold px-2.5 py-1 rounded-full bg-(--gray-100) text-(--gray-600)">
                          {DELIVERY_MODE_LABEL[c.delivery_mode]}
                        </span>
                      </td>
                      <td className="py-3 pr-8 text-[13px] text-(--gray-600) whitespace-nowrap">
                        {c.created_at?.slice(0, 10) ?? "—"}
                      </td>
                      <td className="py-3 text-right">
                        <RowActionsMenu
                          course={c}
                          busy={busy}
                          onView={() => setDetailId(c.id)}
                          onArchive={() => handleArchive(c)}
                          onRestore={() => handleRestore(c)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-(--gray-100)">
          <p className="text-[12px] text-(--gray-400)">
            {isFetching && !isLoading && "Refreshing… · "}
            Showing {totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} courses
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {detailId !== null && (
        <CourseDetailModal id={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}
