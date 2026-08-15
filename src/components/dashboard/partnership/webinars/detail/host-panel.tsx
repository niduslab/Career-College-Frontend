"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, UserCheck, X } from "lucide-react";
import { assignWebinarHost, clearWebinarHost, type Webinar } from "@/lib/webinar-api";
import { getExperts, type Expert } from "@/lib/partner-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface HostPanelProps {
  webinar: Webinar;
  editable: boolean;
  onChanged: () => void;
}

export default function HostPanel({ webinar, editable, onChanged }: HostPanelProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getExperts()
      .then((res) => {
        if (active) setExperts(res.results);
      })
      .catch(() => {
        /* silently ignore — host panel still shows the current assignment */
      })
      .finally(() => {
        if (active) setLoadingExperts(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeExperts = experts.filter((e) => e.affiliation_status === "active");

  const handleAssign = async (expert: Expert) => {
    setBusy(true);
    setPickerOpen(false);
    try {
      await assignWebinarHost(webinar.id, expert.user_id);
      notify.success("Host expert assigned.");
      onChanged();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to assign host.");
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    setBusy(true);
    try {
      await clearWebinarHost(webinar.id);
      notify.success("Host expert cleared.");
      onChanged();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to clear host.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl p-5 space-y-3">
      <p className="text-[14px] font-semibold text-(--text-title)">Host</p>
      <p className="text-[12px] text-(--gray-500)">
        Only the assigned host can publish this webinar.
      </p>

      {webinar.host_expert ? (
        <div className="flex items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-(--primary-50) flex items-center justify-center shrink-0 text-[12px] font-semibold text-(--primary-600)">
              {webinar.host_expert.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-(--text-title) truncate">
                {webinar.host_expert.full_name}
              </p>
              <p className="text-[12px] text-(--gray-500) truncate">
                {webinar.host_expert.email}
              </p>
            </div>
          </div>
          {editable && (
            <button
              type="button"
              onClick={handleClear}
              disabled={busy}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-(--gray-400) hover:text-red-500 cursor-pointer transition-colors disabled:opacity-60 shrink-0"
              title="Clear host"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            </button>
          )}
        </div>
      ) : (
        <p className="text-[13px] text-(--gray-400) py-1">No host assigned yet.</p>
      )}

      {editable && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            disabled={loadingExperts || busy}
            className="w-full flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors disabled:opacity-60"
          >
            <UserCheck className="w-4 h-4" />
            {webinar.host_expert ? "Reassign Host" : "Assign Host"}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
          </button>
          {pickerOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 max-h-52 overflow-y-auto">
              {activeExperts.length === 0 ? (
                <p className="px-4 py-3 text-[13px] text-(--gray-400)">
                  No active experts. Onboard one from the Instructors page.
                </p>
              ) : (
                activeExperts.map((expert) => (
                  <button
                    key={expert.id}
                    type="button"
                    onClick={() => handleAssign(expert)}
                    className="w-full text-left px-4 py-2 text-[13px] text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors truncate"
                  >
                    {expert.full_name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
