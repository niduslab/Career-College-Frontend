"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { updateWebinar, type Webinar, type GuestSpeaker } from "@/lib/webinar-api";
import { getExperts, type Expert } from "@/lib/partner-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface SpeakersPanelProps {
  webinar: Webinar;
  editable: boolean;
  onChanged: () => void;
}

export default function SpeakersPanel({ webinar, editable, onChanged }: SpeakersPanelProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(webinar.institutional_speakers.map((s) => s.id)),
  );
  const [guestSpeakers, setGuestSpeakers] = useState<GuestSpeaker[]>(
    webinar.guest_speakers,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getExperts()
      .then((res) => {
        if (active) setExperts(res.results.filter((e) => e.affiliation_status === "active"));
      })
      .catch(() => {
        /* silently ignore */
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleExpert = (userId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const addGuest = () =>
    setGuestSpeakers((prev) => [...prev, { full_name: "", title: "", bio: "" }]);

  const updateGuest = (index: number, patch: Partial<GuestSpeaker>) =>
    setGuestSpeakers((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...patch } : g)),
    );

  const removeGuest = (index: number) =>
    setGuestSpeakers((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    const cleanedGuests = guestSpeakers.filter((g) => g.full_name.trim());
    setSaving(true);
    try {
      await updateWebinar(webinar.id, {
        institutional_speaker_ids: Array.from(selectedIds),
        guest_speakers: cleanedGuests,
      });
      notify.success("Speakers updated.");
      setGuestSpeakers(cleanedGuests);
      onChanged();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to update speakers.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl p-5 space-y-4">
      <p className="text-[14px] font-semibold text-(--text-title)">Speakers</p>

      {!editable && (
        <p className="text-[12px] text-(--gray-400)">
          This webinar is published — speaker changes are locked.
        </p>
      )}

      {/* Institutional speakers */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-(--text-title)">
          Institutional Experts
        </label>
        {experts.length === 0 ? (
          <p className="text-[12px] text-(--gray-400)">No active experts to credit.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {experts.map((expert) => {
              const selected = selectedIds.has(expert.user_id);
              return (
                <button
                  key={expert.id}
                  type="button"
                  disabled={!editable}
                  onClick={() => toggleExpert(expert.user_id)}
                  className={`text-[12px] font-medium px-2.5 py-1.5 rounded-full border cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected
                      ? "bg-(--primary-50) border-(--primary-300) text-(--primary-700)"
                      : "bg-white border-(--gray-200) text-(--gray-600) hover:bg-(--gray-50)"
                  }`}
                >
                  {expert.full_name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Guest speakers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-(--text-title)">
            Guest Speakers{" "}
            <span className="text-[12px] text-(--gray-400) font-normal">
              (no platform account)
            </span>
          </label>
          {editable && (
            <button
              type="button"
              onClick={addGuest}
              className="flex items-center gap-1 text-[12px] font-medium text-(--primary-700) hover:text-(--primary-900) cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>

        {guestSpeakers.length === 0 ? (
          <p className="text-[12px] text-(--gray-400)">No guest speakers added.</p>
        ) : (
          <div className="space-y-2">
            {guestSpeakers.map((guest, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 border border-(--gray-200) rounded-lg"
              >
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={guest.full_name}
                    disabled={!editable}
                    onChange={(e) => updateGuest(i, { full_name: e.target.value })}
                    placeholder="Full name"
                    className="w-full h-9 px-2.5 text-[13px] border border-(--gray-200) rounded-md bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50)"
                  />
                  <input
                    type="text"
                    value={guest.title ?? ""}
                    disabled={!editable}
                    onChange={(e) => updateGuest(i, { title: e.target.value })}
                    placeholder="Title (optional)"
                    className="w-full h-9 px-2.5 text-[13px] border border-(--gray-200) rounded-md bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:bg-(--gray-50)"
                  />
                </div>
                {editable && (
                  <button
                    type="button"
                    onClick={() => removeGuest(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-(--gray-400) hover:text-red-500 cursor-pointer transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editable && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Speakers
          </button>
        </div>
      )}
    </div>
  );
}
