"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldAlert, Wallet, History } from "lucide-react";
import {
  getMyPayoutAccount,
  saveMyPayoutAccount,
  getMyPayouts,
  PAYOUT_METHOD_OPTIONS,
  MOBILE_BANKING_PROVIDER_OPTIONS,
  type PayoutAccountFormData,
} from "@/lib/payouts-api";
import type { Payout, PayoutAccount } from "@/lib/admin-payouts-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { SelectDropdown } from "@/components/common/select-dropdown";
import { SectionCard, Field, Input, AsyncSaveButton } from "./ui";

const NAME_PATTERN = /^[A-Za-z\s&.']+$/;
const DIGITS_PATTERN = /^\d+$/;

/** Live-filter as the user types — strip anything that could never be valid. */
function nameOnly(value: string): string {
  return value.replace(/[^A-Za-z\s&.']/g, "");
}
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

const EMPTY_FORM: PayoutAccountFormData = {
  payout_method: "",
  bank_name: "",
  bank_account_number: "",
  bank_account_name: "",
  bank_routing_number: "",
  mobile_banking_provider: "",
  mobile_banking_number: "",
};

const STATUS_TONE: Record<Payout["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-600",
  paid: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<Payout["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

export function PayoutTab() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [form, setForm] = useState<PayoutAccountFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PayoutAccountFormData, string>>>({});

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyPayoutAccount()
      .then((a) => {
        setAccount(a);
        if (a) {
          setForm({
            payout_method: a.payout_method,
            bank_name: a.bank_name,
            bank_account_number: a.bank_account_number,
            bank_account_name: a.bank_account_name,
            bank_routing_number: a.bank_routing_number,
            mobile_banking_provider: a.mobile_banking_provider,
            mobile_banking_number: a.mobile_banking_number,
          });
        }
      })
      .catch((err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load your payout account.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    setPayoutsLoading(true);
    getMyPayouts()
      .then((res) => setPayouts(res.results))
      .catch(() => {})
      .finally(() => setPayoutsLoading(false));
  }, []);

  const handleSave = async () => {
    const nextErrors: typeof errors = {};
    if (!form.payout_method) nextErrors.payout_method = "Select a payout method.";
    if (form.payout_method === "bank_transfer") {
      if (!form.bank_name.trim()) {
        nextErrors.bank_name = "Bank name is required.";
      } else if (!NAME_PATTERN.test(form.bank_name.trim())) {
        nextErrors.bank_name = "Bank name can only contain letters, spaces, and & . '";
      }

      if (!form.bank_account_name.trim()) {
        nextErrors.bank_account_name = "Account holder name is required.";
      } else if (!NAME_PATTERN.test(form.bank_account_name.trim())) {
        nextErrors.bank_account_name = "Account holder name can only contain letters, spaces, and & . '";
      }

      if (!form.bank_account_number.trim()) {
        nextErrors.bank_account_number = "Account number is required.";
      } else if (!DIGITS_PATTERN.test(form.bank_account_number.trim())) {
        nextErrors.bank_account_number = "Account number can only contain digits.";
      }

      if (form.bank_routing_number.trim() && !DIGITS_PATTERN.test(form.bank_routing_number.trim())) {
        nextErrors.bank_routing_number = "Routing number can only contain digits.";
      }
    } else if (form.payout_method === "mobile_banking") {
      if (!form.mobile_banking_provider)
        nextErrors.mobile_banking_provider = "Select a provider.";
      if (!form.mobile_banking_number.trim()) {
        nextErrors.mobile_banking_number = "Mobile number is required.";
      } else if (!DIGITS_PATTERN.test(form.mobile_banking_number.trim())) {
        nextErrors.mobile_banking_number = "Mobile number can only contain digits.";
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      notify.error("Please fill in all required fields.");
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const saved = await saveMyPayoutAccount(form);
      setAccount(saved);
      notify.success("Payout account saved. An admin will verify it before your next payout.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors as typeof errors);
      }
      notify.error(err instanceof ApiError ? err.detail : "Failed to save payout account.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading your payout account…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {account && (
        <SectionCard title="Verification Status">
          <div className="flex items-center gap-2.5">
            {account.is_verified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium bg-emerald-50 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium bg-amber-50 text-amber-700">
                <ShieldAlert className="w-3.5 h-3.5" />
                Awaiting admin verification
              </span>
            )}
          </div>
          {!account.is_verified && (
            <p className="text-[13px] text-(--gray-500)">
              An admin needs to verify your payout details before you can receive a payout.
              Editing your details resets verification.
            </p>
          )}
        </SectionCard>
      )}

      <SectionCard
        title="Payout Method"
        description="Where your share of course revenue gets paid, after the platform commission."
      >
        <Field label="Payout method" required error={errors.payout_method}>
          <SelectDropdown
            value={form.payout_method}
            onChange={(v) => {
              setForm((f) => ({ ...f, payout_method: v as PayoutAccountFormData["payout_method"] }));
              setErrors((prev) => ({ ...prev, payout_method: undefined }));
            }}
            options={PAYOUT_METHOD_OPTIONS}
            placeholder="Select payout method"
          />
        </Field>

        {form.payout_method === "bank_transfer" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bank name" required error={errors.bank_name}>
              <Input
                value={form.bank_name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, bank_name: nameOnly(e.target.value) }));
                  setErrors((prev) => ({ ...prev, bank_name: undefined }));
                }}
                placeholder="e.g. City Bank"
                error={errors.bank_name}
              />
            </Field>
            <Field label="Account holder name" required error={errors.bank_account_name}>
              <Input
                value={form.bank_account_name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, bank_account_name: nameOnly(e.target.value) }));
                  setErrors((prev) => ({ ...prev, bank_account_name: undefined }));
                }}
                placeholder="Name on the account"
                error={errors.bank_account_name}
              />
            </Field>
            <Field label="Account number" required error={errors.bank_account_number}>
              <Input
                value={form.bank_account_number}
                onChange={(e) => {
                  setForm((f) => ({ ...f, bank_account_number: digitsOnly(e.target.value) }));
                  setErrors((prev) => ({ ...prev, bank_account_number: undefined }));
                }}
                placeholder="Account number"
                inputMode="numeric"
                error={errors.bank_account_number}
              />
            </Field>
            <Field label="Routing number (optional)" error={errors.bank_routing_number}>
              <Input
                value={form.bank_routing_number}
                onChange={(e) => {
                  setForm((f) => ({ ...f, bank_routing_number: digitsOnly(e.target.value) }));
                  setErrors((prev) => ({ ...prev, bank_routing_number: undefined }));
                }}
                placeholder="Routing / branch number"
                error={errors.bank_routing_number}
                inputMode="numeric"
              />
            </Field>
          </div>
        )}

        {form.payout_method === "mobile_banking" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Provider" required error={errors.mobile_banking_provider}>
              <SelectDropdown
                value={form.mobile_banking_provider}
                onChange={(v) => {
                  setForm((f) => ({
                    ...f,
                    mobile_banking_provider: v as PayoutAccountFormData["mobile_banking_provider"],
                  }));
                  setErrors((prev) => ({ ...prev, mobile_banking_provider: undefined }));
                }}
                options={MOBILE_BANKING_PROVIDER_OPTIONS}
                placeholder="Select provider"
              />
            </Field>
            <Field label="Mobile number" required error={errors.mobile_banking_number}>
              <Input
                value={form.mobile_banking_number}
                onChange={(e) => {
                  setForm((f) => ({ ...f, mobile_banking_number: digitsOnly(e.target.value) }));
                  setErrors((prev) => ({ ...prev, mobile_banking_number: undefined }));
                }}
                placeholder="e.g. 01XXXXXXXXX"
                error={errors.mobile_banking_number}
                inputMode="numeric"
              />
            </Field>
          </div>
        )}

        <div className="flex justify-start pt-2">
          <AsyncSaveButton onClick={handleSave} saving={saving} saved={saved} />
        </div>
      </SectionCard>

      <SectionCard title="Payout History">
        {payoutsLoading ? (
          <div className="flex items-center justify-center py-8 text-(--gray-400)">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-(--gray-400)">
            <History className="w-7 h-7" />
            <p className="text-[13px]">No payouts yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-(--gray-100)">
            {payouts.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-(--primary-50) text-(--primary-600) flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-(--text-title)">
                      {p.currency} {p.net_amount}
                    </p>
                    <p className="text-[12px] text-(--gray-400)">
                      {p.period_start} – {p.period_end}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_TONE[p.status]}`}
                >
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
