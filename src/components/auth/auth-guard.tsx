"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  fetchMe,
  fetchAdminSession,
  dashboardPathFor,
  isAdminUser,
  type AuthUser,
} from "@/lib/auth-api";
import { notify } from "@/lib/toast";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Restrict to a specific user type, or any of several. */
  requireRole?: AuthUser["user_type"] | AuthUser["user_type"][];
  adminOnly?: boolean;
}

type Status = "checking" | "authorized";

export function AuthGuard({
  children,
  requireRole,
  adminOnly,
}: AuthGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;

    const redirect = (path: string) => {
      setTimeout(() => {
        if (active) router.replace(path);
      }, 0);
    };

    const check = adminOnly ? fetchAdminSession() : fetchMe();

    check.then((user) => {
      if (!active) return;

      if (!user) {
        notify.error("Please log in to continue.");
        redirect("/login");
        return;
      }

      if (adminOnly && !isAdminUser(user)) {
        redirect(dashboardPathFor(user));
        return;
      }

      const allowedRoles = Array.isArray(requireRole)
        ? requireRole
        : requireRole
          ? [requireRole]
          : null;
      if (
        allowedRoles &&
        !isAdminUser(user) &&
        !allowedRoles.includes(user.user_type)
      ) {
        redirect(dashboardPathFor(user));
        return;
      }

      setStatus("authorized");
    });

    return () => {
      active = false;
    };
  }, [router, requireRole, adminOnly]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--gray-100) text-(--gray-500)">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Checking your session…
      </div>
    );
  }

  return <>{children}</>;
}
