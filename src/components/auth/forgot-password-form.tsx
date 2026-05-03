"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
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

    // Handle forgot password submission
    console.log("Forgot password email:", formData.email);
    setSubmitted(true);
  };

  const updateEmail = (value: string) => {
    setFormData({ email: value });
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 rounded-full bg-(--primary-50) flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-(--primary-700)" />
          </div>
          <h2 className="sg-h4 font-semibold text-(--text-title) mb-2">
            Check Your Email
          </h2>
          <p className="sg-p-default text-(--gray-600) mb-2 max-w-sm">
            We&apos;ve sent a password reset link to
          </p>
          <p className="sg-p-default font-semibold text-(--text-title) mb-6">
            {formData.email}
          </p>
          <p className="sg-p-small text-(--gray-500) mb-8 max-w-sm">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-(--primary-700) hover:underline font-medium"
            >
              try again
            </button>
            .
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-(--primary-700) hover:underline sg-p-default font-medium"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
      <h2 className="sg-h4 font-semibold text-(--text-title) mb-2">
        Forgot Password?
      </h2>
      <p className="sg-p-default text-(--gray-600) mb-6">
        Enter your registered email and we&apos;ll send you a link to reset your
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
          className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          Reset Password
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
