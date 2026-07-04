"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Globe, Camera, Loader2 } from "lucide-react";
import Image from "next/image";
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
import { validateUrl, validateMaxLength } from "@/lib/validation";
import { LocationSelect } from "@/components/common/location-select";
import { SelectDropdown } from "@/components/common/select-dropdown";
import RichTextEditor from "@/components/common/rich-text-editor";
import DatePicker from "@/components/common/date-picker";
import { EducationAndExperience } from "./education-experience";
import { SectionCard, Field, Input, AsyncSaveButton } from "./ui";
import { mediaUrl, isoToDate, dateToIso, initialsOf } from "./helpers";

type SaveSection = "personal" | "social";

export function ProfileTab() {
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
    interests: "",
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
                  width={72}
                  height={72}
                  unoptimized
                  className="w-full h-full object-cover"
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

      {/* Education & Work Experience (guide §17 / §18) */}
      <EducationAndExperience />
    </div>
  );
}
