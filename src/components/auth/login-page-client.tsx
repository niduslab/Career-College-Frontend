"use client";

import { useState } from "react";
import { AuthLayout } from "./auth-layout";
import { LoginForm } from "./login-form";
import type { UserType } from "@/types/auth";

export function LoginPageClient() {
  const [userType, setUserType] = useState<UserType>("learner");

  return (
    <AuthLayout userType={userType}>
      <LoginForm onUserTypeChange={setUserType} />
    </AuthLayout>
  );
}
