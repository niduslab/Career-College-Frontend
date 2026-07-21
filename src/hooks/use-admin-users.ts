import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAdminUsers,
  getAdminUser,
  suspendUser,
  reactivateUser,
  changeUserRole,
  type ListAdminUsersParams,
  type AdminUserType,
} from "@/lib/admin-console-api";

/** Paginated, filtered admin user list — params drive the query key. */
export function useAdminUsers(params: ListAdminUsersParams) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => listAdminUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Full detail for one account (View profile page). */
export function useAdminUser(id: number | undefined) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => getAdminUser(id as number),
    enabled: id !== undefined,
  });
}

/** Suspend a user. Invalidates the list so the row reflects the new status. */
export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user"] });
    },
  });
}

/** Lift a suspension. */
export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user"] });
    },
  });
}

/** Change a user's role (user_type) and/or grant/revoke admin (is_staff). */
export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      user_type,
      is_staff,
    }: {
      id: number;
      user_type?: AdminUserType;
      is_staff?: boolean;
    }) => changeUserRole(id, { user_type, is_staff }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user"] });
    },
  });
}
