"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, ChevronLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface ResetPasswordFormData {
  password: string;
  confirm_password: string;
}

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<ResetPasswordFormData> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!PASSWORD_RULES.every((r) => r.test(formData.password))) {
      newErrors.password = "Password does not meet requirements";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!email || !token) {
      notify.error(
        "Your reset session is invalid or expired. Please restart the password reset.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({
        email,
        reset_token: token,
        new_password: formData.password,
        confirm_password: formData.confirm_password,
      });
      notify.success("Password reset successfully.");
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors: Partial<ResetPasswordFormData> = {};
        if (err.fieldErrors.new_password) {
          fieldErrors.password = err.fieldErrors.new_password;
        }
        if (err.fieldErrors.confirm_password) {
          fieldErrors.confirm_password = err.fieldErrors.confirm_password;
        }
        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
        notify.error(err.detail);
      } else {
        notify.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof ResetPasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (submitted) {
    return (
      <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-(--primary-50) flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-(--primary-700)" />
          </div>
          <h2 className="sg-h4 font-semibold text-(--text-title) mb-2">
            Password Reset!
          </h2>
          <p className="sg-p-default text-(--gray-600) mb-8 max-w-sm">
            Your password has been successfully reset. You can now log in with
            your new password.
          </p>
          <Link
            href="/login"
            className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer transition-colors flex items-center justify-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
      <h2 className="sg-h4 font-semibold text-(--text-title) mb-2">
        Reset Password
      </h2>
      <p className="sg-p-default text-(--gray-600) mb-6">
        Create a strong new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <Label
            htmlFor="password"
            className="sg-p-default font-semibold text-(--text-title) mb-2"
          >
            New Password
          </Label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Create a new password"
              className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
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

          {/* Password strength checklist */}
          {formData.password && (
            <ul className="mt-3 space-y-1.5">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(formData.password);
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 sg-caption transition-colors ${
                      passed ? "text-green-600" : "text-(--gray-400)"
                    }`}
                  >
                    <CheckCircle
                      size={13}
                      className={passed ? "opacity-100" : "opacity-30"}
                    />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label
            htmlFor="confirm_password"
            className="sg-p-default font-semibold text-(--text-title) mb-2"
          >
            Confirm Password
          </Label>
          <div className="relative mt-2">
            <Input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              value={formData.confirm_password}
              onChange={(e) => updateField("confirm_password", e.target.value)}
              placeholder="Confirm your new password"
              className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-(--gray-500) hover:text-(--text-title) transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff size={18} strokeWidth={2} />
              ) : (
                <Eye size={18} strokeWidth={2} />
              )}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-red-600 sg-caption mt-1.5">
              {errors.confirm_password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Resetting…" : "Reset Password"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/verify-otp"
          className="inline-flex items-center gap-2 sg-p-default text-(--gray-500) hover:text-(--text-title) transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </Link>
      </div>
    </div>
  );
}
