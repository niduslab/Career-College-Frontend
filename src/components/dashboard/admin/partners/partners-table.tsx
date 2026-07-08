"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PartnersFilterBar from "./filter-bar";
import RowActionsMenu from "./row-actions-menu";
import { Pagination } from "@/components/common/pagination";
import { PARTNERS, PartnerStatus, PartnerType } from "./data";

const PAGE_SIZE = 6;

const STATUS_BADGE: Record<PartnerStatus, string> = {
  Active: "bg-emerald-50 text-emerald-600",
  Pending: "bg-blue-50 text-blue-600",
  Inactive: "bg-(--gray-100) text-(--gray-500)",
};

const TYPE_BADGE: Record<PartnerType, string> = {
  University: "bg-purple-50 text-purple-600",
  Corporate: "bg-(--primary-50) text-(--primary-600)",
  NGO: "bg-orange-50 text-orange-500",
};

export default function PartnersTable() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<PartnerType | "All">("All");
  const [status, setStatus] = useState<PartnerStatus | "All">("All");
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PARTNERS.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.contact.toLowerCase().includes(q);
      const matchesType = type === "All" || p.type === type;
      const matchesStatus = status === "All" || p.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, type, status]);

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

  return (
    <div className="space-y-4">
      <PartnersFilterBar
        search={search}
        onSearchChange={updateAndResetPage(setSearch)}
        type={type}
        onTypeChange={(v) => {
          updateAndResetPage(setType)(v);
          setTypeOpen(false);
        }}
        status={status}
        onStatusChange={(v) => {
          updateAndResetPage(setStatus)(v);
          setStatusOpen(false);
        }}
        typeOpen={typeOpen}
        onTypeToggle={() => {
          setTypeOpen((v) => !v);
          setStatusOpen(false);
        }}
        statusOpen={statusOpen}
        onStatusToggle={() => {
          setStatusOpen((v) => !v);
          setTypeOpen(false);
        }}
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-190 border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                  Partner
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                  Contact
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                  Type
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  Programs
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  Students
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2 pr-6">
                  Revenue
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2 pl-3">
                  Status
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {pageRows.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-(--gray-50) transition-colors"
                >
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                        {p.initials}
                      </div>
                      <p className="text-[13px] font-semibold text-(--text-title) truncate">
                        {p.name}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-[13px] text-(--gray-600) truncate">
                    {p.contact}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${TYPE_BADGE[p.type]}`}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-[13px] text-(--gray-600) text-right">
                    {p.programs > 0 ? p.programs : "—"}
                  </td>
                  <td className="py-3 pr-6 text-[13px] text-(--gray-600) text-right">
                    {p.students > 0 ? p.students.toLocaleString() : "—"}
                  </td>
                  <td className="py-3 pr-6 text-[13px] text-(--text-title) text-right font-medium">
                    {p.revenue}
                  </td>
                  <td className="py-3 pl-3 pr-3">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <RowActionsMenu
                      partner={p}
                      open={openMenuId === p.id}
                      onToggle={() =>
                        setOpenMenuId(openMenuId === p.id ? null : p.id)
                      }
                      setRef={(el) => menuRefs.current.set(p.id, el)}
                      onView={(partner) => console.log("view", partner.id)}
                      onApprove={(partner) =>
                        console.log("approve", partner.id)
                      }
                      onToggleSuspend={(partner) =>
                        console.log("toggle-suspend", partner.id)
                      }
                      onDelete={(partner) => console.log("delete", partner.id)}
                    />
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-[13px] text-(--gray-400)"
                  >
                    No partners match your filters.
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
            {filtered.length} partners
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
