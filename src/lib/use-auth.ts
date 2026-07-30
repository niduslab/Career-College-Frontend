"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, onAuthChange } from "./session";
import { logout as logoutApi, fetchMe, type AuthUser } from "./auth-api";
import { notify } from "./toast";

const getClientSnapshot = () => isLoggedIn();
const getServerSnapshot = () => false;

/**
 * `withUser: true` also fetches the current user via `/auth/profile/me/` —
 * only opt in on pages where that endpoint applies (learner/instructor/
 * partner_institution). It 404s for admin accounts (no profile row), so
 * admin-only surfaces must leave this off and get their own user data from
 * `fetchAdminSession()` instead.
 */
export function useAuth(options: { withUser?: boolean } = {}) {
  const { withUser = false } = options;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const authed = useSyncExternalStore(
    onAuthChange,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!authed || !withUser) return;

    let active = true;
    fetchMe().then((me) => {
      if (active) setUser(me);
    });

    return () => {
      active = false;
    };
  }, [authed, withUser]);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    notify.success("Logged out.");
    router.push("/login");
  }, [router]);

  return { authed, user: authed ? user : null, logout };
}
