import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export default function VerifyOtpPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <VerifyOtpForm />
      </Suspense>
    </AuthLayout>
  );
}
