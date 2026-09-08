"use client";

import { useState } from "react";
import { Archive, Loader2, Search, AlertTriangle, Video } from "lucide-react";
import { useArchiveWebinar } from "@/hooks/use-admin-webinars";
import { getWebinar, type Webinar } from "@/lib/webinar-api";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; webinar: Webinar }
  | { status: "not-found" };

const STATUS_TONE: Record<Webinar["status"], string> = {
  draft: "bg-(--gray-100) text-(--gray-600)",
  published: "bg-emerald-50 text-emerald-700",
  archived: "bg-(--gray-100) text-(--gray-500)",
};

export default function AdminWebinarArchiveContent() {
  const [webinarId, setWebinarId] = useState("");
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
  const archive = useArchiveWebinar();

  const parsedId = Number(webinarId);
  const isValidId = webinarId.trim() !== "" && parsedId > 0;

  const handleLookup = () => {
    if (!isValidId) {
      notify.error("Enter a valid webinar id.");
      return;
    }
    setLookup({ status: "loading" });
    getWebinar(parsedId)
      .then((webinar) => setLookup({ status: "found", webinar }))
      .catch(() => setLookup({ status: "not-found" }));
  };

  const handleArchive = () => {
    if (!isValidId) {
      notify.error("Enter a valid webinar id.");
      return;
    }
    archive.mutate(parsedId, {
      onSuccess: (data) => {
        notify.success(`"${data.title}" archived.`);
        setWebinarId("");
        setLookup({ status: "idle" });
      },
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to archive webinar."),
    });
  };

  const canArchive =
    lookup.status !== "found" || lookup.webinar.status === "published";

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 max-w-md shadow-sm hover:shadow-lg transition-shadow duration-200">
      <p className="text-[14px] font-semibold text-(--text-title)">Archive a Webinar</p>
      <p className="text-[12px] text-(--gray-500) mt-0.5 mb-4">
        Don&apos;t know the webinar ID? Find it on the{" "}
        <span className="font-medium text-(--text-title)">Webinars</span> table for the
        relevant partner or instructor — it appears in that webinar&apos;s detail page URL.
        Look it up here first to confirm you have the right one before archiving.
      </p>

      <label className="block text-[12px] font-medium text-(--gray-600) mb-1.5">
        Webinar ID
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={webinarId}
          onChange={(e) => {
            setWebinarId(e.target.value);
            setLookup({ status: "idle" });
          }}
          placeholder="e.g. 42"
          className="h-9 flex-1 px-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
        />
        <button
          onClick={handleLookup}
          disabled={lookup.status === "loading" || !isValidId}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium text-(--gray-600) border border-(--gray-200) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {lookup.status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Look up
        </button>
      </div>

      {lookup.status === "found" && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-(--gray-200) bg-(--gray-50) p-3">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-(--primary-500) to-(--primary-600) text-white flex items-center justify-center shrink-0 shadow-sm">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-(--text-title) truncate">
              {lookup.webinar.title}
            </p>
            <p className="text-[11px] text-(--gray-500) truncate">
              {lookup.webinar.host_expert?.full_name ?? "No host assigned"}
            </p>
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize ${STATUS_TONE[lookup.webinar.status]}`}
          >
            {lookup.webinar.status}
          </span>
        </div>
      )}

      {lookup.status === "not-found" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-[12px] text-amber-700">
            No webinar found with that ID — double-check the number before archiving.
          </p>
        </div>
      )}

      {lookup.status === "found" && lookup.webinar.status !== "published" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-[12px] text-amber-700">
            Only published webinars can be archived — this one is {lookup.webinar.status}.
          </p>
        </div>
      )}

      <button
        onClick={handleArchive}
        disabled={archive.isPending || !isValidId || !canArchive}
        className="mt-4 w-full flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium bg-linear-to-br from-(--primary-600) to-(--primary-700) hover:from-(--primary-700) hover:to-(--primary-900) text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {archive.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Archive className="w-4 h-4" />
        )}
        Archive{lookup.status === "found" ? ` "${lookup.webinar.title}"` : ""}
      </button>
    </div>
  );
}
