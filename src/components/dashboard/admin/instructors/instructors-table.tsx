"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import InstructorsFilterBar, {
  type InstructorStatus,
  type InstructorVerification,
} from "./filter-bar";
import RowActionsMenu from "@/components/dashboard/admin/users/row-actions-menu";
import { Pagination } from "@/components/common/pagination";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { toPlatformUser } from "@/components/dashboard/admin/users/data";
import type { ListAdminUsersParams } from "@/lib/admin-console-api";

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<InstructorStatus, string> = {
  Active: "bg-emerald-50 text-emerald-600",
  Suspended: "bg-red-50 text-red-500",
};

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function InstructorsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InstructorStatus | "All">("All");
  const [verification, setVerification] = useState<InstructorVerification | "All">("All");
  const [statusOpen, setStatusOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const debouncedSearch = useDebounced(search, 350);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenuId === null) return;
      const target = e.target as Node;
      const el = menuRefs.current.get(openMenuId);
      const insideWrapper = el?.contains(target) ?? false;
      const insidePortal = !!(target as HTMLElement).closest?.("[data-action-portal]");
      if (!insideWrapper && !insidePortal) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const queryParams: ListAdminUsersParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      user_type: "instructor",
      is_restricted_by_admin: status === "All" ? undefined : status === "Suspended",
      is_verified: verification === "All" ? undefined : verification === "Verified",
      sort: "-registration_date",
      page,
      page_size: PAGE_SIZE,
    }),
    [debouncedSearch, status, verification, page],
  );

  const { data, isLoading, isError, isFetching } = useAdminUsers(queryParams);

  const rawRows = data?.results ?? [];
  const rows = rawRows.map(toPlatformUser);
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const updateAndResetPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  return (
    <div className="space-y-4">
      <InstructorsFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        status={status}
        onStatusChange={(v) => {
          updateAndResetPage(setStatus)(v);
          setStatusOpen(false);
        }}
        verification={verification}
        onVerificationChange={(v) => {
          updateAndResetPage(setVerification)(v);
          setVerificationOpen(false);
        }}
        statusOpen={statusOpen}
        onStatusToggle={() => {
          setStatusOpen((v) => !v);
          setVerificationOpen(false);
        }}
        verificationOpen={verificationOpen}
        onVerificationToggle={() => {
          setVerificationOpen((v) => !v);
          setStatusOpen(false);
        }}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Instructor
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Verification
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Status
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Joined
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[13px] text-(--gray-400)">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading instructors…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[13px] text-red-500">
                    Failed to load instructors. Please try again.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[13px] text-(--gray-400)">
                    No instructors match your filters.
                  </td>
                </tr>
              ) : (
                rows.map((u, i) => {
                  const isVerified = rawRows[i]?.is_verified ?? false;
                  return (
                    <tr key={u.id} className="hover:bg-(--gray-50) transition-colors">
                      <td className="py-3 pr-8">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                            {u.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-(--text-title) truncate">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-(--gray-400) truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-8">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-(--gray-100) text-(--gray-500)">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-8">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[u.status]}`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 pr-8 text-[13px] text-(--gray-600) whitespace-nowrap">
                        {u.joined}
                      </td>
                      <td className="py-3 text-right">
                        <RowActionsMenu
                          user={u}
                          open={openMenuId === u.id}
                          onToggle={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                          setRef={(el) => menuRefs.current.set(u.id, el)}
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
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} instructors
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              setOpenMenuId(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
