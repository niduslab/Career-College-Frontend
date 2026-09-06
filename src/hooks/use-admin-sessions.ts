import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAdminSessions,
  revokeAdminSession,
  revokeOtherAdminSessions,
} from "@/lib/admin-console-api";

export function useAdminSessions() {
  return useQuery({
    queryKey: ["admin-sessions"],
    queryFn: listAdminSessions,
  });
}

export function useRevokeAdminSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => revokeAdminSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });
}

export function useRevokeOtherAdminSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeOtherAdminSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });
}
