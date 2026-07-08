"use client";

import { useState } from "react";
import { User, Mail, Phone, Camera } from "lucide-react";
import { SectionCard, Field, Input, SaveButton } from "../../settings-shared/ui";

export function ProfileTab() {
  const [form, setForm] = useState({
    fullName: "Al Amin",
    email: "alamin@niduslab.com",
    phone: "+880 1XXX-XXXXXX",
    title: "Platform Administrator",
  });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <SectionCard title="Profile Photo">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-18 h-18 rounded-full bg-(--primary-100) text-(--primary-700) text-[22px] font-bold flex items-center justify-center shrink-0">
              AA
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-(--primary-600) text-white flex items-center justify-center cursor-pointer hover:bg-(--primary-700) transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-[14px] font-medium text-(--text-title)">{form.fullName}</p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">JPG or PNG, max 2MB</p>
            <button
              type="button"
              className="mt-2 text-[12px] font-medium text-(--primary-600) hover:underline cursor-pointer"
            >
              Upload new photo
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Basic info */}
      <SectionCard title="Basic Information" description="This information is used across the admin panel.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input icon={User} value={form.fullName} onChange={set("fullName")} />
          </Field>
          <Field label="Email">
            <Input icon={Mail} type="email" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Phone">
            <Input icon={Phone} value={form.phone} onChange={set("phone")} />
          </Field>
          <Field label="Role title">
            <Input value={form.title} onChange={set("title")} placeholder="e.g. Platform Administrator" />
          </Field>
        </div>
        <div className="flex justify-start pt-2">
          <SaveButton onClick={() => {}} />
        </div>
      </SectionCard>
    </div>
  );
}
