"use client";

import { useMemo, useState } from "react";
import { Loader2, History } from "lucide-react";
import ActionBadge from "./action-badge";
import AuditLogFilterBar from "./filter-bar";
import { Pagination } from "@/components/common/pagination";
import { useAuditLog } from "@/hooks/use-admin-audit-log";
import type { AdminActionType } from "@/lib/admin-console-api";

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminAuditLogContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<AdminActionType | "All">("All");
  const [actionOpen, setActionOpen] = useState(false);

  const { data, isLoading, isError, isFetching } = useAuditLog({
    page,
    page_size: PAGE_SIZE,
    action: action === "All" ? undefined : action,
  });

  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const filtered = useMemo(() => {
    const entries = data?.results ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.actor?.full_name.toLowerCase().includes(q) ||
        e.actor?.email.toLowerCase().includes(q) ||
        e.target_user?.full_name.toLowerCase().includes(q) ||
        e.target_user?.email.toLowerCase().includes(q),
    );
  }, [data?.results, search]);

  const handleActionChange = (v: AdminActionType | "All") => {
    setAction(v);
    setActionOpen(false);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <AuditLogFilterBar
        search={search}
        onSearchChange={setSearch}
        action={action}
        onActionChange={handleActionChange}
        actionOpen={actionOpen}
        onActionToggle={() => setActionOpen((v) => !v)}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-(--gray-400)">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-[13px] text-red-500 text-center py-8">
            Failed to load audit log.
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-(--gray-400)">
            <History className="w-8 h-8" />
            <p className="text-[13px]">No audit log entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-(--gray-100)">
                  <th className="text-left text-[12px] font-medium text-(--gray-500) pb-3 pr-8">
                    Actor
                  </th>
                  <th className="text-left text-[12px] font-medium text-(--gray-500) pb-3 pr-8">
                    Target User
                  </th>
                  <th className="text-left text-[12px] font-medium text-(--gray-500) pb-3 pr-8">
                    Reason
                  </th>
                  <th className="text-left text-[12px] font-medium text-(--gray-500) pb-3">
                    Timestamp
                  </th>
                  <th className="text-left text-[12px] font-medium text-(--gray-500) pb-3 pr-8">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-(--gray-50) last:border-0"
                  >
                    <td className="py-3 pr-8">
                      {entry.actor ? (
                        <div>
                          <p className="text-[13px] font-medium text-(--text-title)">
                            {entry.actor.full_name}
                          </p>
                          <p className="text-[12px] text-(--gray-400)">
                            {entry.actor.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[13px] text-(--gray-400)">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-8">
                      {entry.target_user ? (
                        <div>
                          <p className="text-[13px] font-medium text-(--text-title)">
                            {entry.target_user.full_name}
                          </p>
                          <p className="text-[12px] text-(--gray-400)">
                            {entry.target_user.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[13px] text-(--gray-400)">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-8 max-w-70">
                      <p
                        className="text-[13px] text-(--gray-600) truncate"
                        title={entry.reason}
                      >
                        {entry.reason || "—"}
                      </p>
                    </td>
                    <td className="py-3">
                      <p className="text-[13px] text-(--gray-500) whitespace-nowrap">
                        {formatDate(entry.created_at)}
                      </p>
                    </td>
                    <td className="py-3 pr-8">
                      <ActionBadge action={entry.action} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-(--gray-100)">
            <p className="text-[12px] text-(--gray-400)">
              {isFetching && "Refreshing… · "}
              Showing {(currentPage - 1) * PAGE_SIZE + 1}
              {"–"}
              {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}{" "}
              entries
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
