"use client";

import { useEffect, useState } from "react";
import { Video, Loader2, AlertTriangle } from "lucide-react";
import { listWebinars, type Webinar } from "@/lib/webinar-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import WebinarCard from "./webinar-card";

interface FetchResult {
  webinars: Webinar[];
  error: string | null;
}

async function fetchWebinars(): Promise<FetchResult> {
  try {
    const res = await listWebinars(1, 100);
    return { webinars: res.results, error: null };
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "Failed to load webinars.";
    notify.error(message);
    return { webinars: [], error: message };
  }
}

export default function MyWebinarsPageContent() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    let active = true;
    fetchWebinars().then((result) => {
      if (!active) return;
      setWebinars(result.webinars);
      setError(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading webinars…
      </div>
    );
  }

  // The toast alone isn't enough — it disappears in a few seconds and used
  // to leave the page stuck on the spinner forever with nothing on screen
  // to explain why (e.g. an unverified instructor gets a 403 here).
  if (error) {
    return (
      <div className="bg-white border border-(--gray-200) rounded-2xl p-12 text-center">
        <AlertTriangle className="w-8 h-8 text-(--warning-500) mx-auto mb-2" />
        <p className="text-[14px] text-(--gray-500) mb-4">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="h-9 px-4 rounded-md border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (webinars.length === 0) {
    return (
      <div className="bg-white border border-(--gray-200) rounded-2xl p-12 text-center">
        <Video className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
        <p className="text-[14px] text-(--gray-500)">
          You aren&apos;t hosting any webinars yet. A partner institution assigns
          you as host from their side.
        </p>
      </div>
    );
  }

  const draft = webinars.filter((w) => w.status === "draft");
  const published = webinars.filter((w) => w.status === "published");
  const archived = webinars.filter((w) => w.status === "archived");

  const groups = [
    { label: "Ready to Publish", items: draft },
    { label: "Published", items: published },
    { label: "Archived", items: archived },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label} className="space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            {group.label}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.items.map((w) => (
              <WebinarCard key={w.id} webinar={w} onChanged={refresh} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
