"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Camera,
  Check,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";

// Types

type Tab = "profile" | "account" | "notifications" | "billing";

// Sub-components

function SectionCard({
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-normal text-(--text-title)">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
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
        className={`w-full h-10 ${Icon ? "pl-9" : "pl-3"} pr-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow`}
      />
    </div>
  );
}

function Toggle({
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

function SaveButton({ onClick }: { onClick: () => void }) {
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
      className="flex items-center  gap-1.5 h-10 px-5 rounded-md bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer"
    >
      {saved ? <Check className="w-4 h-4" /> : null}
      {saved ? "Saved!" : "Save Changes"}
    </button>
  );
}

// Tabs

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account & Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

// Tab content

function ProfileTab() {
  const [form, setForm] = useState({
    firstName: "Maria",
    lastName: "Lopez",
    email: "maria.lopez@example.com",
    phone: "+1 555 000 1234",
    bio: "Senior UI/UX designer and instructor with 8+ years of experience.",
    website: "https://marialopez.design",
    linkedin: "linkedin.com/in/marialopez",
    twitter: "@marialopez",
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <SectionCard title="Profile Photo">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-18 h-18 rounded-full bg-(--primary-100) text-(--primary-700) text-[22px] font-bold flex items-center justify-center shrink-0">
              MH
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-(--primary-600) text-white flex items-center justify-center cursor-pointer hover:bg-(--primary-700) transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-[14px] font-medium text-(--text-title)">
              Marop Hossain
            </p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              JPG or PNG, max 2MB
            </p>
            <button
              type="button"
              className="mt-2 text-[12px] font-medium text-(--primary-600) hover:underline cursor-pointer"
            >
              Upload new photo
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Personal info */}
      <SectionCard
        title="Personal Information"
        description="This is displayed on your public profile."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name">
            <Input
              icon={User}
              value={form.firstName}
              onChange={set("firstName")}
              placeholder="e.g. Marop"
            />
          </Field>
          <Field label="Last name">
            <Input
              value={form.lastName}
              onChange={set("lastName")}
              placeholder="e.g. Hossain"
            />
          </Field>
          <Field label="Email">
            <Input
              icon={Mail}
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Phone">
            <Input
              icon={Phone}
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+1 555 000 0000"
            />
          </Field>
          <Field label="Website">
            <Input
              icon={Globe}
              type="url"
              value={form.website}
              onChange={set("website")}
              placeholder="https://yourwebsite.com"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bio">
              <textarea
                value={form.bio}
                onChange={set("bio")}
                rows={3}
                placeholder="Tell students a little about yourself..."
                className="w-full px-3 py-2.5 text-[13px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
              />
            </Field>
          </div>
        </div>
        <div className="flex justify-start pt-2">
          <SaveButton onClick={() => {}} />
        </div>
      </SectionCard>

      {/* Social links */}
      <SectionCard title="Social Links">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="LinkedIn">
            <Input
              value={form.linkedin}
              onChange={set("linkedin")}
              placeholder="linkedin.com/in/username"
            />
          </Field>
          <Field label="Twitter / X">
            <Input
              value={form.twitter}
              onChange={set("twitter")}
              placeholder="@username"
            />
          </Field>
        </div>
        <div className="flex justify-start pt-2">
          <SaveButton onClick={() => {}} />
        </div>
      </SectionCard>
    </div>
  );
}

function AccountTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  const sessions = [
    {
      device: "Chrome on macOS",
      location: "Dhaka, BD",
      time: "Now",
      current: true,
    },
    {
      device: "Safari on iPhone",
      location: "Dhaka, BD",
      time: "2h ago",
      current: false,
    },
    {
      device: "Firefox on Windows",
      location: "London, UK",
      time: "3d ago",
      current: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Change password */}
      <SectionCard
        title="Change Password"
        description="Use a strong password you don't use elsewhere."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Current password">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                className="w-full h-10 pl-9 pr-10 text-[13px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400) cursor-pointer"
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>
          <Field label="New password">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
              <input
                type={showNew ? "text" : "password"}
                placeholder="Min. 8 characters"
                className="w-full h-10 pl-9 pr-10 text-[13px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400) cursor-pointer"
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>
          <div className="sm:col-span-2 sm:max-w-sm">
            <Field label="Confirm password">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat new password"
                  className="w-full h-10 pl-9 pr-10 text-[13px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400) cursor-pointer"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </Field>
          </div>
        </div>
        <div className="flex justify-start pt-2">
          <SaveButton onClick={() => {}} />
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account."
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-(--text-title)">
              Authenticator app
            </p>
            <p className="text-[12px] text-(--gray-400) mt-0.5">
              {twoFactor
                ? "Enabled — using Google Authenticator"
                : "Not enabled"}
            </p>
          </div>
          <Toggle
            checked={twoFactor}
            onChange={() => setTwoFactor((v) => !v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-(--text-title)">
              Login alerts
            </p>
            <p className="text-[12px] text-(--gray-400) mt-0.5">
              Get an email when a new session is started
            </p>
          </div>
          <Toggle
            checked={sessionAlerts}
            onChange={() => setSessionAlerts((v) => !v)}
          />
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard
        title="Active Sessions"
        description="Devices currently signed in to your account."
      >
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.device}
              className="flex items-center justify-between py-2 border-b border-(--gray-100) last:border-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-(--text-title)">
                    {s.device}
                  </p>
                  {s.current && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-(--gray-400) mt-0.5">
                  {s.location} · {s.time}
                </p>
              </div>
              {!s.current && (
                <button
                  type="button"
                  className="text-[12px] font-medium text-red-500 hover:underline cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title="Danger Zone">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-(--text-title)">
              Delete account
            </p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              Permanently delete your account and all data.
            </p>
          </div>
          <button
            type="button"
            className="h-11 px-4 rounded-md border border-red-200 text-red-500 text-[14px] font-medium hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Delete Account
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newEnrollment: true,
    courseReview: true,
    studentMessage: true,
    revenueUpdate: false,
    weeklyReport: true,
    platformUpdates: false,
    emailDigest: true,
    pushNotifs: false,
  });

  const toggle = (k: keyof typeof prefs) => () =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const groups = [
    {
      title: "Student Activity",
      items: [
        {
          key: "newEnrollment" as const,
          label: "New enrollment",
          desc: "When a student enrolls in your course",
        },
        {
          key: "courseReview" as const,
          label: "Course review",
          desc: "When a student leaves a review",
        },
        {
          key: "studentMessage" as const,
          label: "Student message",
          desc: "When a student sends you a message",
        },
      ],
    },
    {
      title: "Revenue & Reports",
      items: [
        {
          key: "revenueUpdate" as const,
          label: "Revenue update",
          desc: "Daily revenue summary",
        },
        {
          key: "weeklyReport" as const,
          label: "Weekly report",
          desc: "Performance summary every Monday",
        },
      ],
    },
    {
      title: "Platform",
      items: [
        {
          key: "platformUpdates" as const,
          label: "Platform updates",
          desc: "New features and announcements",
        },
        {
          key: "emailDigest" as const,
          label: "Email digest",
          desc: "Weekly digest of activity",
        },
        {
          key: "pushNotifs" as const,
          label: "Push notifications",
          desc: "Browser push notifications",
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <SectionCard key={g.title} title={g.title}>
          <div className="space-y-4">
            {g.items.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-(--text-title)">
                    {label}
                  </p>
                  <p className="text-[12px] text-(--gray-400)">{desc}</p>
                </div>
                <Toggle checked={prefs[key]} onChange={toggle(key)} />
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
      <div className="flex justify-end">
        <SaveButton onClick={() => {}} />
      </div>
    </div>
  );
}

function BillingTab() {
  const invoices = [
    {
      id: "INV-2026-003",
      date: "Mar 1, 2026",
      amount: "$29.00",
      status: "Paid",
    },
    {
      id: "INV-2026-002",
      date: "Feb 1, 2026",
      amount: "$29.00",
      status: "Paid",
    },
    {
      id: "INV-2026-001",
      date: "Jan 1, 2026",
      amount: "$29.00",
      status: "Paid",
    },
    {
      id: "INV-2025-012",
      date: "Dec 1, 2025",
      amount: "$29.00",
      status: "Paid",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Current plan */}
      <SectionCard title="Current Plan">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-bold text-(--text-title)">
                Pro Instructor
              </p>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-(--primary-50) text-(--primary-600) border border-(--primary-200)">
                Active
              </span>
            </div>
            <p className="text-[13px] text-(--gray-500) mt-1">
              $29/month · Renews Apr 1, 2026
            </p>
          </div>
          <button
            type="button"
            className="h-9 px-4 rounded-md border border-(--gray-200) text-[14px] font-medium text-(--gray-500) hover:bg-(--gray-50) transition-colors cursor-pointer"
          >
            Change Plan
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: "Courses", value: "Unlimited" },
            { label: "Students", value: "Unlimited" },
            { label: "Revenue Share", value: "85%" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-(--gray-50) rounded-xl px-4 py-3 text-center"
            >
              <p className="text-[14px] font-semibold text-(--text-title)">
                {value}
              </p>
              <p className="text-[12px] text-(--gray-500) mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Payment method */}
      <SectionCard title="Payment Method">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 rounded-lg bg-(--gray-100) flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-(--gray-500)" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-(--text-title)">
                Visa ending in 4242
              </p>
              <p className="text-[11px] text-(--gray-400)">Expires 08 / 2028</p>
            </div>
          </div>
          <button
            type="button"
            className="text-[13px] font-medium text-(--primary-600) hover:underline cursor-pointer"
          >
            Update
          </button>
        </div>
      </SectionCard>

      {/* Invoice history */}
      <SectionCard title="Invoice History">
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_1fr_80px_80px] gap-3 px-3 pb-2 border-b border-(--gray-100)">
            {["Invoice", "Date", "Amount", ""].map((h) => (
              <p
                key={h}
                className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase"
              >
                {h}
              </p>
            ))}
          </div>
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-[1fr_1fr_80px_80px] gap-3 items-center px-3 py-2.5 rounded-xl hover:bg-(--gray-50) transition-colors"
            >
              <p className="text-[13px] font-medium text-(--text-title)">
                {inv.id}
              </p>
              <p className="text-[12px] text-(--gray-500)">{inv.date}</p>
              <p className="text-[13px] font-semibold text-(--text-title)">
                {inv.amount}
              </p>
              <button
                type="button"
                className="text-[12px] font-medium text-(--primary-600) hover:underline cursor-pointer text-right"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

//  Main Page

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const ActiveContent = {
    profile: ProfileTab,
    account: AccountTab,
    notifications: NotificationsTab,
    billing: BillingTab,
  }[activeTab];

  return (
    <div className="space-y-5">
      {/* ── Tab bar ── */}
      <div className="bg-white border border-(--gray-200) rounded-lg px-4 py-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }, i) => {
            const active = activeTab === id;
            return (
              <React.Fragment key={id}>
                {i > 0 && (
                  <ChevronRight className="w-4 h-4 text-(--gray-500) shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-normal transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-(--primary-600) text-white"
                      : "text-(--gray-500) hover:text-(--text-title)"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-(--gray-400)"}`}
                  />
                  {label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <ActiveContent />
    </div>
  );
}
