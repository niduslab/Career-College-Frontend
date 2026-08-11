"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Video,
  Calendar,
  Clock,
  Users,
  Building2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useWebinarDetail, useRegisterForWebinar } from "@/hooks/use-webinars";
import { useCreateCheckoutSession } from "@/hooks/use-payments";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface DetailDrawerProps {
  slug: string | null;
  onClose: () => void;
  isRegistered: boolean;
  meetingUrl: string | undefined;
  onRegisterChange: (slug: string) => void;
}

export default function WebinarDetailDrawer({
  slug,
  onClose,
  isRegistered,
  meetingUrl,
  onRegisterChange,
}: DetailDrawerProps) {
  const open = !!slug;
  const { data: webinar, isLoading } = useWebinarDetail(slug ?? undefined);
  const registerMutation = useRegisterForWebinar();
  const checkoutMutation = useCreateCheckoutSession();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const price = webinar ? Number(webinar.price) : 0;
  const isFree = price <= 0;

  const startCheckout = () => {
    if (!webinar) return;
    checkoutMutation.mutate(
      { webinar_slug: webinar.slug },
      {
        onSuccess: (session) => {
          window.location.href = session.gateway_url;
        },
        onError: (err) => {
          notify.error(
            err instanceof ApiError ? err.message : "Failed to start checkout.",
          );
        },
      },
    );
  };

  const handleRegister = () => {
    if (!webinar) return;
    registerMutation.mutate(webinar.slug, {
      onSuccess: (res) => {
        onRegisterChange(webinar.slug);
        notify.success(res.message ?? "Registered successfully.");
      },
      onError: (err) => {
        if (!isFree && err instanceof ApiError && err.status === 422) {
          startCheckout();
          return;
        }
        notify.error(
          err instanceof ApiError ? err.message : "Failed to register.",
        );
      },
    });
  };

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-100 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white z-101 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--gray-200) shrink-0">
          <p className="text-[15px] font-semibold text-(--text-title)">
            Webinar Details
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-500) cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading || !webinar ? (
            <div className="flex items-center justify-center py-20 text-(--gray-500)">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : (
            <div className="px-6 py-5 space-y-5">
              <div className="relative h-44 rounded-xl overflow-hidden bg-(--gray-50)">
                {webinar.thumbnail ? (
                  <Image
                    src={mediaUrl(webinar.thumbnail) as string}
                    alt={webinar.title}
                    fill
                    sizes="512px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-(--gray-300)">
                    <Video className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-[18px] font-semibold text-(--text-title) leading-snug">
                  {webinar.title}
                </h2>
                <p className="text-[13px] text-(--gray-500) mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {webinar.partner_institution?.institution_name ?? "Career College"}
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap text-[13px] text-(--gray-600)">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-(--gray-400)" />
                  {new Date(webinar.scheduled_at).toLocaleString()} ({webinar.timezone})
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-(--gray-400)" />
                  {webinar.duration_minutes} min
                </span>
                {webinar.max_capacity != null && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-(--gray-400)" />
                    Max {webinar.max_capacity}
                  </span>
                )}
              </div>

              <div>
                <p className="text-[13px] font-semibold text-(--text-title) mb-1.5">
                  About this webinar
                </p>
                <p className="text-[13px] text-(--gray-600) leading-relaxed whitespace-pre-line">
                  {webinar.description || "No description provided."}
                </p>
              </div>

              {webinar.host_expert && (
                <div>
                  <p className="text-[13px] font-semibold text-(--text-title) mb-2">
                    Host
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-(--primary-50) flex items-center justify-center shrink-0 text-[13px] font-semibold text-(--primary-600)">
                      {webinar.host_expert.full_name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[13px] font-medium text-(--text-title)">
                      {webinar.host_expert.full_name}
                    </p>
                  </div>
                </div>
              )}

              {webinar.institutional_speakers.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-(--text-title) mb-2">
                    Speakers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {webinar.institutional_speakers.map((speaker) => (
                      <span
                        key={speaker.id}
                        className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-(--gray-100) text-(--gray-600)"
                      >
                        {speaker.full_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {webinar.guest_speakers.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-(--text-title) mb-2">
                    Guest Speakers
                  </p>
                  <div className="space-y-2">
                    {webinar.guest_speakers.map((guest, i) => (
                      <div key={i}>
                        <p className="text-[13px] font-medium text-(--text-title)">
                          {guest.full_name}
                        </p>
                        {guest.title && (
                          <p className="text-[12px] text-(--gray-500)">{guest.title}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {webinar && (
          <div className="px-6 py-4 border-t border-(--gray-200) flex items-center justify-between gap-3 shrink-0">
            <span className="text-[18px] font-bold text-(--text-title)">
              {isFree ? "Free" : `BDT ${price.toFixed(2)}`}
            </span>
            {isRegistered ? (
              meetingUrl ? (
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-(--primary-700) text-white text-[13px] font-semibold hover:bg-(--primary-600) transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Link
                </a>
              ) : (
                <span className="text-[13px] font-medium text-emerald-600">
                  Registered
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                disabled={registerMutation.isPending || checkoutMutation.isPending}
                className="flex items-center gap-1.5 h-10 px-5 rounded-lg bg-(--primary-700) text-white text-[14px] font-semibold hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
              >
                {(registerMutation.isPending || checkoutMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {checkoutMutation.isPending
                  ? "Redirecting…"
                  : registerMutation.isPending
                    ? "Registering…"
                    : "Register"}
              </button>
            )}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
