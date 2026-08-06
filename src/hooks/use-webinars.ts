import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWebinarCatalog,
  getCatalogWebinarDetail,
  registerForWebinar,
  getMyWebinars,
} from "@/lib/webinar-api";

/** Browse the public webinar catalog. */
export function useWebinarCatalog(params: {
  category?: string;
  upcoming?: boolean;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["webinar-catalog", params],
    queryFn: () => getWebinarCatalog(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Single published webinar's public catalog detail. */
export function useCatalogWebinarDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["catalog-webinar", slug],
    queryFn: () => getCatalogWebinarDetail(slug as string),
    enabled: !!slug,
  });
}

/** The caller's own active webinar registrations — used to mark catalog cards as registered. */
export function useMyWebinars() {
  return useQuery({
    queryKey: ["my-webinars"],
    queryFn: () => getMyWebinars(1, 100),
  });
}

/** Register for a free webinar. Paid webinars 422 — caller falls back to checkout. */
export function useRegisterForWebinar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (webinarSlug: string) => registerForWebinar(webinarSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webinar-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["my-webinars"] });
    },
  });
}
