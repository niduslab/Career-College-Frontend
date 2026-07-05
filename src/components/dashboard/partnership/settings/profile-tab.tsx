"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Mail, Phone, Globe, Camera, Building2, Loader2 } from "lucide-react";
import {
  getMyPartnerProfile,
  updatePartnerProfile,
  updatePartnerImages,
  INSTITUTION_TYPE_OPTIONS,
  type PartnerProfile,
} from "@/lib/profile-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import {
  validateUrl,
  validateEmail,
  validateMaxLength,
} from "@/lib/validation";
import { LocationSelect } from "@/components/common/location-select";
import RichTextEditor from "@/components/common/rich-text-editor";
import {
  SectionCard,
  Field,
  Input,
  AsyncSaveButton,
} from "../../settings-shared/ui";
import { mediaUrl, initialsOf } from "../../settings-shared/helpers";

const INSTITUTION_TYPE_LABEL = (v: string) =>
  INSTITUTION_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v;

export function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<
    "institution" | "contact" | null
  >(null);
  const [savedSection, setSavedSection] = useState<
    "institution" | "contact" | null
  >(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [logo, setLogo] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [form, setForm] = useState({
    tagline: "",
    description: "",
    address: "",
    founded_year: "",
    city: "",
    state: "",
    country: "",
    contact_email: "",
    contact_phone: "",
    website_url: "",
    linkedin_url: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});

  const validate = (
    data: typeof form,
  ): Partial<Record<keyof typeof form, string>> => {
    const next: Partial<Record<keyof typeof form, string>> = {};
    const tagline = validateMaxLength(data.tagline, 150, "Tagline");
    if (tagline) next.tagline = tagline;
    const descText = data.description.replace(/<[^>]*>/g, "").trim();
    const desc = validateMaxLength(descText, 2000, "Description");
    if (desc) next.description = desc;
    if (data.founded_year) {
      const yr = Number(data.founded_year);
      const current = new Date().getFullYear();
      if (!Number.isInteger(yr) || yr < 1800 || yr > current)
        next.founded_year = `Enter a valid year (1800–${current})`;
    }
    if (data.contact_email) {
      const email = validateEmail(data.contact_email);
      if (email) next.contact_email = email;
    }
    const website = validateUrl(data.website_url, "website URL");
    if (website) next.website_url = website;
    const linkedin = validateUrl(
      data.linkedin_url,
      "LinkedIn URL",
      "linkedin.com",
    );
    if (linkedin) next.linkedin_url = linkedin;
    return next;
  };

  const hydrate = (p: PartnerProfile) => {
    setLogo(p.logo);
    setCoverImage(p.cover_image);
    setInstitutionName(p.institution_name ?? "");
    setInstitutionType(p.institution_type ?? "");
    setForm({
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      address: p.address ?? "",
      founded_year: p.founded_year != null ? String(p.founded_year) : "",
      city: p.city ?? "",
      state: p.state ?? "",
      country: p.country ?? "",
      contact_email: p.contact_email ?? "",
      contact_phone: p.contact_phone ?? "",
      website_url: p.website_url ?? "",
      linkedin_url: p.linkedin_url ?? "",
    });
    setErrors({});
  };

  useEffect(() => {
    let active = true;
    getMyPartnerProfile()
      .then((data) => {
        if (!active) return;
        hydrate(data.profile);
      })
      .catch((err) => {
        notify.error(
          err instanceof ApiError ? err.detail : "Failed to load your profile.",
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

  const handleSave = async (section: "institution" | "contact") => {
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      notify.error("Please fix the highlighted fields.");
      return;
    }
    setSavingSection(section);
    try {
      const p = await updatePartnerProfile({
        tagline: form.tagline,
        description: form.description,
        address: form.address,
        founded_year: form.founded_year ? Number(form.founded_year) : null,
        city: form.city,
        state: form.state,
        country: form.country,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        website_url: form.website_url,
        linkedin_url: form.linkedin_url,
      });
      hydrate(p);
      notify.success("Profile updated.");
      setSavedSection(section);
      setTimeout(
        () => setSavedSection((s) => (s === section ? null : s)),
        2000,
      );
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.detail : "Failed to update profile.",
      );
    } finally {
      setSavingSection(null);
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify.error("Image must be 2MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const p = await updatePartnerImages({ logo: file });
      hydrate(p);
      notify.success("Logo updated.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.detail : "Failed to upload logo.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify.error("Image must be 2MB or smaller.");
      return;
    }
    setUploadingCover(true);
    try {
      const p = await updatePartnerImages({ cover_image: file });
      hydrate(p);
      notify.success("Cover image updated.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.detail : "Failed to upload cover image.",
      );
    } finally {
      setUploadingCover(false);
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

  const logoUrl = mediaUrl(logo);
  const coverUrl = mediaUrl(coverImage);

  return (
    <div className="space-y-4">
      {/* Banner: cover image with the logo overlapping its bottom-left */}
      <div className="bg-white border border-(--gray-200) rounded-2xl overflow-hidden">
        {/* Cover */}
        <div className="relative w-full h-40 sm:h-48 bg-(--gray-100)">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt="Cover"
              width={1600}
              height={400}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[13px] text-(--gray-400)">
              No cover image
            </div>
          )}
          {/* Cover edit button (top-right) */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            title="Upload cover image (JPG/PNG, max 2MB)"
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-(--gray-600) shadow-sm hover:bg-white hover:text-(--primary-700) transition-colors cursor-pointer disabled:opacity-60"
          >
            {uploadingCover ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleCoverSelect}
            className="hidden"
          />
        </div>

        {/* Logo overlapping the cover, with name/type beside it */}
        <div className="px-6 pb-5">
          <div className="flex items-end gap-4 -mt-10 sm:-mt-12">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-(--primary-100) text-(--primary-700) text-[24px] font-semibold flex items-center justify-center overflow-hidden ring-4 ring-white">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={institutionName || "Institution"}
                    width={96}
                    height={96}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initialsOf(institutionName)
                )}
              </div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploading}
                title="Upload logo (JPG/PNG, max 2MB)"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-(--primary-600) text-white flex items-center justify-center cursor-pointer hover:bg-(--primary-700) transition-colors disabled:opacity-60 ring-2 ring-white"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoSelect}
                className="hidden"
              />
            </div>
            <div className="pb-1 min-w-0">
              <p className="text-[16px] font-semibold text-(--text-title) truncate">
                {institutionName || "Your Institution"}
              </p>
              {institutionType && (
                <p className="text-[13px] text-(--gray-500)">
                  {INSTITUTION_TYPE_LABEL(institutionType)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Institution info */}
      <SectionCard
        title="Institution Information"
        description="This is displayed on your public institution profile."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Institution name">
            <Input icon={Building2} value={institutionName} disabled />
          </Field>
          <Field label="Institution type">
            <Input value={INSTITUTION_TYPE_LABEL(institutionType)} disabled />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:col-span-2">
            <Field label="Tagline" error={errors.tagline}>
              <Input
                value={form.tagline}
                onChange={set("tagline")}
                placeholder="e.g. Leading the future of tech education"
              />
            </Field>
            <Field label="Founded year" error={errors.founded_year}>
              <Input
                type="number"
                value={form.founded_year}
                onChange={set("founded_year")}
                placeholder="e.g. 1998"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description" error={errors.description}>
              <RichTextEditor
                value={form.description}
                onChange={(html) => {
                  setForm((f) => ({ ...f, description: html }));
                  setErrors((prev) => ({ ...prev, description: "" }));
                }}
                placeholder="Describe your institution…"
                minHeight="120px"
              />
            </Field>
          </div>
        </div>
        <div className="flex justify-start pt-2">
          <AsyncSaveButton
            onClick={() => handleSave("institution")}
            saving={savingSection === "institution"}
            saved={savedSection === "institution"}
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
          <div>
            <Field label="Address">
              <Input
                value={form.address}
                onChange={set("address")}
                placeholder="Street address"
              />
            </Field>
          </div>
        </div>
        <div className="flex justify-start pt-2">
          <AsyncSaveButton
            onClick={() => handleSave("institution")}
            saving={savingSection === "institution"}
            saved={savedSection === "institution"}
          />
        </div>
      </SectionCard>

      {/* Contact & links */}
      <SectionCard title="Contact & Links">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact email" error={errors.contact_email}>
            <Input
              icon={Mail}
              type="email"
              value={form.contact_email}
              onChange={set("contact_email")}
              placeholder="admissions@institution.edu"
            />
          </Field>
          <Field label="Contact phone">
            <Input
              icon={Phone}
              type="tel"
              value={form.contact_phone}
              onChange={set("contact_phone")}
              placeholder="+1-555-0123"
            />
          </Field>
          <Field label="Website" error={errors.website_url}>
            <Input
              icon={Globe}
              type="url"
              value={form.website_url}
              onChange={set("website_url")}
              placeholder="https://institution.edu"
            />
          </Field>
          <Field label="LinkedIn" error={errors.linkedin_url}>
            <Input
              value={form.linkedin_url}
              onChange={set("linkedin_url")}
              placeholder="https://linkedin.com/school/institution"
            />
          </Field>
        </div>
        <div className="flex justify-start pt-2">
          <AsyncSaveButton
            onClick={() => handleSave("contact")}
            saving={savingSection === "contact"}
            saved={savedSection === "contact"}
          />
        </div>
      </SectionCard>
    </div>
  );
}
