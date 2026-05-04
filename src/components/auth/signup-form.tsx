"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SignUpFormData, UserType, InstitutionType } from "@/types/auth";

const INSTITUTION_TYPES = [
  "University",
  "College",
  "Technical Institute",
  "Online Academy",
];

interface SignUpFormProps {
  onUserTypeChange?: (type: UserType) => void;
}

export function SignUpForm({ onUserTypeChange }: SignUpFormProps = {}) {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    full_name: "",
    password: "",
    confirm_password: "",
    user_type: "learner",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Partial<Record<keyof SignUpFormData, string>> = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.full_name) newErrors.full_name = "Full name is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (formData.user_type === "partner_institution") {
      if (!formData.institution_name) {
        newErrors.institution_name = "Institution name is required";
      }
      if (!formData.institution_type) {
        newErrors.institution_type = "Institution type is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Handle signup
    console.log("Sign up data:", formData);
  };

  const updateField = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "user_type") onUserTypeChange?.(value as UserType);
  };

  const handleInstitutionSelect = (type: string) => {
    updateField("institution_type", type as InstitutionType);
    setShowInstitutionDropdown(false);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
      <h2 className="lg:sg-h4 sg-h5  font-semibold text-(--text-title) mb-2">
        Create Account
      </h2>
      <p className="sg-p-default text-(--text-paragraph) mb-6">
        Join as a learner, instructor, or institution
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Type Selection */}
        <div>
          <div className="grid grid-cols-3 gap-4 mt-2">
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

        {/* Full Name & Email - Two Columns */}
        <div className=" grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <Label
              htmlFor="full_name"
              className="sg-p-default font-semibold  text-(--text-title) mb-2"
            >
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              placeholder="Enter your full name"
              className="mt-2 w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
            />
            {errors.full_name && (
              <p className="text-red-600 sg-caption mt-1.5">
                {errors.full_name}
              </p>
            )}
          </div>

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
        </div>

        {/* Institution Fields - Only for partner_institution */}
        {formData.user_type === "partner_institution" && (
          <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
            <div>
              <Label
                htmlFor="institution_name"
                className="sg-p-default font-semibold  text-(--text-title) mb-2"
              >
                Institution Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="institution_name"
                type="text"
                value={formData.institution_name || ""}
                onChange={(e) =>
                  updateField("institution_name", e.target.value)
                }
                placeholder="Enter institution name"
                className="mt-2 w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
              />
              {errors.institution_name && (
                <p className="text-red-600 sg-caption mt-1.5">
                  {errors.institution_name}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="institution_type"
                className="sg-p-default font-semibold  text-(--text-title) mb-2"
              >
                Institution Type <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowInstitutionDropdown(!showInstitutionDropdown)
                  }
                  className="w-full  h-12 px-3 py-2 rounded-lg border border-(--gray-200) bg-(--text-white) text-(--gray-500) focus:outline-none focus:ring-2 focus:ring-(--primary-500) focus:border-transparent text-left flex items-center justify-between sg-p-default"
                >
                  <span>
                    {formData.institution_type || "Select institution type"}
                  </span>
                  <div className="text-(--gray-500) pointer-events-none">
                    {showInstitutionDropdown ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </button>

                {/* Dropdown */}
                {showInstitutionDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-(--text-white) border border-(--gray-300) rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {INSTITUTION_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleInstitutionSelect(type)}
                        className="w-full px-3 py-2.5 hover:bg-(--primary-50) transition-colors text-left border-b border-(--gray-200) last:border-b-0 sg-p-default text-(--text-title)"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.institution_type && (
                <p className="text-red-600 sg-caption mt-1.5">
                  {errors.institution_type}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Password & Confirm Password - Two Columns */}
        <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
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
                placeholder="Create a password"
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
              <p className="text-red-600 sg-caption mt-1.5">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="confirm_password"
              className="sg-p-default font-semibold  text-(--text-title) mb-2"
            >
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-2">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={(e) =>
                  updateField("confirm_password", e.target.value)
                }
                placeholder="Confirm your password"
                className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-(--gray-500) hover:text-(--text-title) transition-colors"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
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
        </div>
        <div className="flex items-center justify-between sg-p-small">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 mr-2 rounded-2xl cursor-pointer mt-0.5 border-(--gray-300)"
              style={{
                accentColor: "var(--primary-700)",
              }}
            />
            <span className="text-(--gray-600)">
              I agree with the{" "}
              <Link
                href="/terms"
                className="text-(--primary-700) hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-(--primary-700) hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>
        {/* Create Account Button */}
        <Button
          type="submit"
          className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer  transition-colors flex items-center justify-center gap-2 group"
        >
          Create Account
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
            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-(--gray-300) bg-(--text-white) text-(--text-title) font-medium hover:bg-(--gray-50) transition-colors"
          >
            <FcGoogle size={20} />
            Google
          </button>
          <button
            type="button"
            className="w-full h-12 cursor-pointer flex items-center justify-center gap-2 rounded-lg border border-(--gray-300) bg-(--text-white) text-(--text-title) font-medium hover:bg-(--gray-50) transition-colors"
          >
            <FaLinkedin size={20} className="text-blue-600" />
            LinkedIn
          </button>
        </div>

        {/* Desktop & Large Devices - Inline */}
        <div className="hidden md:grid md:grid-cols-2 gap-3">
          <button
            type="button"
            className="h-12 cursor-pointer flex items-center justify-center gap-2 rounded-lg border border-(--gray-300) bg-(--text-white) text-(--text-title) font-medium hover:bg-(--gray-50) transition-colors"
          >
            <FcGoogle size={20} />
            Google
          </button>
          <button
            type="button"
            className="h-12 flex items-center justify-center gap-2 rounded-lg border border-(--gray-300) bg-(--text-white) text-(--text-title) font-medium hover:bg-(--gray-50) transition-colors"
          >
            <FaLinkedin size={20} className="text-blue-600" />
            LinkedIn
          </button>
        </div>
      </div>

      <p className="text-left sg-p-default text-(--gray-500)">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-(--primary-700) hover:underline font-semibold"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
