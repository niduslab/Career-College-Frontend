import type { AdminActionType } from "@/lib/admin-console-api";

const map: Record<AdminActionType, string> = {
  suspend: "text-red-500 bg-red-50",
  reactivate: "text-emerald-600 bg-emerald-50",
  role_change: "text-(--primary-600) bg-(--primary-50)",
};

const LABEL: Record<AdminActionType, string> = {
  suspend: "Suspend",
  reactivate: "Reactivate",
  role_change: "Role Change",
};

export default function ActionBadge({ action }: { action: AdminActionType }) {
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${map[action]}`}>
      {LABEL[action]}
    </span>
  );
}
