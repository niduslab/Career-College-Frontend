import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listAdminCertificates,
  restoreCertificate,
  revokeCertificate,
  type ListAdminCertificatesParams,
} from "@/lib/certificates-api";

/** Platform-wide certificate list for the admin console. */
export function useAdminCertificates(params: ListAdminCertificatesParams) {
  return useQuery({
    queryKey: ["admin-certificates", params],
    queryFn: () => listAdminCertificates(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useRevokeCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, reason }: { uid: string; reason: string }) =>
      revokeCertificate(uid, reason),
    // The learner's own list shows the same status, so refresh both.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
    },
  });
}

export function useRestoreCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid }: { uid: string }) => restoreCertificate(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
    },
  });
}