"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Video } from "lucide-react";
import Image from "next/image";
import { getWebinar } from "@/lib/webinar-api";
import type { Webinar } from "@/lib/webinar-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";
import WebinarStatusBadge from "../status-badge";
import MetadataForm from "./metadata-form";
import HostPanel from "./host-panel";
import SpeakersPanel from "./speakers-panel";
import StatusActions from "./status-actions";

export default function WebinarDetailPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const webinarPk = Number(params.id);

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    if (!Number.isFinite(webinarPk)) return;
    let active = true;
    getWebinar(webinarPk)
      .then((w) => {
        if (active) setWebinar(w);
      })
      .catch((err) => {
        if (!active) return;
        notify.error(err instanceof ApiError ? err.message : "Failed to load webinar.");
        setWebinar(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [webinarPk, refreshKey]);

  if (!Number.isFinite(webinarPk)) {
    return <p className="text-[14px] text-(--gray-500)">Invalid webinar id.</p>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading webinar…
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard/partnership/webinars")}
          className="flex items-center gap-1.5 text-[13px] font-medium text-(--gray-600) hover:text-(--text-title) cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Webinars
        </button>
        <div className="bg-white border border-(--gray-200) rounded-2xl p-12 text-center">
          <Video className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
          <p className="text-[14px] text-(--gray-500)">Webinar not found.</p>
        </div>
      </div>
    );
  }

  const editable = webinar.status === "draft" || webinar.status === "archived";

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => router.push("/dashboard/partnership/webinars")}
        className="flex items-center gap-1.5 text-[13px] font-medium text-(--gray-600) hover:text-(--text-title) cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Webinars
      </button>

      {/* Header */}
      <div className="bg-white border border-(--gray-200) rounded-2xl p-5 flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-(--gray-100) flex items-center justify-center">
          {webinar.thumbnail ? (
            <Image
              src={mediaUrl(webinar.thumbnail) as string}
              alt={webinar.title}
              width={64}
              height={64}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <Video className="w-6 h-6 text-(--gray-400)" />
          )}
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[18px] lg:text-[20px] font-semibold text-(--text-title) truncate">
              {webinar.title}
            </h1>
            <WebinarStatusBadge status={webinar.status} />
          </div>
          <p className="text-[13px] text-(--gray-500)">
            {new Date(webinar.scheduled_at).toLocaleString()} ({webinar.timezone}) ·{" "}
            {webinar.duration_minutes} min ·{" "}
            {Number(webinar.price) > 0 ? `BDT ${webinar.price}` : "Free"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <MetadataForm webinar={webinar} editable={editable} onChanged={refresh} />
          <SpeakersPanel webinar={webinar} editable={editable} onChanged={refresh} />
        </div>

        <div className="space-y-5">
          <HostPanel webinar={webinar} editable={editable} onChanged={refresh} />
          <StatusActions webinar={webinar} onChanged={refresh} />
        </div>
      </div>
    </div>
  );
}
