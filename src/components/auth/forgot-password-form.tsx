"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/auth-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<ForgotPasswordFormData> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(formData.email);
      notify.success("We've sent a reset code to your email.");
      router.push(
        `/verify-otp?email=${encodeURIComponent(formData.email)}&purpose=password_reset`,
      );
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.email) {
          setErrors({ email: err.fieldErrors.email });
        }
        notify.error(err.message);
      } else {
        notify.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateEmail = (value: string) => {
    setFormData({ email: value });
    setErrors({});
  };

  return (
    <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
      <h2 className="sg-h4 font-semibold text-(--text-title) mb-2">
        Forgot Password?
      </h2>
      <p className="sg-p-default text-(--gray-600) mb-6">
        Enter your registered email and we&apos;ll send you a code to reset your
        password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label
            htmlFor="email"
            className="sg-p-default font-semibold text-(--text-title) mb-2"
          >
            Email Address
          </Label>
          <div className="relative mt-2">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full h-12 px-4 py-3 pl-11 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
            />
            <Mail
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--gray-400) pointer-events-none"
            />
          </div>
          {errors.email && (
            <p className="text-red-600 sg-caption mt-1.5">{errors.email}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending…" : "Send Reset Code"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 sg-p-default text-(--gray-500) hover:text-(--text-title) transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
