"use client";

import { useState } from "react";
import { AuthLayout } from "./auth-layout";
import { SignUpForm } from "./signup-form";
import type { UserType } from "@/types/auth";

export function SignUpPageClient() {
  const [userType, setUserType] = useState<UserType>("learner");

  return (
    <AuthLayout userType={userType}>
      <SignUpForm onUserTypeChange={setUserType} />
    </AuthLayout>
  );
}
