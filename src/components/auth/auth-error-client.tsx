"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

/**
 * Where the backend sends us when social sign-in fails before it ever reaches
 * our callback — a cancelled consent screen, or a provider-side error.
 */
export function AuthErrorClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--gray-100) px-4">
      <div className="w-full max-w-md rounded-lg border border-(--gray-200) bg-(--text-white) p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h1 className="sg-h4 mb-2 text-(--text-title)">Sign-in failed</h1>
        <p className="sg-p-default mb-6 text-(--gray-500)">
          {error || "Something went wrong while signing you in."}
        </p>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-(--primary-700) font-semibold text-white transition-colors"
        >
          Back to log in
        </Link>
      </div>
    </div>
  );
}
