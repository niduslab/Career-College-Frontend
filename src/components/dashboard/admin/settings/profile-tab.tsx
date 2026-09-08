"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User, Mail, Phone, Camera, Loader2 } from "lucide-react";
import {
  getMyAdminProfile,
  updateAdminProfile,
  updateAdminPhoto,
  type MyAdminProfileResponse,
} from "@/lib/profile-api";
import { SectionCard, Field, Input, AsyncSaveButton } from "../../settings-shared/ui";
import { mediaUrl, initialsOf } from "../../settings-shared/helpers";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { notifyProfileUpdated } from "@/lib/profile-events";
import { CertificateSignatorySection } from "./certificate-signatory-section";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<MyAdminProfileResponse["user"] | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const hydrate = (res: MyAdminProfileResponse) => {
    setUser(res.user);
    setPhoto(res.profile.profile_photo);
    setPhone(res.profile.phone ?? "");
  };

  useEffect(() => {
    let active = true;
    getMyAdminProfile()
      .then((res) => {
        if (active) hydrate(res);
      })
      .catch((err) =>
        notify.error(err instanceof ApiError ? err.message : "Failed to load profile."),
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      notify.error("Photo must be 2MB or smaller.");
      return;
    }
    setUploading(true);
    updateAdminPhoto(file)
      .then((profile) => {
        setPhoto(profile.profile_photo);
        notifyProfileUpdated();
        notify.success("Profile photo updated.");
      })
      .catch((err) =>
        notify.error(err instanceof ApiError ? err.message : "Failed to upload photo."),
      )
      .finally(() => setUploading(false));
  };

  const handleSave = () => {
    setSaving(true);
    updateAdminProfile({ phone })
      .then((profile) => {
        setPhone(profile.phone ?? "");
        notify.success("Profile updated.");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      })
      .catch((err) =>
        notify.error(err instanceof ApiError ? err.message : "Failed to save profile."),
      )
      .finally(() => setSaving(false));
  };

  const photoUrl = mediaUrl(photo);

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <SectionCard title="Profile Photo">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-18 h-18 rounded-full bg-(--primary-100) text-(--primary-700) text-[22px] font-bold flex items-center justify-center shrink-0 overflow-hidden">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : photoUrl ? (
                <Image
                  src={photoUrl}
                  alt=""
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
              disabled={uploading || loading}
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
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>
          <div>
            <p className="text-[14px] font-medium text-(--text-title)">
              {loading ? "Loading…" : (user?.full_name ?? "—")}
            </p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">JPG, PNG or WEBP, max 2MB</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
              className="mt-2 text-[12px] font-medium text-(--primary-600) hover:underline cursor-pointer disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload new photo"}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Basic info */}
      <SectionCard
        title="Basic Information"
        description="Name and email are managed at the account level."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input icon={User} value={loading ? "" : (user?.full_name ?? "")} disabled />
          </Field>
          <Field label="Email">
            <Input icon={Mail} value={loading ? "" : (user?.email ?? "")} disabled />
          </Field>
          <Field label="Phone">
            <Input
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +880 1XXX-XXXXXX"
              disabled={loading}
            />
          </Field>
        </div>
        <div className="flex justify-start pt-2">
          <AsyncSaveButton onClick={handleSave} saving={saving} saved={saved} />
        </div>
      </SectionCard>

      <CertificateSignatorySection />
    </div>
  );
}
