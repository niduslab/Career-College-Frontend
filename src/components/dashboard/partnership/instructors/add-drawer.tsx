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
} from "lucide-react";
import { Department, InstructorStatus, Specialization } from "./types";
import { DEPARTMENTS, SPECIALIZATIONS, STATUSES } from "./data";

interface AddDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  department: Department | "";
  specialization: Specialization | "";
  status: InstructorStatus;
  note: string;
}

const INITIAL: FormState = {
  name: "",
  email: "",
  department: "",
  specialization: "",
  status: "Active",
  note: "",
};

const STATUS_COLOR: Record<InstructorStatus, string> = {
  Active: "text-green-600",
  Pending: "text-orange-500",
  Inactive: "text-gray-500",
};

export default function AddInstructorDrawer({ open, onClose }: AddDrawerProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [deptOpen, setDeptOpen] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (open) {
      document.body.style.overflow = "hidden";
      t = setTimeout(() => firstInputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "";
      t = setTimeout(() => {
        setForm(INITIAL);
        setErrors({});
        setDeptOpen(false);
        setSpecOpen(false);
        setStatusOpen(false);
      }, 300);
    }
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email address";
    if (!form.department) errs.department = "Select a department";
    if (!form.specialization) errs.specialization = "Select a specialization";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: connect to API
    onClose();
  };

  const DEPT_OPTIONS = DEPARTMENTS.filter((d) => d !== "All") as Department[];
  const SPEC_OPTIONS = SPECIALIZATIONS.filter(
    (s) => s !== "All",
  ) as Specialization[];
  const STATUS_OPTIONS = STATUSES.filter(
    (s) => s !== "All",
  ) as InstructorStatus[];

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
                Add Instructor
              </p>
              <p className="text-[12px] text-(--gray-500)">
                Fill in the details below
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
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  if (errors.name)
                    setErrors((err) => ({ ...err, name: undefined }));
                }}
                placeholder="e.g. Dr. Sarah Kim"
                className={`w-full h-10 pl-9 pr-4 text-[14px] border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow ${errors.name ? "border-red-400" : "border-(--gray-200)"}`}
              />
            </div>
            {errors.name && (
              <p className="text-[12px] text-red-500">{errors.name}</p>
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
                placeholder="e.g. sarah@university.edu"
                className={`w-full h-10 pl-9 pr-4 text-[14px] border rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow ${errors.email ? "border-red-400" : "border-(--gray-200)"}`}
              />
            </div>
            {errors.email && (
              <p className="text-[12px] text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDeptOpen((v) => !v);
                  setSpecOpen(false);
                  setStatusOpen(false);
                }}
                className={`flex items-center gap-2 w-full h-10 px-3 border rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors ${errors.department ? "border-red-400" : "border-(--gray-200)"}`}
              >
                <Building2 className="w-4 h-4 text-(--gray-400) shrink-0" />
                <span
                  className={`flex-1 text-left ${form.department ? "text-(--text-title)" : "text-(--gray-400)"}`}
                >
                  {form.department || "Select department"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-(--gray-400) transition-transform shrink-0 ${deptOpen ? "rotate-180" : ""}`}
                />
              </button>
              {deptOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1">
                  {DEPT_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, department: d }));
                        setDeptOpen(false);
                        if (errors.department)
                          setErrors((err) => ({
                            ...err,
                            department: undefined,
                          }));
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${form.department === d ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.department && (
              <p className="text-[12px] text-red-500">{errors.department}</p>
            )}
          </div>

          {/* Specialization */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Specialization <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSpecOpen((v) => !v);
                  setDeptOpen(false);
                  setStatusOpen(false);
                }}
                className={`flex items-center gap-2 w-full h-10 px-3 border rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors ${errors.specialization ? "border-red-400" : "border-(--gray-200)"}`}
              >
                <Zap className="w-4 h-4 text-(--gray-400) shrink-0" />
                <span
                  className={`flex-1 text-left ${form.specialization ? "text-(--text-title)" : "text-(--gray-400)"}`}
                >
                  {form.specialization || "Select specialization"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-(--gray-400) transition-transform shrink-0 ${specOpen ? "rotate-180" : ""}`}
                />
              </button>
              {specOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1 max-h-52 overflow-y-auto">
                  {SPEC_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, specialization: s }));
                        setSpecOpen(false);
                        if (errors.specialization)
                          setErrors((err) => ({
                            ...err,
                            specialization: undefined,
                          }));
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${form.specialization === s ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.specialization && (
              <p className="text-[12px] text-red-500">
                {errors.specialization}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setStatusOpen((v) => !v);
                  setDeptOpen(false);
                  setSpecOpen(false);
                }}
                className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors"
              >
                <span
                  className={`flex-1 text-left font-medium ${STATUS_COLOR[form.status]}`}
                >
                  {form.status}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-(--gray-400) transition-transform shrink-0 ${statusOpen ? "rotate-180" : ""}`}
                />
              </button>
              {statusOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, status: st }));
                        setStatusOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors font-medium ${STATUS_COLOR[st]} ${form.status === st ? "bg-(--gray-50)" : "hover:bg-(--gray-50)"}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-(--text-title)">
              Note{" "}
              <span className="text-[12px] text-(--gray-400) font-normal">
                (optional)
              </span>
            </label>
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Any additional notes about this instructor..."
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
            className="flex-1 h-10 rounded-lg bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) cursor-pointer transition-colors"
          >
            Add Instructor
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
