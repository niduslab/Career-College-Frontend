"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  Radio,
  Search,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import gsap from "gsap";

import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/common/query-states";
import { useMyWebinars, useRegisterForWebinar, useWebinarCatalog } from "@/hooks/use-webinars";
import { ApiError } from "@/lib/api";
import { useCreateCheckoutSession } from "@/hooks/use-payments";
import { notify } from "@/lib/toast";
import type { WebinarSummary } from "@/lib/webinars-api";

/**
 * Webinars, not generic "sessions".
 *
 * Status is derived from `scheduled_at` + `duration_minutes` — the backend
 * has no live/recorded flag. There are no recordings either, so the third tab
 * is "Past", not "Recorded". Attendee counts, capacity bars and reminders are
 * gone: the catalog exposes `max_capacity` but no registered count, and there
 * is no reminder endpoint.
 */
type SessionStatus = "live" | "upcoming" | "past";

const TABS: { key: SessionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; dot: string; badge: string }
> = {
  live: {
    label: "Live Now",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-600 border border-rose-200",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  past: {
    label: "Past",
    dot: "bg-(--gray-400)",
    badge: "bg-(--gray-100) text-(--gray-500) border border-(--gray-200)",
  },
};

function deriveStatus(webinar: WebinarSummary): SessionStatus {
  const start = new Date(webinar.scheduled_at).getTime();
  const end = start + (webinar.duration_minutes ?? 60) * 60_000;
  const now = Date.now();
  if (now < start) return "upcoming";
  if (now <= end) return "live";
  return "past";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface CardProps {
  webinar: WebinarSummary;
  status: SessionStatus;
  /** Non-null when the learner has an active registration — this is the only
   *  path that carries a join link. */
  meetingUrl: string | null;
  isRegistered: boolean;
}

function SessionCard({ webinar, status, meetingUrl, isRegistered }: CardProps) {
  const cfg = STATUS_CONFIG[status];
  const price = Number(webinar.price);
  const isFree = price <= 0;

  const registerMutation = useRegisterForWebinar();
  const checkoutMutation = useCreateCheckoutSession();

  const startCheckout = () => {
    checkoutMutation.mutate(
      { webinar_slug: webinar.slug },
      {
        onSuccess: (session) => {
          window.location.href = session.gateway_url;
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Failed to start checkout.",
          ),
      },
    );
  };

  const handleRegister = () => {
    registerMutation.mutate(webinar.slug, {
      onSuccess: () => notify.success("You're registered."),
      onError: (err) => {
        // A paid webinar refuses free registration with 422 — that is the
        // cue to open checkout, same as the paid-course flow.
        if (!isFree && err instanceof ApiError && err.status === 422) {
          startCheckout();
          return;
        }
        notify.error(
          err instanceof ApiError ? err.message : "Couldn't register.",
        );
      },
    });
  };

  const busy = registerMutation.isPending || checkoutMutation.isPending;

  return (
    <div className="session-card opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}
          >
            {status === "live" ? (
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`}
                />
              </span>
            ) : (
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
            )}
            {cfg.label}
          </span>
          {webinar.category && (
            <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-(--primary-50) text-(--primary-600) border border-(--primary-100)">
              {webinar.category.name}
            </span>
          )}
          {isRegistered && (
            <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Registered
            </span>
          )}
        </div>

        {/* The join link only exists on the registrant payload. Unregistered
            learners get the register/buy path instead. */}
        {meetingUrl && status !== "past" ? (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-white text-[13px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${status === "live" ? "bg-rose-500 hover:bg-rose-600" : "bg-(--primary-600) hover:bg-(--primary-700)"}`}
          >
            {status === "live" ? (
              <Radio className="w-4 h-4" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            {status === "live" ? "Join Live" : "Join link"}
          </a>
        ) : !isRegistered && status !== "past" ? (
          <button
            onClick={handleRegister}
            disabled={busy}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-(--gray-200) text-(--gray-500) hover:border-(--primary-300) hover:text-(--primary-600) text-[13px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Calendar className="w-4 h-4" />
            {busy ? "Working…" : isFree ? "Register" : `Buy · ${webinar.price}`}
          </button>
        ) : null}
      </div>

      <div>
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-(--text-title) leading-snug mb-3 line-clamp-2">
          {webinar.title}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) font-normal">
            {webinar.host_expert?.full_name ??
              webinar.partner_institution?.institution_name ??
              "Career College"}
          </span>
        </div>
      </div>

      <div className="border-t border-(--gray-100)" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-1.5 text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
          <Calendar className="w-4 h-4 shrink-0 text-(--gray-400)" />
          {formatDate(webinar.scheduled_at)}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
          <Clock className="w-4 h-4 shrink-0 text-(--gray-400)" />
          {formatTime(webinar.scheduled_at)}
          {webinar.duration_minutes ? ` · ${webinar.duration_minutes} min` : ""}
        </span>
        <span className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-400)">
          {webinar.timezone}
        </span>
      </div>
    </div>
  );
}

export default function LiveSessionsPage() {
  const [activeTab, setActiveTab] = useState<SessionStatus | "all">("all");
  const [search, setSearch] = useState("");

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const {
    data: catalog,
    isLoading,
    isError,
    refetch,
  } = useWebinarCatalog({ page_size: 50 });
  const { data: myWebinars } = useMyWebinars();

  /** slug → meeting_url for the learner's active registrations. */
  const registrationsBySlug = useMemo(() => {
    const map = new Map<string, string>();
    (myWebinars?.results ?? [])
      .filter((registration) => registration.is_active)
      .forEach((registration) =>
        map.set(registration.webinar.slug, registration.webinar.meeting_url),
      );
    return map;
  }, [myWebinars]);

  const webinars = useMemo(() => catalog?.results ?? [], [catalog]);

  const withStatus = useMemo(
    () =>
      webinars.map((webinar) => ({ webinar, status: deriveStatus(webinar) })),
    [webinars],
  );

  const counts = useMemo(() => {
    const tally: Record<SessionStatus, number> = { live: 0, upcoming: 0, past: 0 };
    withStatus.forEach(({ status }) => {
      tally[status] += 1;
    });
    return tally;
  }, [withStatus]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return withStatus.filter(({ webinar, status }) => {
      const matchTab = activeTab === "all" || status === activeTab;
      const matchSearch =
        !query ||
        webinar.title.toLowerCase().includes(query) ||
        (webinar.host_expert?.full_name ?? "").toLowerCase().includes(query) ||
        (webinar.category?.name ?? "").toLowerCase().includes(query);
      return matchTab && matchSearch;
    });
  }, [withStatus, activeTab, search]);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll(".session-card"));
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power3.out" },
    );
  }, [activeTab, search, filtered.length]);

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
          Live Sessions
        </h1>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-1">
          Register for upcoming webinars and join the ones running now.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
                activeTab === tab.key
                  ? "bg-(--primary-600) text-white border-(--primary-600) font-medium"
                  : "bg-white text-(--gray-500) border-(--gray-200) hover:border-(--primary-300) font-normal"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span
                  className={`ml-1.5 text-[12px] font-semibold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-(--gray-100) text-(--gray-500)"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
          />
        </div>
      </div>

      <p className="text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {isLoading ? "—" : filtered.length}
        </span>{" "}
        session{filtered.length !== 1 ? "s" : ""}
      </p>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState title="Couldn't load sessions" onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Video className="w-6 h-6" />}
          title={
            webinars.length === 0
              ? "No sessions scheduled"
              : "No sessions found"
          }
          description={
            webinars.length === 0
              ? "Live webinars will appear here once an institution publishes one."
              : "Try a different keyword or tab."
          }
        />
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filtered.map(({ webinar, status }) => (
            <SessionCard
              key={webinar.id}
              webinar={webinar}
              status={status}
              meetingUrl={registrationsBySlug.get(webinar.slug) ?? null}
              isRegistered={registrationsBySlug.has(webinar.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
