import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { GoogleCallbackClient } from "@/components/auth/google-callback-client";

// `useSearchParams()` needs a Suspense boundary or the build fails.
export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-(--gray-100) text-(--gray-500)">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Signing you in…
        </div>
      }
    >
      <GoogleCallbackClient />
    </Suspense>
  );
}
