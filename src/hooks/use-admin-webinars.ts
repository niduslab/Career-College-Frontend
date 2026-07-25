import { useMutation } from "@tanstack/react-query";
import { archiveWebinar } from "@/lib/admin-webinars-api";

export function useArchiveWebinar() {
  return useMutation({
    mutationFn: (id: number) => archiveWebinar(id),
  });
}
