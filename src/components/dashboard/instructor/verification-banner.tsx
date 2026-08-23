"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Clock, X } from "lucide-react";
import { useInstructorVerificationStatus } from "@/hooks/use-instructor-verification-status";

const VERIFY_HREF = "/dashboard/instructor/settings?tab=verification";
const PROFILE_HREF = "/dashboard/instructor/settings?tab=profile";

/**
 * Dismissible nudge toward identity verification. Hidden once approved, or
 * once the instructor dismisses it for a given underlying status — a fresh
 * status (e.g. rejected after a resubmit) re-shows it.
 */
export default function VerificationBanner() {
  const { data, isLoading } = useInstructorVerificationStatus();
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  const verification = data?.verification;
  const missingFields = data?.missingProfileFields ?? [];

  if (isLoading || verification?.status === "approved") {
    return null;
  }

  // No verification request exists yet — treat it like an unstarted draft.
  const dismissKey = verification?.status ?? "none";
  if (dismissedFor === dismissKey) return null;

  const content = {
    none: {
      icon: ShieldAlert,
      style: "border-amber-200 bg-amber-50",
      iconStyle: "text-amber-600",
      title: "Get verified to publish your courses",
      body: "You can build courses now, but you'll need to complete identity verification before submitting one for review.",
      cta: "Start verification",
    },
    draft: {
      icon: ShieldAlert,
      style: "border-amber-200 bg-amber-50",
      iconStyle: "text-amber-600",
      title: "Finish your identity verification",
      body: "Your courses stay in draft until you're a verified instructor  submit your ID and profile details to unlock publishing.",
      cta: "Complete verification",
    },
    action_required: {
      icon: ShieldAlert,
      style: "border-amber-200 bg-amber-50",
      iconStyle: "text-amber-600",
      title: "Action needed on your verification",
      body:
        verification?.action_required_reason ||
        "The reviewer asked for a fix before your verification can proceed.",
      cta: "Review and resubmit",
    },
    rejected: {
      icon: ShieldAlert,
      style: "border-red-200 bg-red-50",
      iconStyle: "text-red-600",
      title: "Your verification was rejected",
      body:
        verification?.rejection_reason ||
        "Review the reason and resubmit your verification.",
      cta: "View details",
    },
    expired: {
      icon: ShieldAlert,
      style: "border-amber-200 bg-amber-50",
      iconStyle: "text-amber-600",
      title: "Your verification request expired",
      body: "Start a new verification request to become a verified instructor.",
      cta: "Start again",
    },
    submitted: {
      icon: Clock,
      style: "border-(--gray-200) bg-(--gray-50)",
      iconStyle: "text-(--gray-500)",
      title: "Verification submitted — waiting for review",
      body: "We'll notify you once an admin reviews your documents.",
      cta: "View status",
    },
    under_review: {
      icon: Clock,
      style: "border-(--gray-200) bg-(--gray-50)",
      iconStyle: "text-(--gray-500)",
      title: "Verification under review",
      body: "An admin is currently reviewing your documents.",
      cta: "View status",
    },
  }[dismissKey];

  if (!content) return null;

  const Icon = content.icon;
  const showChecklist =
    (dismissKey === "none" || dismissKey === "draft") &&
    data !== undefined &&
    data.totalProfileFields > 0;
  const doneCount = showChecklist
    ? data.totalProfileFields - missingFields.length
    : 0;

  return (
    <div className={`rounded-2xl border p-4 ${content.style}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${content.iconStyle}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-(--text-title)">
            {content.title}
          </p>
          <p className="text-[13px] text-(--gray-600) mt-0.5">{content.body}</p>
        </div>
        <button
          onClick={() => setDismissedFor(dismissKey)}
          aria-label="Dismiss"
          className="shrink-0 p-1 rounded-md text-(--gray-400) hover:text-(--gray-600) hover:bg-white/60 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showChecklist && (
        <div className="mt-3 pl-8">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-medium text-(--gray-600)">
              Profile checklist
            </span>
            <span className="text-[12px] font-medium text-(--gray-600)">
              {doneCount}/{data.totalProfileFields} done
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/70 overflow-hidden mb-2.5">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{
                width: `${(doneCount / data.totalProfileFields) * 100}%`,
              }}
            />
          </div>
          {missingFields.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {missingFields.map((field) => (
                <Link
                  key={field}
                  href={PROFILE_HREF}
                  className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {field}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 pl-8">
        <Link
          href={VERIFY_HREF}
          className="inline-flex items-center gap-1.5 px-4 h-9 text-[13px] font-semibold text-white bg-(--primary-600) hover:bg-(--primary-700) rounded-lg transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {content.cta}
        </Link>
      </div>
    </div>
  );
}
