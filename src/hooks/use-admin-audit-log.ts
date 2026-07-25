import { useQuery } from "@tanstack/react-query";
import { listAuditLog, type ListAuditLogParams } from "@/lib/admin-console-api";

export function useAuditLog(params: ListAuditLogParams) {
  return useQuery({
    queryKey: ["admin-audit-log", params],
    queryFn: () => listAuditLog(params),
    placeholderData: (previousData) => previousData,
  });
}
