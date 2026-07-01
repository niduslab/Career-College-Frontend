"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Globe,
  Lock,
  Bell,
  Shield,
  Camera,
  Check,
  Eye,
  EyeOff,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  updateProfilePhoto,
  EXPERIENCE_LEVELS,
  type MyProfileResponse,
  type LearnerProfile,
} from "@/lib/profile-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { config } from "@/lib/config";
import { LocationSelect } from "@/components/common/location-select";
import { SelectDropdown } from "@/components/common/select-dropdown";
import { validateUrl, validateMaxLength } from "@/lib/validation";
import RichTextEditor from "@/components/common/rich-text-editor";
import DatePicker from "@/components/common/date-picker";
import Image from "next/image";

// Types

type Tab = "profile" | "account" | "notifications";

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
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-normal text-(--text-title)">
        {label}
      </label>
      {children}
      {error && <p className="text-red-600 text-[12px] mt-0.5">{error}</p>}
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
        className={`w-full h-12 ${Icon ? "pl-9" : "pl-3"} pr-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50) disabled:text-(--gray-500) disabled:cursor-not-allowed`}
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
      className="flex items-center gap-1.5 h-10 px-5 rounded-md bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer"
    >
      {saved ? <Check className="w-4 h-4" /> : null}
      {saved ? "Saved!" : "Save Changes"}
    </button>
  );
}

// Save button driven by external async state (from an API call).
function AsyncSaveButton({
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

// Tabs

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account & Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

// Tab content

function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const origin = config.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return `${origin}${path}`;
}

function isoToDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}
function dateToIso(date: Date | undefined): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1][0]!).toUpperCase();
}

type SaveSection = "personal" | "social";

function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<SaveSection | null>(null);
  const [savedSection, setSavedSection] = useState<SaveSection | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<MyProfileResponse["user"] | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    date_of_birth: "",
    city: "",
    state: "",
    country: "",
    experience_level: "",
    learning_goal: "",
    interests: "", //
    linkedin_url: "",
    github_url: "",
    website_url: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});

  const validate = (
    data: typeof form,
  ): Partial<Record<keyof typeof form, string>> => {
    const next: Partial<Record<keyof typeof form, string>> = {};
    const headline = validateMaxLength(data.headline, 150, "Headline");
    if (headline) next.headline = headline;
    // Bio is HTML from the rich-text editor; measure the visible text, not tags.
    const bioText = data.bio.replace(/<[^>]*>/g, "").trim();
    const bio = validateMaxLength(bioText, 1000, "Bio");
    if (bio) next.bio = bio;
    const goal = validateMaxLength(data.learning_goal, 255, "Learning goal");
    if (goal) next.learning_goal = goal;
    const linkedin = validateUrl(
      data.linkedin_url,
      "LinkedIn URL",
      "linkedin.com",
    );
    if (linkedin) next.linkedin_url = linkedin;
    const github = validateUrl(data.github_url, "GitHub URL", "github.com");
    if (github) next.github_url = github;
    const website = validateUrl(data.website_url, "website URL");
    if (website) next.website_url = website;
    return next;
  };

  const hydrateProfile = (profile: LearnerProfile) => {
    setPhoto(profile.profile_photo);
    setForm({
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      country: profile.country ?? "",
      experience_level: profile.experience_level ?? "",
      learning_goal: profile.learning_goal ?? "",
      interests: (profile.interests ?? []).join(", "),
      linkedin_url: profile.linkedin_url ?? "",
      github_url: profile.github_url ?? "",
      website_url: profile.website_url ?? "",
    });
    setErrors({});
  };

  // Populate everything from the full GET response ({ user, profile, ... }).
  const hydrate = (data: MyProfileResponse) => {
    setUser(data.user);
    hydrateProfile(data.profile);
  };

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((data) => {
        if (active) hydrate(data);
      })
      .catch((err) => {
        notify.error(
          err instanceof ApiError
            ? err.message
            : "Failed to load your profile.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // Run once on mount; hydrate is a stable local setter wrapper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrors((prev) => ({ ...prev, [k]: "" }));
    };

  const handleSave = async (section: SaveSection) => {
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      notify.error("Please fix the highlighted fields.");
      return;
    }
    setSavingSection(section);
    try {
      const data = await updateMyProfile({
        headline: form.headline,
        bio: form.bio,
        date_of_birth: form.date_of_birth || null,
        city: form.city,
        state: form.state,
        country: form.country,
        experience_level: form.experience_level || undefined,
        learning_goal: form.learning_goal,
        interests: form.interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
        website_url: form.website_url,
      });
      hydrateProfile(data);
      notify.success("Profile updated.");
      setSavedSection(section);
      setTimeout(
        () => setSavedSection((s) => (s === section ? null : s)),
        2000,
      );
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update profile.",
      );
    } finally {
      setSavingSection(null);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify.error("Image must be 2MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const data = await updateProfilePhoto(file);
      hydrateProfile(data);
      notify.success("Photo updated.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to upload photo.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading your profile…
      </div>
    );
  }

  const photoUrl = mediaUrl(photo);

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <SectionCard title="Profile Photo">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-18 h-18 rounded-full bg-(--primary-100) text-(--primary-700) text-[22px] font-semibold flex items-center justify-center shrink-0 overflow-hidden">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={user?.full_name ?? "Profile"}
                  className="w-full h-full object-cover"
                  width={72}
                  height={72}
                />
              ) : (
                initialsOf(user?.full_name ?? "")
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-(--primary-600) text-white flex items-center justify-center cursor-pointer hover:bg-(--primary-700) transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-(--text-title)">
              {user?.full_name}
            </p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              JPG or PNG, max 2MB
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-2 text-[12px] font-medium text-(--primary-600) hover:underline cursor-pointer disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload new photo"}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Personal info */}
      <SectionCard
        title="Personal Information"
        description="This is displayed on your public learner profile."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input icon={User} value={user?.full_name ?? ""} disabled />
          </Field>
          <Field label="Email">
            <Input
              icon={Mail}
              type="email"
              value={user?.email ?? ""}
              disabled
            />
          </Field>
          <Field label="Headline" error={errors.headline}>
            <Input
              value={form.headline}
              onChange={set("headline")}
              placeholder="e.g. Data Analyst at Google"
            />
          </Field>
          <Field label="Date of birth">
            <DatePicker
              value={isoToDate(form.date_of_birth)}
              onChange={(d) =>
                setForm((f) => ({ ...f, date_of_birth: dateToIso(d) }))
              }
              placeholder="Select your date of birth"
              disablePast={false}
              disableFuture
              captionDropdown
              fromYear={new Date().getFullYear() - 100}
              toYear={new Date().getFullYear() - 10}
            />
          </Field>
          <Field label="Experience level">
            <SelectDropdown
              value={form.experience_level}
              onChange={(v) => setForm((f) => ({ ...f, experience_level: v }))}
              options={EXPERIENCE_LEVELS}
              placeholder="Select experience level"
            />
          </Field>
          <LocationSelect
            value={{
              country: form.country,
              state: form.state,
              city: form.city,
            }}
            onChange={(loc) =>
              setForm((f) => ({
                ...f,
                country: loc.country,
                state: loc.state,
                city: loc.city,
              }))
            }
          />
          <Field label="Learning goal" error={errors.learning_goal}>
            <Input
              value={form.learning_goal}
              onChange={set("learning_goal")}
              placeholder="e.g. Switch to a data science career"
            />
          </Field>
          <Field label="Interests (comma separated)">
            <Input
              value={form.interests}
              onChange={set("interests")}
              placeholder="Python, Machine Learning, Design"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Bio" error={errors.bio}>
              <RichTextEditor
                value={form.bio}
                onChange={(html) => {
                  setForm((f) => ({ ...f, bio: html }));
                  setErrors((prev) => ({ ...prev, bio: "" }));
                }}
                placeholder="Tell us a little about yourself..."
                minHeight="120px"
              />
            </Field>
          </div>
        </div>
        <div className="flex justify-start pt-2">
          <AsyncSaveButton
            onClick={() => handleSave("personal")}
            saving={savingSection === "personal"}
            saved={savedSection === "personal"}
          />
        </div>
      </SectionCard>

      {/* Social links */}
      <SectionCard title="Social Links">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="LinkedIn" error={errors.linkedin_url}>
            <Input
              value={form.linkedin_url}
              onChange={set("linkedin_url")}
              placeholder="https://linkedin.com/in/username"
            />
          </Field>
          <Field label="GitHub" error={errors.github_url}>
            <Input
              value={form.github_url}
              onChange={set("github_url")}
              placeholder="https://github.com/username"
            />
          </Field>
          <Field label="Website" error={errors.website_url}>
            <Input
              icon={Globe}
              type="url"
              value={form.website_url}
              onChange={set("website_url")}
              placeholder="https://yourwebsite.com"
            />
          </Field>
        </div>
        <div className="flex justify-start pt-2">
          <AsyncSaveButton
            onClick={() => handleSave("social")}
            saving={savingSection === "social"}
            saved={savedSection === "social"}
          />
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
      device: "Chrome on Windows",
      location: "Dhaka, BD",
      time: "Now",
      current: true,
    },
    {
      device: "Safari on iPhone",
      location: "Dhaka, BD",
      time: "3h ago",
      current: false,
    },
    {
      device: "Firefox on macOS",
      location: "London, UK",
      time: "5d ago",
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
                className="w-full h-11 pl-9 pr-10 text-[14px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
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
                className="w-full h-11 pl-9 pr-10 text-[14px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
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
          <div>
            <Field label="Confirm password">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat new password"
                  className="w-full h-11 pl-9 pr-10 text-[14px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
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
            <p className="text-[14px] font-semibold text-(--text-title)">
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
            <p className="text-[14px] font-semibold text-(--text-title)">
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
                  <p className="text-[14px] font-semibold text-(--text-title)">
                    {s.device}
                  </p>
                  {s.current && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-(--gray-400) mt-0.5">
                  {s.location} · {s.time}
                </p>
              </div>
              {!s.current && (
                <button
                  type="button"
                  className="text-[12px] md:text-[14px] lg:text-[14px] font-medium text-red-500 hover:underline cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Linked accounts */}
      <SectionCard
        title="Linked Accounts"
        description="Connect third-party accounts for quick sign-in."
      >
        <div className="space-y-3">
          {[
            { name: "Google", connected: true, color: "bg-rose-500" },
            { name: "GitHub", connected: false, color: "bg-(--gray-800)" },
            { name: "LinkedIn", connected: false, color: "bg-blue-600" },
          ].map((acc) => (
            <div key={acc.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg ${acc.color} flex items-center justify-center shrink-0`}
                >
                  <span className="text-white text-[12px] font-bold">
                    {acc.name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-(--text-title)">
                    {acc.name}
                  </p>
                  <p className="text-[12px] text-(--gray-400)">
                    {acc.connected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <button
                className={`text-[12px] md:text-[14px] lg:text-[14px] font-medium cursor-pointer transition-colors ${acc.connected ? "text-red-500 hover:underline" : "text-(--primary-600) hover:underline"}`}
              >
                {acc.connected ? "Disconnect" : "Connect"}
              </button>
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
            className="h-11 px-4 rounded-md border border-red-200 text-red-500 text-[12px] md:text-[14px] lg:text-[14px] font-medium hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
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
    newContent: true,
    replies: true,
    announcements: false,
    marketing: false,
    liveSession: true,
    reminders: true,
    emailDigest: true,
    pushNotifs: false,
  });

  const toggle = (k: keyof typeof prefs) => () =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const groups = [
    {
      title: "Course Activity",
      items: [
        {
          key: "newContent" as const,
          label: "New course content",
          desc: "When new modules or lessons are added to your courses",
        },
        {
          key: "replies" as const,
          label: "Discussion replies",
          desc: "When someone replies to your threads or comments",
        },
        {
          key: "liveSession" as const,
          label: "Live session alerts",
          desc: "When a live session you're registered for is starting",
        },
      ],
    },
    {
      title: "Platform",
      items: [
        {
          key: "announcements" as const,
          label: "Announcements",
          desc: "Important platform and course announcements",
        },
        {
          key: "reminders" as const,
          label: "Study reminders",
          desc: "Daily reminders to keep your learning streak going",
        },
        {
          key: "emailDigest" as const,
          label: "Email digest",
          desc: "Weekly summary of your learning activity",
        },
      ],
    },
    {
      title: "Marketing",
      items: [
        {
          key: "marketing" as const,
          label: "Promotions & offers",
          desc: "Discounts, new courses, and special recommendations",
        },
        {
          key: "pushNotifs" as const,
          label: "Push notifications",
          desc: "Browser push notifications for real-time alerts",
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
                  <p className="text-[14px] font-semibold text-(--text-title)">
                    {label}
                  </p>
                  <p className="text-[12px] font-normal text-(--gray-500)">
                    {desc}
                  </p>
                </div>
                <Toggle checked={prefs[key]} onChange={toggle(key)} />
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
      <div className="flex justify-start">
        <SaveButton onClick={() => {}} />
      </div>
    </div>
  );
}

// Main Page

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const ActiveContent = {
    profile: ProfileTab,
    account: AccountTab,
    notifications: NotificationsTab,
  }[activeTab];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
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
