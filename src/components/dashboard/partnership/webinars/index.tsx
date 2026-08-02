"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Sparkles, Video, Plus } from "lucide-react";
import gsap from "gsap";
import WebinarsStatsCards from "./stats-cards";
import WebinarsTable from "./table";
import { TIPS } from "./data";
import { listWebinars } from "@/lib/webinar-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { Webinar, WebinarStatus } from "./types";

const AddWebinarDrawer = dynamic(() => import("./add-drawer"), { ssr: false });

const STATUS_ROW_LABEL: Record<WebinarStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const STATUS_BAR: Record<WebinarStatus, string> = {
  draft: "bg-gray-400",
  published: "bg-green-500",
  archived: "bg-orange-400",
};

const STATUS_TEXT: Record<WebinarStatus, string> = {
  draft: "text-gray-500",
  published: "text-green-600",
  archived: "text-orange-500",
};

async function fetchWebinars(): Promise<Webinar[] | null> {
  try {
    const res = await listWebinars(1, 100);
    return res.results;
  } catch (err) {
    notify.error(err instanceof ApiError ? err.message : "Failed to load webinars.");
    return null;
  }
}

export default function WebinarsPageContent() {
  const router = useRouter();
  const breakdownRef = useRef<(HTMLDivElement | null)[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    let active = true;
    fetchWebinars().then((result) => {
      if (!active || !result) return;
      setWebinars(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const upcomingPublished = [...webinars]
    .filter((w) => w.status === "published")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5);

  const statusBreakdown = (Object.keys(STATUS_ROW_LABEL) as WebinarStatus[]).map((st) => ({
    status: st,
    count: webinars.filter((w) => w.status === st).length,
  }));

  useEffect(() => {
    breakdownRef.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { width: "0%" },
        { width: `${el.dataset.progress}%`, duration: 0.8, delay: 0.5, ease: "power3.out" },
      );
    });
  }, [statusBreakdown]);

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* Left */}
      <div className="flex-1 min-w-0 space-y-5">
        <WebinarsStatsCards webinars={webinars} />
        <WebinarsTable webinars={webinars} loading={loading} onRefresh={refresh} />
      </div>

      {/* Right sidebar */}
      <div className="w-full xl:w-60 2xl:w-72 shrink-0 space-y-4">
        {/* Upcoming */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Upcoming Webinars
          </p>
          {upcomingPublished.length === 0 ? (
            <p className="text-[12px] text-(--gray-400)">No upcoming published webinars.</p>
          ) : (
            <div className="space-y-2.5">
              {upcomingPublished.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/partnership/webinars/${w.id}`)}
                  className="w-full flex items-center gap-3 text-left cursor-pointer hover:bg-(--gray-50) rounded-lg px-1.5 py-1 -mx-1.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-(--gray-100) flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-(--gray-400)" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-(--text-title) truncate leading-snug">
                      {w.title}
                    </p>
                    <p className="text-[11px] text-(--gray-400)">
                      {new Date(w.scheduled_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Status Breakdown
          </p>
          <div className="space-y-2">
            {statusBreakdown.map(({ status, count }, i) => {
              const pct = webinars.length > 0 ? Math.round((count / webinars.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-[11px] text-(--gray-600) w-16 shrink-0 truncate">
                    {STATUS_ROW_LABEL[status]}
                  </span>
                  <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      ref={(el) => { breakdownRef.current[i] = el; }}
                      data-progress={pct}
                      className={`h-full rounded-full ${STATUS_BAR[status]}`}
                      style={{ width: "0%" }}
                    />
                  </div>
                  <span className={`text-[12px] font-semibold ${STATUS_TEXT[status]} w-8 text-right shrink-0`}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-600)" />
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Webinar Tips
            </p>
          </div>
          <div className="space-y-2.5">
            {TIPS.map(({ color, text }) => (
              <div key={text} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color.replace("text-", "bg-")}`} />
                <p className="text-[12px] text-(--gray-500) leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
