"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { SignatureUpload } from "@/components/common/signature-upload";
import {
  getPlatformSettings,
  updatePlatformSettings,
  updatePlatformSignature,
  type PlatformSettings,
} from "@/lib/platform-settings-api";
import { SectionCard, Field, Input, AsyncSaveButton } from "../../settings-shared/ui";

/**
 * The platform's default certificate signatory.
 *
 * Used on certificates for every course that is not institution-owned; an
 * institution that has configured its own signatory overrides it. Unlike the
 * rest of this settings page, this section is backed by a real endpoint.
 */
export function CertificateSignatorySection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [form, setForm] = useState({
    organization_name: "",
    authorized_signatory_name: "",
    authorized_signatory_designation: "",
  });

  const hydrate = (s: PlatformSettings) => {
    setSignature(s.authorized_signature ?? null);
    setForm({
      organization_name: s.organization_name ?? "",
      authorized_signatory_name: s.authorized_signatory_name ?? "",
      authorized_signatory_designation:
        s.authorized_signatory_designation ?? "",
    });
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await getPlatformSettings();
        if (active) hydrate(s);
      } catch (err) {
        if (active)
          notify.error(
            err instanceof ApiError
              ? err.message
              : "Failed to load platform settings.",
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    if (!form.organization_name.trim()) {
      notify.error("Organization name cannot be blank.");
      return;
    }
    setSaving(true);
    try {
      hydrate(await updatePlatformSettings(form));
      notify.success("Platform settings updated.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SectionCard title="Certificate Signatory">
        <div className="flex items-center py-6 text-(--gray-500)">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading settings…
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Certificate Signatory"
      description="Printed on certificates for courses that are not owned by a partner institution. Institutions with their own signatory configured use theirs instead."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Issuing organization">
          <Input
            icon={Building2}
            value={form.organization_name}
            onChange={set("organization_name")}
            placeholder="Career College"
          />
        </Field>
        <Field label="Signatory name">
          <Input
            value={form.authorized_signatory_name}
            onChange={set("authorized_signatory_name")}
            placeholder="e.g. John Doe"
          />
        </Field>
        <Field label="Designation">
          <Input
            value={form.authorized_signatory_designation}
            onChange={set("authorized_signatory_designation")}
            placeholder="e.g. Academic Director"
          />
        </Field>
      </div>

      <div className="pt-4">
        <SignatureUpload
          value={signature}
          label="Authorized signature"
          onUpload={async (file) => {
            hydrate(await updatePlatformSignature(file));
          }}
        />
      </div>

      <div className="flex justify-start pt-2">
        <AsyncSaveButton onClick={handleSave} saving={saving} saved={saved} />
      </div>
    </SectionCard>
  );
}
