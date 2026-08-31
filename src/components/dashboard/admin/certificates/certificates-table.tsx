"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Pagination } from "@/components/common/pagination";
import { FilterDropdown } from "@/components/common/filter-dropdown";
import ConfirmModal from "@/components/common/confirm-modal";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type {
  AdminCertificate,
  CertificateStatus,
  ListAdminCertificatesParams,
} from "@/lib/certificates-api";
import {
  useAdminCertificates,
  useRestoreCertificate,
  useRevokeCertificate,
} from "@/hooks/use-admin-certificates";
import StatusBadge from "./status-badge";
import RevokeModal from "./revoke-modal";
import RowActionsMenu from "./row-actions-menu";

const PAGE_SIZE = 10;

type StatusFilter = "All" | CertificateStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "All", label: "All statuses" },
  { value: "valid", label: "Valid" },
  { value: "revoked", label: "Revoked" },
];

/** Local debounce — the same inline helper the users table uses; there is no
 *  shared hook for this in the codebase. */
function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** Pinned locale + UTC so a credential date reads the same for every admin. */
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function CertificatesTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{
    row: AdminCertificate;
    kind: "revoke" | "restore";
  } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const debouncedSearch = useDebounced(search, 350);

  // Close the open row menu on an outside click. The menu itself renders in a
  // portal, so its own node is checked separately via [data-action-portal].
  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const wrapper = menuRefs.current.get(openMenuId);
      if (wrapper?.contains(target)) return;
      if ((target as HTMLElement).closest?.("[data-action-portal]")) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const queryParams: ListAdminCertificatesParams = useMemo(
    () => ({
      // Backend ignores a search under 2 characters; sending it anyway keeps
      // the client dumb about that rule.
      search: debouncedSearch.trim() || undefined,
      status: status === "All" ? undefined : status,
      sort: "-issued_at",
      page,
      page_size: PAGE_SIZE,
    }),
    [debouncedSearch, status, page],
  );

  const { data, isLoading, isError, isFetching } =
    useAdminCertificates(queryParams);
  const revoke = useRevokeCertificate();
  const restore = useRestoreCertificate();

  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const busy = revoke.isPending || restore.isPending;

  function handleRevoke(reason: string) {
    if (!modal) return;
    const { row } = modal;
    revoke.mutate(
      { uid: row.certificate_uid, reason },
      {
        onSuccess: () => {
          notify.success(
            `${row.certificate_id ?? "Certificate"} revoked.`,
          );
          setModal(null);
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.detail : "Failed to revoke.",
          ),
      },
    );
  }

  function handleRestore() {
    if (!modal) return;
    const { row } = modal;
    restore.mutate(
      { uid: row.certificate_uid },
      {
        onSuccess: () => {
          notify.success(
            `${row.certificate_id ?? "Certificate"} restored.`,
          );
          setModal(null);
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.detail : "Failed to restore.",
          ),
      },
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      {/* Toolbar — search sizing matches the approvals filter bar. */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-(--gray-400) absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search certificates..."
            className="lg:w-62.5 w-full h-9 pl-9 pr-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
          />
        </div>
        <FilterDropdown
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          placeholder="Status"
          align="right"
        />
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-(--gray-100)">
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Certificate ID
              </th>
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Learner
              </th>
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Course
              </th>
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Issued
              </th>
              <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pr-8">
                Status
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
                  colSpan={6}
                  className="py-10 text-center text-[13px] text-(--gray-400)"
                >
                  <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                  Loading certificates…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-[13px] text-red-500"
                >
                  Failed to load certificates. Please try again.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-[13px] text-(--gray-400)"
                >
                  No certificates match your filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.certificate_uid}
                  className="hover:bg-(--gray-50) transition-colors"
                >
                  <td className="py-3 pr-8">
                    <span className="text-[12px] font-mono font-medium text-(--text-title)">
                      {row.certificate_id ?? "—"}
                    </span>
                    {row.status === "revoked" && row.revoked_reason ? (
                      <p
                        className="text-[11px] text-red-500 mt-0.5 max-w-56 truncate"
                        title={row.revoked_reason}
                      >
                        {row.revoked_reason}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-8 text-[13px] text-(--text-title)">
                    {row.learner_name}
                  </td>
                  <td className="py-3 pr-8 text-[13px] text-(--gray-600) max-w-56 truncate">
                    {row.course_title}
                  </td>
                  <td className="py-3 pr-8 text-[13px] text-(--gray-500) whitespace-nowrap">
                    {formatDate(row.issued_at)}
                  </td>
                  <td className="py-3 pr-8">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-3 text-right">
                    <RowActionsMenu
                      certificate={row}
                      open={openMenuId === row.certificate_uid}
                      busy={busy}
                      onToggle={() =>
                        setOpenMenuId((id) =>
                          id === row.certificate_uid ? null : row.certificate_uid,
                        )
                      }
                      setRef={(el) =>
                        menuRefs.current.set(row.certificate_uid, el)
                      }
                      onRevoke={() => setModal({ row, kind: "revoke" })}
                      onRestore={() => setModal({ row, kind: "restore" })}
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
          certificates
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

      {modal?.kind === "revoke" ? (
        <RevokeModal
          certificate={modal.row}
          submitting={revoke.isPending}
          onConfirm={handleRevoke}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal?.kind === "restore" ? (
        <ConfirmModal
          title="Restore certificate"
          message={
            <>
              Restore{" "}
              <span className="font-semibold text-(--text-title)">
                {modal.row.certificate_id ?? modal.row.certificate_uid}
              </span>
              ? Public verification will report it as valid again.
            </>
          }
          confirmLabel="Restore"
          confirmingLabel="Restoring…"
          submitting={restore.isPending}
          danger={false}
          onConfirm={handleRestore}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}