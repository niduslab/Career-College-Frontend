"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Mail,
  Building2,
  Zap,
  ChevronDown,
  GraduationCap,
  Loader2,
} from "lucide-react";
import type { Department, Expert } from "./types";
import { onboardExpert, updateExpert } from "@/lib/partner-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface AddDrawerProps {
  open: boolean;
  onClose: () => void;
  departments: Department[];
  /** When set, the drawer edits this expert instead of onboarding a new one. */
  editingExpert?: Expert | null;
  onSaved: () => void;
}

interface FormState {
  full_name: string;
  email: string;
  department_id: number | "";
  specialization: string;
  headline: string;
  bio: string;
}

const INITIAL: FormState = {
  full_name: "",
  email: "",
  department_id: "",
  specialization: "",
  headline: "",
  bio: "",
};

export default function AddInstructorDrawer({
  open,
  onClose,
  departments,
  editingExpert,
  onSaved,
}: AddDrawerProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [deptOpen, setDeptOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingExpert;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (open) {
      document.body.style.overflow = "hidden";
      if (editingExpert) {
        setForm({
          full_name: editingExpert.full_name,
          email: editingExpert.email,
          department_id: editingExpert.department?.id ?? "",
          specialization: editingExpert.specialization.join(", "),
          headline: editingExpert.headline,
          bio: editingExpert.bio,
        });
      } else {
        setForm(INITIAL);
      }
      t = setTimeout(() => firstInputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "";
      t = setTimeout(() => {
        setForm(INITIAL);
        setErrors({});
        setDeptOpen(false);
      }, 300);
    }
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open, editingExpert]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.full_name.trim()) errs.full_name = "Name is required";
    if (!isEditing) {
      if (!form.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errs.email = "Invalid email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const specialization = form.specialization
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      if (isEditing && editingExpert) {
        await updateExpert(editingExpert.id, {
          headline: form.headline,
          bio: form.bio,
          specialization,
          department_id: form.department_id === "" ? null : form.department_id,
        });
        notify.success("Expert updated.");
      } else {
        await onboardExpert({
          full_name: form.full_name,
          email: form.email,
          headline: form.headline,
          bio: form.bio,
          specialization,
          department_id: form.department_id === "" ? undefined : form.department_id,
        });
        notify.success("Expert onboarded. Login credentials have been emailed.");
      }
      onSaved();
      onClose();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save expert.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDept = departments.find((d) => d.id === form.department_id);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-100 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-101 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--gray-200) shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-(--primary-50) flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-(--primary-600)" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-(--text-title)">
                {isEditing ? "Edit Expert" : "Onboard Expert"}
              </p>
              <p className="text-[12px] text-(--gray-500)">
                {isEditing
                  ? "Update this expert's profile"
                  : "Login credentials will be emailed automatically"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-500) cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
              <input
                ref={firstInputRef}
                type="text"
                value={form.full_name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, full_name: e.target.value }));
                  if (errors.full_name)
                    setErrors((err) => ({ ...err, full_name: undefined }));
                }}
                disabled={isEditing}
                placeholder="e.g. Dr. Sarah Kim"
                className={`w-full h-10 pl-9 pr-4 text-[14px] border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500) ${errors.full_name ? "border-red-400" : "border-(--gray-200)"}`}
              />
            </div>
            {errors.full_name && (
              <p className="text-[12px] text-red-500">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  if (errors.email)
                    setErrors((err) => ({ ...err, email: undefined }));
                }}
                disabled={isEditing}
                placeholder="e.g. sarah@university.edu"
                className={`w-full h-10 pl-9 pr-4 text-[14px] border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500) ${errors.email ? "border-red-400" : "border-(--gray-200)"}`}
              />
            </div>
            {errors.email && (
              <p className="text-[12px] text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Department
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDeptOpen((v) => !v)}
                className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors"
              >
                <Building2 className="w-4 h-4 text-(--gray-400) shrink-0" />
                <span
                  className={`flex-1 text-left ${selectedDept ? "text-(--text-title)" : "text-(--gray-400)"}`}
                >
                  {selectedDept ? selectedDept.name : "Select department (optional)"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-(--gray-400) transition-transform shrink-0 ${deptOpen ? "rotate-180" : ""}`}
                />
              </button>
              {deptOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1 max-h-52 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, department_id: "" }));
                      setDeptOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${form.department_id === "" ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    None
                  </button>
                  {departments.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, department_id: d.id }));
                        setDeptOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${form.department_id === d.id ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Specialization */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Specialization{" "}
              <span className="text-[12px] text-(--gray-400) font-normal">
                (comma-separated)
              </span>
            </label>
            <div className="relative">
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
              <input
                type="text"
                value={form.specialization}
                onChange={(e) =>
                  setForm((f) => ({ ...f, specialization: e.target.value }))
                }
                placeholder="e.g. NLP, Computer Vision"
                className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Headline
            </label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) =>
                setForm((f) => ({ ...f, headline: e.target.value }))
              }
              placeholder="e.g. Senior ML Engineer"
              className="w-full h-10 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Bio{" "}
              <span className="text-[12px] text-(--gray-400) font-normal">
                (optional)
              </span>
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="A short professional bio..."
              className="w-full px-3 py-2.5 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--gray-200) flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-(--gray-200) text-[14px] font-medium text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) cursor-pointer transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Onboard Expert"}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
