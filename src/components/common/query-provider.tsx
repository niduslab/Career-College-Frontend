"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onProfileUpdated } from "@/lib/profile-events";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // Lives for the whole session (unlike a page-scoped hook) so a profile
  // save is caught even when nothing consuming this cache is mounted yet.
  useEffect(() => {
    return onProfileUpdated(() => {
      client.invalidateQueries({
        queryKey: ["instructor-verification-status"],
      });
    });
  }, [client]);

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
