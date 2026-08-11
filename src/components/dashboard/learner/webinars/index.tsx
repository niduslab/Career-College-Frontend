"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Calendar, Clock, Users, Video, ExternalLink } from "lucide-react";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";
import {
  useWebinarCatalog,
  useMyWebinars,
  useRegisterForWebinar,
} from "@/hooks/use-webinars";
import { useCreateCheckoutSession } from "@/hooks/use-payments";
import type { CatalogWebinar } from "@/lib/webinar-api";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import WebinarDetailDrawer from "./detail-drawer";

const PAGE_SIZE = 8;

function WebinarCard({
  webinar,
  isRegistered,
  meetingUrl,
  onRegisterChange,
  onOpenDetail,
}: {
  webinar: CatalogWebinar;
  isRegistered: boolean;
  meetingUrl: string | undefined;
  onRegisterChange: (slug: string) => void;
  onOpenDetail: (slug: string) => void;
}) {
  const price = Number(webinar.price);
  const isFree = price <= 0;
  const thumbnail = mediaUrl(webinar.thumbnail);
  const registerMutation = useRegisterForWebinar();
  const checkoutMutation = useCreateCheckoutSession();

  const startCheckout = () => {
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

  return (
    <div className="webinar-card opacity-0 bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <button
        type="button"
        onClick={() => onOpenDetail(webinar.slug)}
        className="relative h-40 overflow-hidden shrink-0 bg-(--gray-50) cursor-pointer w-full"
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={webinar.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--gray-300)">
            <Video className="w-8 h-8" />
          </div>
        )}
      </button>

      <div className="flex flex-col flex-1 p-4">
        <h3
          onClick={() => onOpenDetail(webinar.slug)}
          className="text-[14px] font-semibold text-(--text-title) leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-(--primary-600) transition-colors"
        >
          {webinar.title}
        </h3>

        <p className="text-[12px] text-(--gray-500) truncate mb-3">
          {webinar.partner_institution?.institution_name ?? "Career College"}
          {webinar.host_expert && ` · ${webinar.host_expert.full_name}`}
        </p>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {new Date(webinar.scheduled_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {webinar.duration_minutes} min
          </span>
          {webinar.max_capacity != null && (
            <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
              <Users className="w-3.5 h-3.5 shrink-0" />
              {webinar.max_capacity}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-(--gray-100) mt-auto">
          <span className="text-[16px] font-bold text-(--text-title)">
            {isFree ? "Free" : `BDT ${price.toFixed(2)}`}
          </span>
          {isRegistered ? (
            meetingUrl ? (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-(--primary-50) text-(--primary-600) text-[13px] font-semibold cursor-pointer border border-(--primary-100) hover:bg-(--primary-100) transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Join Link
              </a>
            ) : (
              <span className="text-[12px] font-medium text-emerald-600">
                Registered
              </span>
            )
          ) : (
            <button
              onClick={handleRegister}
              disabled={registerMutation.isPending || checkoutMutation.isPending}
              className="px-4 py-1.5 rounded-md bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-600) text-[14px] font-semibold transition-colors cursor-pointer border border-(--primary-100) disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkoutMutation.isPending
                ? "Redirecting..."
                : registerMutation.isPending
                  ? "Registering..."
                  : "Register"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WebinarsPageContent() {
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useWebinarCatalog({
    upcoming: upcomingOnly || undefined,
    page: currentPage,
    page_size: PAGE_SIZE,
  });

  const { data: myWebinarsData } = useMyWebinars();
  const [registerOverrides, setRegisterOverrides] = useState<Set<string>>(
    new Set(),
  );

  const registeredMeetingUrls = useMemo(() => {
    const map = new Map<string, string | undefined>();
    for (const reg of myWebinarsData?.results ?? []) {
      map.set(reg.webinar.slug, reg.webinar.meeting_url);
    }
    return map;
  }, [myWebinarsData]);

  const registeredSlugs = useMemo(() => {
    const set = new Set(registeredMeetingUrls.keys());
    for (const slug of registerOverrides) set.add(slug);
    return set;
  }, [registeredMeetingUrls, registerOverrides]);

  const handleRegisterChange = (slug: string) => {
    setRegisterOverrides((prev) => new Set(prev).add(slug));
  };

  const [detailSlug, setDetailSlug] = useState<string | null>(null);

  const webinars = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll(".webinar-card"));
    gsap.killTweensOf(cards);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power3.out" },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [upcomingOnly, currentPage, webinars.length]);

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
          Webinars
        </h1>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-1">
          Live sessions hosted by partner institutions — register to get the join link.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setUpcomingOnly(true);
            setCurrentPage(1);
          }}
          className={`h-10 px-4 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
            upcomingOnly
              ? "bg-(--primary-600) text-white"
              : "bg-white border border-(--gray-200) text-(--gray-600) hover:bg-(--gray-50)"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => {
            setUpcomingOnly(false);
            setCurrentPage(1);
          }}
          className={`h-10 px-4 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
            !upcomingOnly
              ? "bg-(--primary-600) text-white"
              : "bg-white border border-(--gray-200) text-(--gray-600) hover:bg-(--gray-50)"
          }`}
        >
          All
        </button>
      </div>

      <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">{data?.count ?? 0}</span>{" "}
        webinars
      </p>

      {isError ? (
        <div className="py-16 text-center text-(--gray-400)">
          <p className="text-[16px] font-medium text-rose-500">
            Failed to load webinars
          </p>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] mt-1">
            Please try again in a moment.
          </p>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
        >
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-2xl border border-(--gray-200) bg-(--gray-50) animate-pulse"
                />
              ))
            : webinars.map((webinar) => (
                <WebinarCard
                  key={webinar.id}
                  webinar={webinar}
                  isRegistered={registeredSlugs.has(webinar.slug)}
                  meetingUrl={registeredMeetingUrls.get(webinar.slug)}
                  onRegisterChange={handleRegisterChange}
                  onOpenDetail={setDetailSlug}
                />
              ))}
          {!isLoading && webinars.length === 0 && (
            <div className="col-span-full py-16 text-center text-(--gray-400)">
              <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-[16px] font-medium">No webinars found</p>
              <p className="text-[12px] md:text-[14px] lg:text-[14px] mt-1">
                Check back later for new live sessions.
              </p>
            </div>
          )}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <WebinarDetailDrawer
        slug={detailSlug}
        onClose={() => setDetailSlug(null)}
        isRegistered={detailSlug ? registeredSlugs.has(detailSlug) : false}
        meetingUrl={detailSlug ? registeredMeetingUrls.get(detailSlug) : undefined}
        onRegisterChange={handleRegisterChange}
      />
    </div>
  );
}
