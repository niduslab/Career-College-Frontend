import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMyWebinars,
  getWebinarCatalog,
  getWebinarDetail,
  registerForWebinar,
  type WebinarCatalogParams,
} from "@/lib/webinars-api";

/** Public webinar catalog. */
export function useWebinarCatalog(params: WebinarCatalogParams = {}) {
  return useQuery({
    queryKey: ["webinar-catalog", params],
    queryFn: () => getWebinarCatalog(params),
    placeholderData: (previousData) => previousData,
  });
}

/** The caller's own registrations — the only source of `meeting_url`. */
export function useMyWebinars() {
  return useQuery({
    queryKey: ["my-webinars"],
    queryFn: getMyWebinars,
  });
}

export function useWebinarDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["webinar", slug],
    queryFn: () => getWebinarDetail(slug as string),
    enabled: !!slug,
  });
}

/** Register for a free webinar. Not optimistic — registration can legitimately
 *  fail on capacity or price, so the button shows a pending state instead. */
export function useRegisterForWebinar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => registerForWebinar(slug),
    onSuccess: (_data, slug) => {
      queryClient.invalidateQueries({ queryKey: ["my-webinars"] });
      queryClient.invalidateQueries({ queryKey: ["webinar-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["webinar", slug] });
    },
  });
}
