"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Video,
  Users,
  Loader2,
  Send,
  Archive,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import {
  publishWebinar,
  archiveWebinar,
  reworkWebinar,
  type Webinar,
} from "@/lib/webinar-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { mediaUrl } from "@/components/dashboard/settings-shared/helpers";

interface WebinarCardProps {
  webinar: Webinar;
  onChanged: () => void;
}

const STATUS_STYLES: Record<Webinar["status"], string> = {
  draft: "text-gray-500 bg-gray-50 border-gray-200",
  published: "text-green-600 bg-green-50 border-green-200",
  archived: "text-orange-500 bg-orange-50 border-orange-200",
};

const STATUS_LABEL: Record<Webinar["status"], string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export default function WebinarCard({ webinar, onChanged }: WebinarCardProps) {
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<{ message?: string }>, successMsg: string) => {
    setBusy(true);
    try {
      const { message } = await fn();
      notify.success(message ?? successMsg);
      onChanged();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-(--gray-100) flex items-center justify-center">
          {webinar.thumbnail ? (
            <Image
              src={mediaUrl(webinar.thumbnail) as string}
              alt={webinar.title}
              width={48}
              height={48}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <Video className="w-5 h-5 text-(--gray-400)" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-semibold text-(--text-title) truncate">
              {webinar.title}
            </p>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[webinar.status]}`}
            >
              {STATUS_LABEL[webinar.status]}
            </span>
          </div>
          <p className="text-[12px] text-(--gray-500) mt-0.5">
            {webinar.partner_institution?.institution_name ?? "Unknown institution"}
          </p>
        </div>
      </div>

      <p className="text-[12px] text-(--gray-600) line-clamp-2">
        {webinar.description || "No description yet."}
      </p>

      <div className="flex items-center gap-3 text-[12px] text-(--gray-500)">
        <span>{new Date(webinar.scheduled_at).toLocaleString()}</span>
        <span>·</span>
        <span>{webinar.duration_minutes} min</span>
        {webinar.max_capacity != null && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {webinar.max_capacity}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {webinar.status === "draft" && (
          <button
            type="button"
            onClick={() => run(() => publishWebinar(webinar.id), "Webinar published.")}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publish
          </button>
        )}

        {webinar.status === "published" && (
          <>
            {webinar.meeting_url && (
              <a
                href={webinar.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Join Link
              </a>
            )}
            <button
              type="button"
              onClick={() => run(() => archiveWebinar(webinar.id), "Webinar archived.")}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
              Archive
            </button>
          </>
        )}

        {webinar.status === "archived" && (
          <button
            type="button"
            onClick={() => run(() => reworkWebinar(webinar.id), "Webinar moved back to draft.")}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Rework
          </button>
        )}
      </div>
    </div>
  );
}
