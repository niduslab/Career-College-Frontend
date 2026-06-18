"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Consultant, SessionType } from "./types";
import { SESSION_ICON } from "./data";

interface BookModalProps {
  consultant: Consultant;
  onClose: () => void;
  onBook: (slotId: string, topic: string, sessionType: SessionType) => void;
}

export function BookModal({ consultant, onClose, onBook }: BookModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>(consultant.sessionTypes[0]);
  const canBook = !!selectedSlot && topic.trim().length > 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--gray-200) sticky top-0 bg-white">
          <h2 className="text-[16px] font-semibold text-(--text-title)">Book a Session</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Consultant summary */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-(--gray-50) border border-(--gray-200)">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
              <Image src={consultant.avatar} alt={consultant.name} width={48} height={48} className="object-cover" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-(--text-title)">{consultant.name}</p>
              <p className="text-[12px] text-(--gray-500)">{consultant.title}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[15px] font-bold text-(--primary-600)">${consultant.pricePerHour}</p>
              <p className="text-[11px] text-(--gray-400)">per hour</p>
            </div>
          </div>

          {/* Session type */}
          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-2 block">Session Type</label>
            <div className="flex gap-2 flex-wrap">
              {consultant.sessionTypes.map(type => {
                const Icon = SESSION_ICON[type];
                return (
                  <button key={type} onClick={() => setSessionType(type)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer ${sessionType === type ? "bg-(--primary-600) text-white border-(--primary-600)" : "bg-white text-(--gray-600) border-(--gray-200) hover:border-(--primary-300)"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />{type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-2 block">Available Slots — Today</label>
            <div className="grid grid-cols-3 gap-2">
              {consultant.slots.map(slot => (
                <button key={slot.id}
                  onClick={() => slot.available && setSelectedSlot(slot.id)}
                  disabled={!slot.available}
                  className={`py-2 rounded-lg border text-[13px] font-medium transition-colors ${
                    !slot.available
                      ? "bg-(--gray-50) text-(--gray-300) border-(--gray-200) cursor-not-allowed"
                      : selectedSlot === slot.id
                      ? "bg-(--primary-600) text-white border-(--primary-600) cursor-pointer"
                      : "bg-white text-(--gray-600) border-(--gray-200) hover:border-(--primary-300) cursor-pointer"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-2 block">What do you want to discuss?</label>
            <textarea value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. I need help understanding transformer architecture and fine-tuning strategies…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-(--gray-200) text-[14px] placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-(--gray-200) flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-(--gray-200) text-[14px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => { if (canBook) { onBook(selectedSlot!, topic, sessionType); onClose(); } }}
            disabled={!canBook}
            className="h-9 px-5 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
