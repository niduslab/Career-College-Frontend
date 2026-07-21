"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import UsersFilterBar from "./filter-bar";
import RowActionsMenu from "./row-actions-menu";
import { Pagination } from "@/components/common/pagination";
import { useAdminUsers } from "@/hooks/use-admin-users";
import {
  ROLE_TO_USER_TYPE,
  toPlatformUser,
  UserRole,
  UserStatus,
} from "./data";
import {
  listAllAdminUsers,
  type ListAdminUsersParams,
} from "@/lib/admin-console-api";
import { toCsv, downloadTextFile } from "@/lib/export-csv";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";

const PAGE_SIZE = 10;

const ROLE_BADGE: Record<UserRole, string> = {
  Student: "bg-blue-50 text-blue-600",
  Instructor: "bg-purple-50 text-purple-600",
  Partner: "bg-orange-50 text-orange-500",
  Admin: "bg-(--primary-50) text-(--primary-600)",
};

const STATUS_BADGE: Record<UserStatus, string> = {
  Active: "bg-emerald-50 text-emerald-600",
  Suspended: "bg-red-50 text-red-500",
};

/** Debounce a fast-changing value so search doesn't refetch on every keystroke. */
function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function UsersTable() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "All">("All");
  const [status, setStatus] = useState<UserStatus | "All">("All");
  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const menuRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const debouncedSearch = useDebounced(search, 350);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenuId === null) return;
      const target = e.target as Node;
      const el = menuRefs.current.get(openMenuId);
      const insideWrapper = el?.contains(target) ?? false;
      const insidePortal = !!(target as HTMLElement).closest?.(
        "[data-action-portal]",
      );
      if (!insideWrapper && !insidePortal) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const queryParams: ListAdminUsersParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      user_type: role === "All" ? undefined : ROLE_TO_USER_TYPE[role],
      is_restricted_by_admin:
        status === "All" ? undefined : status === "Suspended",
      sort: "-registration_date",
      page,
      page_size: PAGE_SIZE,
    }),
    [debouncedSearch, role, status, page],
  );

  const { data, isLoading, isError, isFetching } = useAdminUsers(queryParams);

  const rows = (data?.results ?? []).map(toPlatformUser);
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const updateAndResetPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const handleExport = async () => {
    setExporting(true);
    try {
      const all = await listAllAdminUsers({
        search: queryParams.search,
        user_type: queryParams.user_type,
        is_restricted_by_admin: queryParams.is_restricted_by_admin,
        sort: queryParams.sort,
      });
      if (all.length === 0) {
        notify.error("No users match the current filters.");
        return;
      }
      const csv = toCsv(all.map(toPlatformUser), [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status" },
        { key: "joined", label: "Joined" },
        { key: "isEmailVerified", label: "Email Verified" },
      ]);
      const date = new Date().toISOString().slice(0, 10);
      downloadTextFile(`users-export-${date}.csv`, csv);
      notify.success(
        `Exported ${all.length} user${all.length === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.detail : "Failed to export users.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <UsersFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        role={role}
        onRoleChange={(v) => {
          updateAndResetPage(setRole)(v);
          setRoleOpen(false);
        }}
        status={status}
        onStatusChange={(v) => {
          updateAndResetPage(setStatus)(v);
          setStatusOpen(false);
        }}
        roleOpen={roleOpen}
        onRoleToggle={() => {
          setRoleOpen((v) => !v);
          setStatusOpen(false);
        }}
        statusOpen={statusOpen}
        onStatusToggle={() => {
          setStatusOpen((v) => !v);
          setRoleOpen(false);
        }}
        onExport={handleExport}
        exporting={exporting}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  User
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                  Role
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
                  <td
                    colSpan={5}
                    className="py-10 text-center text-[13px] text-(--gray-400)"
                  >
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading users…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-[13px] text-red-500"
                  >
                    Failed to load users. Please try again.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-[13px] text-(--gray-400)"
                  >
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-(--gray-50) transition-colors"
                  >
                    <td className="py-3 pr-8">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                          {u.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-(--text-title) truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-(--gray-400) truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-8">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role]}`}
                      >
                        {u.role}
                      </span>
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
                        onToggle={() =>
                          setOpenMenuId(openMenuId === u.id ? null : u.id)
                        }
                        setRef={(el) => menuRefs.current.set(u.id, el)}
                      />
                    </td>
                  </tr>
                ))
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
            users
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
