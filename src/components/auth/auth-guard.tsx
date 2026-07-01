"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { fetchMe, dashboardPathFor, type AuthUser } from "@/lib/auth-api";
import { notify } from "@/lib/toast";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Restrict to a specific user type. */
  requireRole?: AuthUser["user_type"];
  adminOnly?: boolean;
}

type Status = "checking" | "authorized";

/**
 * Protects a page from unauthenticated access. If the user is not logged in, or
 * does not have the required role, they will be redirected to the login page or
 * their own dashboard.
 */
export function AuthGuard({
  children,
  requireRole,
  adminOnly,
}: AuthGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;

    fetchMe().then((user) => {
      if (!active) return;

      if (!user) {
        notify.error("Please log in to continue.");
        router.replace("/login");
        return;
      }

      if (adminOnly && !user.is_staff) {
        router.replace(dashboardPathFor(user));
        return;
      }

      if (requireRole && !user.is_staff && user.user_type !== requireRole) {
        router.replace(dashboardPathFor(user));
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
