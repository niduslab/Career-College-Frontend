"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import UsersFilterBar from "./filter-bar";
import RowActionsMenu from "./row-actions-menu";
import { Pagination } from "@/components/common/pagination";
import { USERS, UserRole, UserStatus } from "./data";

const PAGE_SIZE = 6;

const ROLE_BADGE: Record<UserRole, string> = {
  Student: "bg-blue-50 text-blue-600",
  Instructor: "bg-purple-50 text-purple-600",
  Admin: "bg-(--primary-50) text-(--primary-600)",
};

const STATUS_BADGE: Record<UserStatus, string> = {
  Active: "bg-emerald-50 text-emerald-600",
  Inactive: "bg-(--gray-100) text-(--gray-500)",
  Suspended: "bg-red-50 text-red-500",
};

export default function UsersTable() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "All">("All");
  const [status, setStatus] = useState<UserStatus | "All">("All");
  const [roleOpen, setRoleOpen] = useState(false);
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
      const insidePortal = !!(target as HTMLElement).closest?.("[data-action-portal]");
      if (!insideWrapper && !insidePortal) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return USERS.filter((u) => {
      const matchesSearch =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = role === "All" || u.role === role;
      const matchesStatus = status === "All" || u.status === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, role, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updateAndResetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
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
      />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-175 border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">User</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Role</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Status</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Joined</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">Last Active</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">Courses</th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-right pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {pageRows.map((u) => (
                <tr key={u.id} className="hover:bg-(--gray-50) transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full shrink-0 bg-(--primary-50) text-(--primary-600) flex items-center justify-center text-[11px] font-semibold">
                        {u.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-(--text-title) truncate">{u.name}</p>
                        <p className="text-[11px] text-(--gray-400) truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-[13px] text-(--gray-600) whitespace-nowrap">{u.joined}</td>
                  <td className="py-3 pr-3 text-[13px] text-(--gray-600) whitespace-nowrap">{u.lastActive}</td>
                  <td className="py-3 pr-3 text-[13px] text-(--text-title) text-right font-medium">{u.courses}</td>
                  <td className="py-3 text-right">
                    <RowActionsMenu
                      user={u}
                      open={openMenuId === u.id}
                      onToggle={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                      setRef={(el) => menuRefs.current.set(u.id, el)}
                      onView={(user) => console.log("view", user.id)}
                      onEdit={(user) => console.log("edit", user.id)}
                      onToggleSuspend={(user) => console.log("toggle-suspend", user.id)}
                      onDelete={(user) => console.log("delete", user.id)}
                    />
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[13px] text-(--gray-400)">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-(--gray-100)">
          <p className="text-[12px] text-(--gray-400)">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} users
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
