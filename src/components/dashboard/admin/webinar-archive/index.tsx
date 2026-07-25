"use client";

import { useState } from "react";
import { Archive, Loader2 } from "lucide-react";
import { useArchiveWebinar } from "@/hooks/use-admin-webinars";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";

export default function AdminWebinarArchiveContent() {
  const [webinarId, setWebinarId] = useState("");
  const archive = useArchiveWebinar();

  const handleArchive = () => {
    const id = Number(webinarId);
    if (!id || id <= 0) {
      notify.error("Enter a valid webinar id.");
      return;
    }
    archive.mutate(id, {
      onSuccess: (data) => {
        notify.success(`"${data.title}" archived.`);
        setWebinarId("");
      },
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to archive webinar."),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 max-w-md">
      <p className="text-[14px] font-semibold text-(--text-title)">Archive a Webinar</p>
      <p className="text-[12px] text-(--gray-500) mt-0.5 mb-4">
        Enter the webinar ID to archive it. Only published webinars can be archived.
      </p>

      <label className="block text-[12px] font-medium text-(--gray-600) mb-1.5">
        Webinar ID
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={webinarId}
          onChange={(e) => setWebinarId(e.target.value)}
          placeholder="e.g. 42"
          className="h-9 flex-1 px-3 rounded-lg border border-(--gray-200) text-[13px] text-(--text-title) placeholder:text-(--gray-400) focus:outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
        />
        <button
          onClick={handleArchive}
          disabled={archive.isPending}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium bg-(--primary-600) text-white hover:bg-(--primary-700) transition-colors cursor-pointer disabled:opacity-50"
        >
          {archive.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Archive className="w-4 h-4" />
          )}
          Archive
        </button>
      </div>
    </div>
  );
}
