"use client";

import { ArrowUpRight, Loader2, History } from "lucide-react";
import Link from "next/link";
import { useAuditLog } from "@/hooks/use-admin-audit-log";
import type { AdminActionType } from "@/lib/admin-console-api";

const TYPE_DOT: Record<AdminActionType, string> = {
  suspend: "bg-red-500",
  reactivate: "bg-emerald-500",
  role_change: "bg-(--primary-500)",
};

const ACTION_LABEL: Record<AdminActionType, string> = {
  suspend: "suspended",
  reactivate: "reactivated",
  role_change: "changed role of",
};

function formatTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminActivityFeed() {
  const { data, isLoading, isError } = useAuditLog({ page: 1, page_size: 6 });
  const entries = data?.results ?? [];

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
          Recent Activity
        </p>
        <Link
          href="/dashboard/admin/audit-log"
          className="text-[12px] text-(--primary-600) font-medium flex items-center gap-0.5 hover:underline"
        >
          View all <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-(--gray-400) flex-1">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-[13px] text-red-500 text-center py-8">Failed to load activity.</p>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-(--gray-400) flex-1">
          <History className="w-7 h-7" />
          <p className="text-[13px]">No recent admin actions.</p>
        </div>
      ) : (
        <ul className="space-y-4 flex-1">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3">
              <span
                className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${TYPE_DOT[entry.action]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-(--text-title) leading-snug">
                  <span className="font-semibold">
                    {entry.actor?.full_name ?? "System"}
                  </span>{" "}
                  <span className="text-(--gray-500)">{ACTION_LABEL[entry.action]}</span>{" "}
                  <span className="font-medium">
                    {entry.target_user?.full_name ?? "—"}
                  </span>
                </p>
                <p className="text-[11px] text-(--gray-400) mt-0.5">
                  {formatTime(entry.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
