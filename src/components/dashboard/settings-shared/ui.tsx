"use client";

import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-6 py-5 space-y-4">
      <div>
        <p className="text-[16px] font-semibold text-(--text-title)">{title}</p>
        {description && (
          <p className="text-[14px] text-(--gray-500) mt-0.5">{description}</p>
        )}
      </div>
      <div className="border-t border-(--gray-100)" />
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-normal text-(--text-title)">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="text-red-600 text-[12px] mt-0.5">{error}</p>}
    </div>
  );
}

export function Input({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ElementType;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
      )}
      <input
        {...props}
        className={`w-full h-12 ${Icon ? "pl-9" : "pl-3"} pr-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500) disabled:cursor-not-allowed`}
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${checked ? "bg-(--primary-600)" : "bg-(--gray-200)"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4.5" : "translate-x-0"}`}
      />
    </button>
  );
}

export function SaveButton({ onClick }: { onClick: () => void }) {
  const [saved, setSaved] = useState(false);

  const handle = () => {
    onClick();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handle}
      className="flex items-center gap-1.5 h-10 px-5 rounded-md bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer"
    >
      {saved ? <Check className="w-4 h-4" /> : null}
      {saved ? "Saved!" : "Save Changes"}
    </button>
  );
}

// Save button driven by external async state (from an API call).
export function AsyncSaveButton({
  onClick,
  saving,
  saved,
}: {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-1.5 h-10 px-5 rounded-md bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {saving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <Check className="w-4 h-4" />
      ) : null}
      {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
    </button>
  );
}
