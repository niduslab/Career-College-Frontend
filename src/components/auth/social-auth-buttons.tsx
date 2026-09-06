"use client";

import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa6";

interface SocialAuthButtonsProps {
  onGoogleClick: () => void;
  /** Disables Google only — institutions must sign up with email. */
  googleDisabled?: boolean;
  /** Shown under the buttons when Google is disabled. */
  googleDisabledNote?: string;
  /** Login uses h-11, signup h-12. */
  size?: "sm" | "md";
}

/**
 * The "or continue with social" block shared by the login and signup forms.
 * Each button is rendered twice — stacked on mobile, side by side on desktop.
 * LinkedIn is not wired up yet.
 */
export function SocialAuthButtons({
  onGoogleClick,
  googleDisabled = false,
  googleDisabledNote,
  size = "sm",
}: SocialAuthButtonsProps) {
  const height = size === "md" ? "h-12" : "h-11";
  const base = `${height} flex items-center justify-center gap-2 rounded-lg border border-(--gray-300) bg-(--text-white) text-(--text-title) font-medium hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--text-white)`;

  const google = (fullWidth: boolean) => (
    <button
      type="button"
      onClick={onGoogleClick}
      disabled={googleDisabled}
      className={`${fullWidth ? "w-full " : ""}${base}`}
    >
      <FcGoogle size={20} />
      Google
    </button>
  );

  const linkedin = (fullWidth: boolean) => (
    <button type="button" className={`${fullWidth ? "w-full " : ""}${base}`}>
      <FaLinkedin size={20} className="text-blue-600" />
      LinkedIn
    </button>
  );

  return (
    <>
      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-(--gray-200)"></div>
        <span className="sg-p-small text-(--gray-500)">
          or continue with social
        </span>
        <div className="flex-1 h-px bg-(--gray-200)"></div>
      </div>

      <div className="space-y-3 mb-6">
        {/* Mobile & Tablet — stacked */}
        <div className="md:hidden space-y-3">
          {google(true)}
          {linkedin(true)}
        </div>

        {/* Desktop & Large Devices — inline */}
        <div className="hidden md:grid md:grid-cols-2 gap-3">
          {google(false)}
          {linkedin(false)}
        </div>

        {googleDisabled && googleDisabledNote && (
          <p className="sg-p-small text-(--gray-500)">{googleDisabledNote}</p>
        )}
      </div>
    </>
  );
}
