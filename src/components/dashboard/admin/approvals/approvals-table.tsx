"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import ApprovalsFilterBar from "./filter-bar";
import RejectModal from "./reject-modal";
import ApprovalActionsMenu from "./approval-actions-menu";
import { Pagination } from "@/components/common/pagination";
import {
  usePendingReviewCourses,
  useReviewCourse,
} from "@/hooks/use-admin-courses";
import { toCsv, downloadTextFile } from "@/lib/export-csv";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";
import type { AdminCourse, DeliveryMode } from "@/lib/admin-courses-api";

const PAGE_SIZE = 10;

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
  if (course.partner_institution)
    return course.partner_institution.institution_name;
  return course.created_by?.full_name ?? "—";
}

function initialsOf(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function ApprovalsTable() {
  const [search, setSearch] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | "All">("All");
  const [deliveryModeOpen, setDeliveryModeOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AdminCourse | null>(null);

  const debouncedSearch = useDebounced(search, 350);

  const { data, isLoading, isError, isFetching } = usePendingReviewCourses({
    delivery_mode: deliveryMode === "All" ? undefined : deliveryMode,
    page,
    page_size: PAGE_SIZE,
  });

  const review = useReviewCourse();

  const filteredRows = useMemo(() => {
    const rows = data?.results ?? [];
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        ownerLabel(c).toLowerCase().includes(q),
    );
  }, [data, debouncedSearch]);

  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const updateAndResetPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const handleApprove = (course: AdminCourse) => {
    review.mutate(
      { id: course.id, action: "approve" },
      {
        onSuccess: () =>
          notify.success(`"${course.title}" approved and published.`),
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.detail : "Failed to approve course.",
          ),
      },
    );
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;
    review.mutate(
      { id: rejectTarget.id, action: "reject", rejectionReason: reason },
      {
        onSuccess: () => {
          notify.success(`"${rejectTarget.title}" rejected.`);
          setRejectTarget(null);
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.detail : "Failed to reject course.",
          ),
      },
    );
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      if (filteredRows.length === 0) {
        notify.error("No courses match the current filters.");
        return;
      }
      const csv = toCsv(
        filteredRows.map((c) => ({
          id: c.id,
          title: c.title,
          owner: ownerLabel(c),
          category: c.category?.name ?? "",
          delivery_mode: DELIVERY_MODE_LABEL[c.delivery_mode],
          submitted: c.created_at?.slice(0, 10) ?? "",
        })),
        [
          { key: "id", label: "ID" },
          { key: "title", label: "Course" },
          { key: "owner", label: "Instructor / Institution" },
          { key: "category", label: "Category" },
          { key: "delivery_mode", label: "Delivery Mode" },
          { key: "submitted", label: "Submitted" },
        ],
      );
      const date = new Date().toISOString().slice(0, 10);
      downloadTextFile(`pending-review-${date}.csv`, csv);
      notify.success(
        `Exported ${filteredRows.length} course${filteredRows.length === 1 ? "" : "s"}.`,
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <ApprovalsFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        deliveryMode={deliveryMode}
        onDeliveryModeChange={(v) => {
          updateAndResetPage(setDeliveryMode)(v);
          setDeliveryModeOpen(false);
        }}
        deliveryModeOpen={deliveryModeOpen}
        onDeliveryModeToggle={() => setDeliveryModeOpen((v) => !v)}
        onExport={handleExport}
        exporting={exporting}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Course
                </th>
                <th className="text-[11px] truncate font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Instructor / Institution
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Category
                </th>
                <th className="text-[11px] truncate font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Delivery Mode
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Submitted
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-[13px] text-(--gray-400)"
                  >
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading pending courses…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-[13px] text-red-500"
                  >
                    Failed to load pending courses. Please try again.
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-[13px] text-(--gray-400)"
                  >
                    No courses awaiting review.
                  </td>
                </tr>
              ) : (
                filteredRows.map((c) => {
                  const busy =
                    review.isPending && review.variables?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-(--gray-50) transition-colors"
                    >
                      <td className="py-3 pr-8">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                            {initialsOf(c.title)}
                          </div>
                          <p className="text-[13px] font-semibold text-(--text-title) truncate">
                            {c.title}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 pr-8 text-[13px] text-(--gray-600) truncate">
                        {ownerLabel(c)}
                      </td>
                      <td className="py-3 pr-8 text-[12px] text-(--gray-500) truncate">
                        {c.category?.name ?? "—"}
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
                        <ApprovalActionsMenu
                          busy={busy}
                          onApprove={() => handleApprove(c)}
                          onReject={() => setRejectTarget(c)}
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
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}{" "}
            pending courses
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {rejectTarget && (
        <RejectModal
          courseTitle={rejectTarget.title}
          submitting={
            review.isPending && review.variables?.id === rejectTarget.id
          }
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
