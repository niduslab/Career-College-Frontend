import { Suspense } from "react";
import { AuthErrorClient } from "@/components/auth/auth-error-client";

// `useSearchParams()` needs a Suspense boundary or the build fails.
export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorClient />
    </Suspense>
  );
}
