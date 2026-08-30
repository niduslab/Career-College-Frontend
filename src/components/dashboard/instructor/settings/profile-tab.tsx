"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { User, Mail, Globe, Camera, Loader2 } from "lucide-react";
import {
  getMyInstructorProfile,
  updateInstructorProfile,
  updateInstructorPhoto,
  updateInstructorSignature,
  type MyInstructorProfileResponse,
  type InstructorProfile,
} from "@/lib/profile-api";
import { SignatureUpload } from "@/components/common/signature-upload";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { notifyProfileUpdated } from "@/lib/profile-events";
import { validateUrl, validateMaxLength } from "@/lib/validation";
import { LocationSelect } from "@/components/common/location-select";
import RichTextEditor from "@/components/common/rich-text-editor";
import {
  SectionCard,
  Field,
  Input,
  AsyncSaveButton,
} from "../../settings-shared/ui";
import { mediaUrl, initialsOf } from "../../settings-shared/helpers";
import { EducationAndExperience } from "../../settings-shared/education-experience";

type Section = "professional" | "location" | "social";

export function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<Section | null>(null);
  const [savedSection, setSavedSection] = useState<Section | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<MyInstructorProfileResponse["user"] | null>(
    null,
  );
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    current_title: "",
    current_organization: "",
    years_of_experience: "",
    specialization: "",
    city: "",
    state: "",
    country: "",
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
    const bioText = data.bio.replace(/<[^>]*>/g, "").trim();
    const bio = validateMaxLength(bioText, 2000, "Bio");
    if (bio) next.bio = bio;
    if (data.years_of_experience) {
      const yrs = Number(data.years_of_experience);
      if (!Number.isFinite(yrs) || yrs < 0 || yrs > 80)
        next.years_of_experience = "Enter a valid number of years";
    }
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

  const hydrateProfile = (p: InstructorProfile) => {
    setPhoto(p.profile_photo);
    setSignature(p.signature ?? null);
    setForm({
      headline: p.headline ?? "",
      bio: p.bio ?? "",
      current_title: p.current_title ?? "",
      current_organization: p.current_organization ?? "",
      // 0 is the backend's "unset" value — show it as an empty input.
      years_of_experience: p.years_of_experience
        ? String(p.years_of_experience)
        : "",
      specialization: (p.specialization ?? []).join(", "),
      city: p.city ?? "",
      state: p.state ?? "",
      country: p.country ?? "",
      linkedin_url: p.linkedin_url ?? "",
      github_url: p.github_url ?? "",
      website_url: p.website_url ?? "",
    });
    setErrors({});
  };

  useEffect(() => {
    let active = true;
    getMyInstructorProfile()
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        hydrateProfile(data.profile);
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
  }, []);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrors((prev) => ({ ...prev, [k]: "" }));
    };

  const handleSave = async (section: Section) => {
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      notify.error("Please fix the highlighted fields.");
      return;
    }
    setSavingSection(section);
    try {
      const p = await updateInstructorProfile({
        headline: form.headline,
        bio: form.bio,
        current_title: form.current_title,
        current_organization: form.current_organization,
        // Blank means "clear it" — the backend field is non-nullable, so 0 is
        // the empty value. Sending undefined would leave the old number intact.
        years_of_experience: form.years_of_experience
          ? Number(form.years_of_experience)
          : 0,
        specialization: form.specialization
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        city: form.city,
        state: form.state,
        country: form.country,
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
        website_url: form.website_url,
      });
      hydrateProfile(p);
      notifyProfileUpdated();
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
      const p = await updateInstructorPhoto(file);
      hydrateProfile(p);
      notifyProfileUpdated();
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
            <div className="w-18 h-18 rounded-full bg-(--primary-100) text-(--primary-700) text-[22px] font-bold flex items-center justify-center shrink-0 overflow-hidden">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={user?.full_name ?? "Instructor"}
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
            <p className="text-[14px] font-medium text-(--text-title)">
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

      {/* Certificate signature */}
      <SectionCard
        title="Certificate Signature"
        description="Printed on the certificates of learners who complete your courses, above your name and title."
      >
        <SignatureUpload
          value={signature}
          onUpload={async (file) => {
            const p = await updateInstructorSignature(file);
            hydrateProfile(p);
          }}
        />
      </SectionCard>

      {/* Professional info */}
      <SectionCard
        title="Professional Information"
        description="This is displayed on your public instructor profile."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input icon={User} value={user?.full_name ?? ""} disabled />
          </Field>
          <Field label="Email">
            <Input icon={Mail} value={user?.email ?? ""} disabled />
          </Field>
          <Field label="Headline" error={errors.headline}>
            <Input
              value={form.headline}
              onChange={set("headline")}
              placeholder="e.g. Senior ML Engineer at Meta"
            />
          </Field>
          <Field label="Years of experience" error={errors.years_of_experience}>
            <Input
              type="number"
              min={0}
              value={form.years_of_experience}
              onChange={set("years_of_experience")}
              placeholder="e.g. 10"
            />
          </Field>
          <Field label="Current title">
            <Input
              value={form.current_title}
              onChange={set("current_title")}
              placeholder="e.g. Senior ML Engineer"
            />
          </Field>
          <Field label="Current organization">
            <Input
              value={form.current_organization}
              onChange={set("current_organization")}
              placeholder="e.g. Meta"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Specialization (comma separated)">
              <Input
                value={form.specialization}
                onChange={set("specialization")}
                placeholder="Deep Learning, NLP, Computer Vision"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Bio" error={errors.bio}>
              <RichTextEditor
                value={form.bio}
                onChange={(html) => {
                  setForm((f) => ({ ...f, bio: html }));
                  setErrors((prev) => ({ ...prev, bio: "" }));
                }}
                placeholder="Tell students about your background and expertise..."
                minHeight="120px"
              />
            </Field>
          </div>
        </div>
        <div className="flex justify-start pt-2">
          <AsyncSaveButton
            onClick={() => handleSave("professional")}
            saving={savingSection === "professional"}
            saved={savedSection === "professional"}
          />
        </div>
      </SectionCard>

      {/* Location */}
      <SectionCard title="Location">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
        <div className="flex justify-start pt-2">
          <AsyncSaveButton
            onClick={() => handleSave("location")}
            saving={savingSection === "location"}
            saved={savedSection === "location"}
          />
        </div>
      </SectionCard>

      {/* Social links */}
      <SectionCard title="Links">
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

      {/* Education & Work Experience (guide §17 / §18 — instructors too) */}
      <EducationAndExperience />
    </div>
  );
}
