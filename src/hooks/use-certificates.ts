import { useQuery } from "@tanstack/react-query";

import {
  getMyCertificates,
  verifyCertificate,
  type CertificateListParams,
} from "@/lib/certificates-api";

/** The caller's own certificates, newest first. */
export function useMyCertificates(params: CertificateListParams = {}) {
  return useQuery({
    queryKey: ["my-certificates", params],
    queryFn: () => getMyCertificates(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Public certificate lookup by credential ID or UUID.
 *
 * `retry: false` — a 404 here means "no such certificate", a real answer to
 * show the visitor, not a transient failure worth retrying.
 */
export function useVerifyCertificate(identifier: string) {
  return useQuery({
    queryKey: ["verify-certificate", identifier],
    queryFn: () => verifyCertificate(identifier),
    enabled: Boolean(identifier),
    retry: false,
  });
}
