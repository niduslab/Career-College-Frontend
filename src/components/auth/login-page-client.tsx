"use client";

import { AuthLayout } from "./auth-layout";
import { LoginForm } from "./login-form";

export function LoginPageClient() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
