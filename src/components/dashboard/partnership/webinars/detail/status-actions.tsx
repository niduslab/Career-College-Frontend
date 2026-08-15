"use client";

import { useState } from "react";
import { Loader2, Archive, RotateCcw } from "lucide-react";
import { archiveWebinar, reworkWebinar, type Webinar } from "@/lib/webinar-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface StatusActionsProps {
  webinar: Webinar;
  onChanged: () => void;
}

export default function StatusActions({ webinar, onChanged }: StatusActionsProps) {
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
    <div className="bg-white border border-(--gray-200) rounded-2xl p-5 space-y-3">
      <p className="text-[14px] font-semibold text-(--text-title)">Status</p>

      {webinar.status === "draft" && (
        <p className="text-[13px] text-(--gray-500)">
          {webinar.host_expert
            ? "Waiting on the assigned host to publish this webinar."
            : "Assign a host before this webinar can be published."}
        </p>
      )}

      {webinar.status === "published" && (
        <>
          <p className="text-[13px] text-(--gray-500)">
            This webinar is live in the public catalog.
          </p>
          <button
            type="button"
            onClick={() => run(() => archiveWebinar(webinar.id), "Webinar archived.")}
            disabled={busy}
            className="w-full flex items-center justify-center gap-1.5 h-10 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
            Archive Webinar
          </button>
        </>
      )}

      {webinar.status === "archived" && (
        <button
          type="button"
          onClick={() => run(() => reworkWebinar(webinar.id), "Webinar moved back to draft.")}
          disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 h-10 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          Move Back to Draft
        </button>
      )}
    </div>
  );
}
