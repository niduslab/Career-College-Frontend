import { useQuery } from "@tanstack/react-query";

import {
  getMyCertificates,
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
