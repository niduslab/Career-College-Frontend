"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, onAuthChange } from "./session";
import { logout as logoutApi, fetchMe } from "./auth-api";
import { notify } from "./toast";

const getClientSnapshot = () => isLoggedIn();
const getServerSnapshot = () => false;

export function useAuth() {
  const router = useRouter();

  const authed = useSyncExternalStore(
    onAuthChange,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (isLoggedIn()) {
      void fetchMe();
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    notify.success("Logged out.");
    router.push("/login");
  }, [router]);

  return { authed, logout };
}
