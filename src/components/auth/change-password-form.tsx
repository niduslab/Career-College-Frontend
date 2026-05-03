"use client";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export function ChangePasswordForm() {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Partial<ChangePasswordFormData>>({});
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<ChangePasswordFormData> = {};

    if (!formData.current_password)
      newErrors.current_password = "Current password is required";

    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (!PASSWORD_RULES.every((r) => r.test(formData.new_password))) {
      newErrors.new_password = "Password does not meet requirements";
    } else if (formData.new_password === formData.current_password) {
      newErrors.new_password = "New password must differ from current password";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your new password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Change password submitted");
    setSubmitted(true);
  };

  const updateField = (field: keyof ChangePasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleShow = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  if (submitted) {
    return (
      <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-(--primary-50) flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-(--primary-700)" />
          </div>
          <h2 className="sg-h4 font-semibold text-(--text-title) mb-2">
            Password Changed!
          </h2>
          <p className="sg-p-default text-(--gray-600) max-w-sm">
            Your password has been updated successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
      <h2 className="sg-h4 font-semibold text-(--text-title) mb-2">
        Change Password
      </h2>
      <p className="sg-p-default text-(--gray-600) mb-6">
        Update your account password. Make sure it&apos;s strong and unique.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <Label
            htmlFor="current_password"
            className="sg-p-default font-semibold text-(--text-title) mb-2"
          >
            Current Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-2">
            <Input
              id="current_password"
              type={show.current ? "text" : "password"}
              value={formData.current_password}
              onChange={(e) => updateField("current_password", e.target.value)}
              placeholder="Enter your current password"
              className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => toggleShow("current")}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-(--gray-500) hover:text-(--text-title) transition-colors"
              aria-label={show.current ? "Hide password" : "Show password"}
            >
              {show.current ? (
                <EyeOff size={18} strokeWidth={2} />
              ) : (
                <Eye size={18} strokeWidth={2} />
              )}
            </button>
          </div>
          {errors.current_password && (
            <p className="text-red-600 sg-caption mt-1.5">
              {errors.current_password}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <Label
            htmlFor="new_password"
            className="sg-p-default font-semibold text-(--text-title) mb-2"
          >
            New Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-2">
            <Input
              id="new_password"
              type={show.new ? "text" : "password"}
              value={formData.new_password}
              onChange={(e) => updateField("new_password", e.target.value)}
              placeholder="Create a new password"
              className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => toggleShow("new")}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-(--gray-500) hover:text-(--text-title) transition-colors"
              aria-label={show.new ? "Hide password" : "Show password"}
            >
              {show.new ? (
                <EyeOff size={18} strokeWidth={2} />
              ) : (
                <Eye size={18} strokeWidth={2} />
              )}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-red-600 sg-caption mt-1.5">
              {errors.new_password}
            </p>
          )}

          {/* Password strength checklist */}
          {formData.new_password && (
            <ul className="mt-3 space-y-1.5">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(formData.new_password);
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

        {/* Confirm New Password */}
        <div>
          <Label
            htmlFor="confirm_password"
            className="sg-p-default font-semibold text-(--text-title) mb-2"
          >
            Confirm New Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-2">
            <Input
              id="confirm_password"
              type={show.confirm ? "text" : "password"}
              value={formData.confirm_password}
              onChange={(e) => updateField("confirm_password", e.target.value)}
              placeholder="Confirm your new password"
              className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => toggleShow("confirm")}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-(--gray-500) hover:text-(--text-title) transition-colors"
              aria-label={show.confirm ? "Hide password" : "Show password"}
            >
              {show.confirm ? (
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
          className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer transition-colors"
        >
          Update Password
        </Button>
      </form>
    </div>
  );
}
