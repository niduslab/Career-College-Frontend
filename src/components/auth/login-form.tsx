"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import type { LoginFormData } from "@/types/auth";
import { login, dashboardPathFor, googleSignInUrl } from "@/lib/auth-api";
import { rememberGoogleUserType } from "@/lib/google-auth-intent";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { validateEmail, validateRequired } from "@/lib/validation";

export function LoginForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Signing in never creates an account here — the role only matters when
  // Google hands back someone we've never seen, and learner is the safe default.
  const handleGoogle = () => {
    rememberGoogleUserType("learner");
    // Full page navigation: this leaves the SPA for Google's consent screen.
    window.location.href = googleSignInUrl("learner");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    const passwordError = validateRequired(formData.password, "Password");
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const user = await login(formData.email, formData.password);
      notify.success("Logged in successfully.");
      router.push(dashboardPathFor(user));
    } catch (err) {
      if (err instanceof ApiError) {
        // Only email/password map to inputs; anything else (e.g.
        // `non_field_errors` for invalid credentials) is form-level.
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        for (const key of ["email", "password"] as const) {
          if (err.fieldErrors[key]) fieldErrors[key] = err.fieldErrors[key];
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        }
        if (err.status === 0) {
          // Network/connectivity failure — keep as toast.
          notify.error(err.detail);
        } else if (Object.keys(fieldErrors).length === 0) {
          // Invalid credentials (or other non-field auth error) — show on form.
          setFormError(err.detail);
        }
      } else {
        notify.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setFormError("");
  };

  return (
    <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
      <h2 className="sg-h4 font-semibold text-(--text-title) mb-2">
        Welcome Back
      </h2>
      <p className="sg-p-default text-(--gray-600) mb-6">
        Log in to continue your learning journey
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 sg-caption text-red-600"
          >
            {formError}
          </div>
        )}

        {/* Email */}
        <div>
          <Label
            htmlFor="email"
            className="sg-p-default font-semibold  text-(--text-title) mb-2"
          >
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Enter your email"
            className="mt-2 w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-600 sg-caption mt-1.5">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label
            htmlFor="password"
            className="sg-p-default font-semibold  text-(--text-title) mb-2"
          >
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-(--gray-500) hover:text-(--text-title) transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={2} />
              ) : (
                <Eye size={18} strokeWidth={2} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 sg-caption mt-1.5">{errors.password}</p>
          )}
        </div>

        <div className="flex items-end justify-end sg-p-small">
          <Link
            href="/forgot-password"
            className="text-(--primary-700) hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer  transition-colors flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Logging in…" : "Log In"}
        </Button>
      </form>

      <SocialAuthButtons onGoogleClick={handleGoogle} />

      <p className="text-left sg-p-default text-(--gray-500)">
        Don&lsquo;t have an account?{" "}
        <Link
          href="/signup"
          className="text-(--primary-700) hover:underline font-semibold"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
