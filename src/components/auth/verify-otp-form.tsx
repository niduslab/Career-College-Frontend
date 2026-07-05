"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyOtp, resendOtp, type OtpPurpose } from "@/lib/auth-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const purpose = (searchParams.get("purpose") as OtpPurpose) ?? "registration";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleResend = async () => {
    if (!email) {
      setError("Missing email address. Please sign up again.");
      return;
    }
    setResending(true);
    setError("");
    try {
      await resendOtp(email, purpose);
      notify.success("A new code has been sent to your email.");
      setCountdown(RESEND_COUNTDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.detail
          : "Couldn't resend the code. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    if (!email) {
      setError("Missing email address. Please sign up again.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const data = await verifyOtp(email, code, purpose);
      if (purpose === "password_reset") {
        // Carry the email + reset_token forward to the reset-password step.
        const token = data.reset_token ?? "";
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
        );
      } else {
        notify.success("Email verified. You can now log in.");
        router.push("/login?verified=1");
      }
    } catch (err) {
      notify.error(
        err instanceof ApiError
          ? err.detail
          : "Verification failed. Please try again.",
      );
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-2xl border border-(--gray-200)">
      <h2 className="sg-h4 font-semibold text-(--text-title) mb-2">
        Verify Your Email
      </h2>
      <p className="sg-p-default text-(--gray-600) mb-1">
        We&apos;ve sent a 6-digit verification code to{" "}
        {email ? (
          <span className="font-semibold text-(--text-title)">{email}</span>
        ) : (
          "your email address"
        )}
        .
      </p>
      <p className="sg-p-default text-(--gray-600) mb-6">
        Enter the code below to continue.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Inputs */}
        <div>
          <div
            className="flex items-center gap-3 justify-between"
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-full h-12 lg:h-14 xl:h-18 md:h-16   text-center text-xl font-semibold rounded-lg border bg-white text-(--text-title) focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent transition-all ${
                  error
                    ? "border-red-400"
                    : digit
                      ? "border-(--primary-700)"
                      : "border-gray-200"
                }`}
              />
            ))}
          </div>
          {error && <p className="text-red-600 sg-caption mt-2">{error}</p>}
        </div>

        {/* Resend */}
        <div className="flex items-center justify-between sg-p-small text-(--gray-500)">
          <span>Didn&apos;t receive the code?</span>
          {countdown > 0 ? (
            <span className="text-(--gray-400)">
              Resend in{" "}
              <span className="font-semibold text-(--text-title)">
                {countdown}s
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-(--primary-700) hover:underline font-medium disabled:opacity-60"
            >
              <RotateCcw
                size={14}
                className={resending ? "animate-spin" : ""}
              />
              {resending ? "Sending…" : "Resend Code"}
            </button>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Verifying…" : "Verify Code"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href={purpose === "password_reset" ? "/forgot-password" : "/signup"}
          className="inline-flex items-center gap-2 sg-p-default text-(--gray-500) hover:text-(--text-title) transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </Link>
      </div>
    </div>
  );
}
