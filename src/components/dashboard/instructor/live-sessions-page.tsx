"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Radio,
  Users,
  CalendarDays,
  Clock,
  Plus,
  Video,
  Link2,
  Copy,
  PlayCircle,
  StopCircle,
  Pencil,
  Trash2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import CreateSessionModal, {
  type SessionFormData,
} from "./live-sessions-modal";

// Types

type SessionStatus = "live" | "upcoming" | "ended";

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  enrolled: number;
  status: SessionStatus;
  platform: string;
  link: string;
}

//  Seed Data

const SEED_SESSIONS: Session[] = [
  {
    id: "s1",
    title: "UI/UX Design Deep Dive — Live Q&A",
    date: "2026-06-06",
    time: "10:00 AM",
    duration: "60 min",
    enrolled: 142,
    status: "live",
    platform: "Zoom",
    link: "https://zoom.us/j/123456789",
  },
  {
    id: "s2",
    title: "Figma Advanced Prototyping Workshop",
    date: "2026-06-08",
    time: "03:00 PM",
    duration: "90 min",
    enrolled: 98,
    status: "upcoming",
    platform: "Google Meet",
    link: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "s3",
    title: "React Hooks Masterclass",
    date: "2026-06-10",
    time: "06:00 PM",
    duration: "120 min",
    enrolled: 210,
    status: "upcoming",
    platform: "Zoom",
    link: "https://zoom.us/j/987654321",
  },
  {
    id: "s4",
    title: "CSS Grid & Flexbox Fundamentals",
    date: "2026-05-28",
    time: "11:00 AM",
    duration: "45 min",
    enrolled: 176,
    status: "ended",
    platform: "Zoom",
    link: "",
  },
  {
    id: "s5",
    title: "Product Design Principles — Intro Session",
    date: "2026-05-20",
    time: "02:00 PM",
    duration: "60 min",
    enrolled: 134,
    status: "ended",
    platform: "Google Meet",
    link: "",
  },
];

const STATS = [
  {
    label: "Total Sessions",
    value: "24",
    icon: CalendarDays,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    valueColor: "text-blue-600",
  },
  {
    label: "Live Now",
    value: "1",
    icon: Radio,
    bg: "bg-red-50",
    iconColor: "text-red-500",
    valueColor: "text-red-500",
  },
  {
    label: "Upcoming",
    value: "2",
    icon: Clock,
    bg: "bg-orange-50",
    iconColor: "text-orange-500",
    valueColor: "text-orange-500",
  },
  {
    label: "Students Joined",
    value: "760",
    icon: Users,
    bg: "bg-green-50",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
  },
];

const QUICK_ACTIONS = [
  { icon: Video, label: "Start Instant Session" },
  { icon: Link2, label: "Share Session Link" },
  { icon: PlayCircle, label: "View Recordings" },
];

//  Status Badge
function StatusBadge({ status }: { status: SessionStatus }) {
  if (status === "live")
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Live
      </span>
    );
  if (status === "upcoming")
    return (
      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
        Upcoming
      </span>
    );
  return (
    <span className="text-[11px] font-semibold text-(--gray-500) bg-(--gray-100) border border-(--gray-200) px-2.5 py-1 rounded-full">
      Ended
    </span>
  );
}

// Main Page

export default function LiveSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(SEED_SESSIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          delay: i * 0.08,
          ease: "back.out(1.4)",
        },
      );
    });
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          delay: 0.3 + i * 0.07,
          ease: "power2.out",
        },
      );
    });
  }, []);

  const handleCopy = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreate = (data: SessionFormData) => {
    const newSession: Session = {
      ...data,
      id: Math.random().toString(36).slice(2, 9),
      enrolled: 0,
      status: "upcoming",
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const handleDelete = (id: string) =>
    setSessions((prev) => prev.filter((s) => s.id !== id));

  const live = sessions.filter((s) => s.status === "live");
  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const ended = sessions.filter((s) => s.status === "ended");

  const grouped: { label: string; items: Session[] }[] = [
    { label: "Live Now", items: live },
    { label: "Upcoming", items: upcoming },
    { label: "Ended", items: ended },
  ].filter((g) => g.items.length > 0);

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-5">
        {/* ── Left — Sessions list ── */}
        <div className="flex-1 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  ref={(el) => {
                    cardsRef.current[i] = el;
                  }}
                  className="opacity-0 flex flex-col gap-2 bg-white border border-(--gray-200) rounded-2xl px-4 py-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${s.iconColor}`} />
                  </div>
                  <p
                    className={`text-[20px] lg:text-[24px] font-semibold leading-none ${s.valueColor}`}
                  >
                    {s.value}
                  </p>
                  <p className="text-[12px] lg:text-[14px] font-normal text-(--gray-500)">
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Sessions grouped */}
          <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
                All Sessions
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 h-12 text-[14px] lg:text-[16px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Session
              </button>
            </div>

            {grouped.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="text-[12px] font-medium tracking-widest text-(--gray-500) uppercase">
                  {group.label}
                </p>
                {group.items.map((session, idx) => (
                  <div
                    key={session.id}
                    ref={(el) => {
                      rowsRef.current[idx] = el;
                    }}
                    className="opacity-0 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border border-(--gray-200) rounded-xl hover:bg-(--gray-50) transition-colors"
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        session.status === "live"
                          ? "bg-red-50"
                          : session.status === "upcoming"
                            ? "bg-blue-50"
                            : "bg-(--gray-100)"
                      }`}
                    >
                      <Radio
                        className={`w-5 h-5 ${
                          session.status === "live"
                            ? "text-red-500"
                            : session.status === "upcoming"
                              ? "text-blue-500"
                              : "text-(--gray-500)"
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-(--text-title) truncate">
                        {session.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-[12px] text-(--gray-500)">
                          <CalendarDays className="w-4 h-4" />
                          {session.date}
                        </span>
                        <span className="flex items-center gap-1 text-[12px] text-(--gray-500)">
                          <Clock className="w-4 h-4" />
                          {session.time} · {session.duration}
                        </span>
                        <span className="flex items-center gap-1 text-[12px] text-(--gray-500)">
                          <Users className="w-4 h-4" />
                          {session.enrolled} enrolled
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={session.status} />

                      {session.status !== "ended" && session.link && (
                        <button
                          onClick={() => handleCopy(session.link, session.id)}
                          className="p-1.5 rounded-lg border border-(--gray-200) hover:bg-(--gray-100) text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
                          title="Copy link"
                        >
                          {copied === session.id ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {session.status === "live" && (
                        <button className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer transition-colors">
                          <StopCircle className="w-3.5 h-3.5" />
                          End
                        </button>
                      )}

                      {session.status === "upcoming" && (
                        <button className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg cursor-pointer transition-colors">
                          <PlayCircle className="w-3.5 h-3.5" />
                          Start
                        </button>
                      )}

                      {session.status === "ended" && (
                        <button className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-medium border border-(--gray-200) text-(--gray-600) hover:bg-(--gray-50) rounded-lg cursor-pointer transition-colors">
                          <PlayCircle className="w-3.5 h-3.5" />
                          Recording
                        </button>
                      )}

                      <button
                        className="p-1.5 rounded-lg hover:bg-(--gray-100) text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-(--gray-500) hover:text-red-500 cursor-pointer transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — Sidebar ── */}
        <div className="w-full xl:w-72 shrink-0 space-y-4">
          {/* This week */}
          <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-500) uppercase">
              This Week
            </p>
            {upcoming.slice(0, 3).length === 0 ? (
              <p className="text-[13px] text-(--gray-500) italic">
                No upcoming sessions.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-(--text-title) truncate">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-(--gray-500) mt-0.5">
                        {s.date} · {s.time}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-(--gray-300) shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Quick Actions
            </p>
            <div className="space-y-2">
              {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-(--gray-200) hover:bg-(--gray-50) hover:border-(--primary-300) text-(--gray-600) hover:text-(--primary-700) cursor-pointer transition-colors text-left"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-[13px] font-medium">{label}</span>
                </button>
              ))}
              <button
                onClick={() => setModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-(--primary-700) hover:bg-(--primary-900) text-white cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="text-[14px] font-semibold">
                  Schedule Session
                </span>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Tips
            </p>
            <div className="space-y-2.5">
              {[
                {
                  color: "text-blue-500",
                  text: "Send reminders 24h before your session.",
                },
                {
                  color: "text-green-500",
                  text: "Record sessions for students who miss it.",
                },
                {
                  color: "text-orange-500",
                  text: "Keep sessions under 90 min for best engagement.",
                },
              ].map(({ color, text }) => (
                <div key={text} className="flex items-start gap-2">
                  <Radio className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                  <p className="text-[12px] text-(--gray-500) leading-snug">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <CreateSessionModal
          onClose={() => setModalOpen(false)}
          onSave={handleCreate}
        />
      )}
    </>
  );
}
