"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginFormData, UserType } from "@/types/auth";

interface LoginFormProps {
  onUserTypeChange?: (type: UserType) => void;
}

export function LoginForm({ onUserTypeChange }: LoginFormProps = {}) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    user_type: "learner",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Handle login
    console.log("Login data:", formData);
  };

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "user_type") onUserTypeChange?.(value as UserType);
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
        {/* User Type Selection */}
        <div>
          {/* <Label className="sg-p-default">I am a</Label> */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(
              ["learner", "instructor", "partner_institution"] as UserType[]
            ).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField("user_type", type)}
                className={` px-5 py-2 cursor-pointer h-10  rounded-md sg-p-default  whitespace-nowrap transition-all duration-200 ${
                  formData.user_type === type
                    ? "bg-(--primary-700) text-white font-semibold shadow-sm"
                    : "border border-gray-200 text-(--text-paragraph) bg-white"
                }`}
              >
                {type === "partner_institution"
                  ? "Institution"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

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
          className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer  transition-colors flex items-center justify-center gap-2 group"
        >
          Log In
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-(--gray-200)"></div>
        <span className="sg-p-small text-(--gray-500)">
          or continue with social
        </span>
        <div className="flex-1 h-px bg-(--gray-200)"></div>
      </div>

      {/* Social Auth Buttons */}
      <div className="space-y-3 mb-6">
        {/* Mobile & Tablet Layout - Stacked */}
        <div className="md:hidden space-y-3">
          <button
            type="button"
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-(--gray-300) bg-(--text-white) text-(--text-title) font-medium hover:bg-(--gray-50) transition-colors"
          >
            <FcGoogle size={20} />
            Google
          </button>
          <button
            type="button"
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-(--gray-300) bg-(--text-white) text-(--text-title) font-medium hover:bg-(--gray-50) transition-colors"
          >
            <FaLinkedin size={20} className="text-blue-600" />
            LinkedIn
          </button>
        </div>

        {/* Desktop & Large Devices - Inline */}
        <div className="hidden md:grid md:grid-cols-2 gap-3">
          <button
            type="button"
            className="h-11 flex items-center justify-center gap-2 rounded-lg border border-(--gray-300) bg-(--text-white) text-(--text-title) font-medium hover:bg-(--gray-50) transition-colors"
          >
            <FcGoogle size={20} />
            Google
          </button>
          <button
            type="button"
            className="h-11 flex items-center justify-center gap-2 rounded-lg border border-(--gray-300) bg-(--text-white) text-(--text-title) font-medium hover:bg-(--gray-50) transition-colors"
          >
            <FaLinkedin size={20} className="text-blue-600" />
            LinkedIn
          </button>
        </div>
      </div>

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
