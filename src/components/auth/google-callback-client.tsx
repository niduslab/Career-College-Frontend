"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  googleExchangeToken,
  dashboardPathFor,
  type GoogleUserType,
} from "@/lib/auth-api";
import { GOOGLE_USER_TYPE_KEY } from "@/lib/google-auth-intent";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

/**
 * Landing page for Google's redirect. The backend has already swapped its half
 * of the handshake and forwarded us the authorization code; we trade that for a
 * session (HttpOnly cookies, same as password login) and move on.
 */
export function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  // The code is single-use — a second exchange 400s, so guard against
  // StrictMode's double-invoke in development.
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    if (!code) {
      notify.error("Google sign-in failed. Please try again.");
      router.replace("/login");
      return;
    }

    // The role picked before we left the app; the backend defaults to learner.
    let userType: GoogleUserType = "learner";
    try {
      if (sessionStorage.getItem(GOOGLE_USER_TYPE_KEY) === "instructor") {
        userType = "instructor";
      }
      sessionStorage.removeItem(GOOGLE_USER_TYPE_KEY);
    } catch {
      // Private mode / blocked storage — fall back to learner.
    }

    googleExchangeToken(code, userType)
      .then((user) => {
        notify.success(
          user.is_new_user
            ? "Account created. Welcome to Career College!"
            : "Logged in successfully.",
        );
        router.replace(dashboardPathFor(user));
      })
      .catch((err) => {
        notify.error(
          err instanceof ApiError
            ? err.detail
            : "Google sign-in failed. Please try again.",
        );
        router.replace("/login");
      });
  }, [code, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--gray-100) text-(--gray-500)">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      Signing you in…
    </div>
  );
}
