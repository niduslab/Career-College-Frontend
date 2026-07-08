"use client";

import { useMemo, useState } from "react";
import { Check, X, Eye } from "lucide-react";
import ApprovalsFilterBar from "./filter-bar";
import { Pagination } from "@/components/common/pagination";
import { APPROVALS, ApprovalStatus } from "./data";

const PAGE_SIZE = 6;

const STATUS_BADGE: Record<ApprovalStatus, string> = {
  "Auto-approved": "bg-emerald-50 text-emerald-600",
  Flagged: "bg-orange-50 text-orange-500",
  Pending: "bg-blue-50 text-blue-600",
  Rejected: "bg-red-50 text-red-500",
};

function scoreColor(score: number) {
  if (score === 0) return "bg-(--gray-100) text-(--gray-400)";
  if (score >= 75) return "bg-emerald-50 text-emerald-600";
  if (score >= 50) return "bg-orange-50 text-orange-600";
  return "bg-red-50 text-red-500";
}

export default function ApprovalsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApprovalStatus | "All">("All");
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [decisions, setDecisions] = useState<Record<string, ApprovalStatus>>(
    {},
  );

  const rows = useMemo(
    () => APPROVALS.map((a) => ({ ...a, status: decisions[a.id] ?? a.status })),
    [decisions],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((a) => {
      const matchesSearch =
        !q ||
        a.course.toLowerCase().includes(q) ||
        a.instructor.toLowerCase().includes(q);
      const matchesStatus = status === "All" || a.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updateAndResetPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const decide = (id: string, next: ApprovalStatus) => {
    setDecisions((prev) => ({ ...prev, [id]: next }));
  };

  return (
    <div className="space-y-4">
      <ApprovalsFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        status={status}
        onStatusChange={(v) => {
          updateAndResetPage(setStatus)(v);
          setStatusOpen(false);
        }}
        statusOpen={statusOpen}
        onStatusToggle={() => setStatusOpen((v) => !v)}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-190 border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                  Course
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                  Instructor
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  AI Score
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                  Flagged Issue
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                  Status
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                  Submitted
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {pageRows.map((a) => {
                const actionable =
                  a.status === "Flagged" || a.status === "Pending";
                return (
                  <tr
                    key={a.id}
                    className="hover:bg-(--gray-50) transition-colors"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                          {a.initials}
                        </div>
                        <p className="text-[13px] font-semibold text-(--text-title) truncate">
                          {a.course}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-[13px] text-(--gray-600) truncate">
                      {a.instructor}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <span
                        className={`inline-block text-[12px] font-semibold px-2.5 py-1 rounded-full ${scoreColor(a.score)}`}
                      >
                        {a.score > 0 ? a.score : "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-[12px] text-(--gray-500) truncate">
                      {a.issue}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-block text-[11px] font-semibold  px-2.5 py-1 rounded-full ${STATUS_BADGE[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-[13px] text-(--gray-600) whitespace-nowrap">
                      {a.submitted}
                    </td>
                    <td className="py-3 text-right">
                      {actionable ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => decide(a.id, "Auto-approved")}
                            title="Approve"
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => decide(a.id, "Rejected")}
                            title="Reject"
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end">
                          <button
                            title="View details"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-[13px] text-(--gray-400)"
                  >
                    No submissions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-(--gray-100)">
          <p className="text-[12px] text-(--gray-400)">
            Showing{" "}
            {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} submissions
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
