"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Radio,
  Bell,
  BellOff,
  Play,
  ChevronRight,
  Search,
} from "lucide-react";
import gsap from "gsap";

import instructor1 from "@/assets/images/instructors/instructor1.webp";
import instructor2 from "@/assets/images/instructors/instructor2.webp";
import instructor3 from "@/assets/images/instructors/instructor3.webp";
import instructor4 from "@/assets/images/instructors/instructor4.webp";
import instructor5 from "@/assets/images/instructors/instructor5.webp";
import instructor6 from "@/assets/images/instructors/instructor6.webp";

type SessionStatus = "live" | "upcoming" | "recorded";

interface Session {
  id: number;
  title: string;
  instructor: string;
  instructorImg: Parameters<typeof Image>[0]["src"];
  topic: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  maxAttendees?: number;
  status: SessionStatus;
  reminded?: boolean;
}

const SESSIONS: Session[] = [
  {
    id: 1,
    title: "Building RAG Pipelines with LangChain",
    instructor: "Dr. Lena Park",
    instructorImg: instructor1,
    topic: "AI & ML",
    date: "Today",
    time: "3:00 PM",
    duration: "90 min",
    attendees: 312,
    status: "live",
  },
  {
    id: 2,
    title: "Deep Dive: Transformer Architecture",
    instructor: "Marcus Webb",
    instructorImg: instructor2,
    topic: "AI & ML",
    date: "Today",
    time: "5:30 PM",
    duration: "60 min",
    attendees: 148,
    maxAttendees: 200,
    status: "upcoming",
  },
  {
    id: 3,
    title: "SQL Window Functions in Practice",
    instructor: "Sara Kim",
    instructorImg: instructor4,
    topic: "Data",
    date: "Tomorrow",
    time: "10:00 AM",
    duration: "75 min",
    attendees: 94,
    maxAttendees: 150,
    status: "upcoming",
  },
  {
    id: 4,
    title: "Figma Auto Layout Mastery",
    instructor: "James Carter",
    instructorImg: instructor5,
    topic: "Design",
    date: "Jun 18",
    time: "2:00 PM",
    duration: "60 min",
    attendees: 61,
    maxAttendees: 100,
    status: "upcoming",
  },
  {
    id: 5,
    title: "Python Data Wrangling with Polars",
    instructor: "Dr. Omar Said",
    instructorImg: instructor3,
    topic: "Data",
    date: "Jun 20",
    time: "4:00 PM",
    duration: "90 min",
    attendees: 38,
    maxAttendees: 120,
    status: "upcoming",
  },
  {
    id: 6,
    title: "Intro to Prompt Engineering",
    instructor: "Amara Okafor",
    instructorImg: instructor6,
    topic: "AI & ML",
    date: "Jun 10",
    time: "3:00 PM",
    duration: "60 min",
    attendees: 520,
    status: "recorded",
  },
  {
    id: 7,
    title: "Data Visualization with Plotly",
    instructor: "Sara Kim",
    instructorImg: instructor4,
    topic: "Data",
    date: "Jun 7",
    time: "11:00 AM",
    duration: "75 min",
    attendees: 387,
    status: "recorded",
  },
  {
    id: 8,
    title: "UX Research Methods",
    instructor: "James Carter",
    instructorImg: instructor5,
    topic: "Design",
    date: "Jun 3",
    time: "2:00 PM",
    duration: "90 min",
    attendees: 274,
    status: "recorded",
  },
];

const TABS: { key: SessionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live Now" },
  { key: "upcoming", label: "Upcoming" },
  { key: "recorded", label: "Recorded" },
];

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; dot: string; badge: string }
> = {
  live: {
    label: "Live Now",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-600 border border-rose-200",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  recorded: {
    label: "Recorded",
    dot: "bg-(--gray-400)",
    badge: "bg-(--gray-100) text-(--gray-500) border border-(--gray-200)",
  },
};

interface CardProps {
  session: Session;
  onToggleRemind: (id: number) => void;
  onJoinLive: () => void;
}

function SessionCard({ session, onToggleRemind, onJoinLive }: CardProps) {
  const cfg = STATUS_CONFIG[session.status];
  const spotsLeft =
    session.maxAttendees !== undefined
      ? session.maxAttendees - session.attendees
      : null;
  const fillPct =
    session.maxAttendees !== undefined
      ? Math.min(100, (session.attendees / session.maxAttendees) * 100)
      : null;

  return (
    <div className="session-card opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}
          >
            {session.status === "live" && (
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`}
                />
              </span>
            )}
            {session.status !== "live" && (
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
            )}
            {cfg.label}
          </span>
          {/* Topic chip */}
          <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-(--primary-50) text-(--primary-600) border border-(--primary-100)">
            {session.topic}
          </span>
        </div>

        {/* Action button */}
        {session.status === "live" && (
          <button
            onClick={onJoinLive}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Radio className="w-4 h-4" />
            Join Live
          </button>
        )}
        {session.status === "upcoming" && (
          <button
            onClick={() => onToggleRemind(session.id)}
            className={`flex items-center gap-1.5 h-9 px-3.5 rounded-lg border text-[13px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
              session.reminded
                ? "bg-(--primary-600) border-(--primary-600) text-white"
                : "border-(--gray-200) text-(--gray-500) hover:border-(--primary-300) hover:text-(--primary-600)"
            }`}
          >
            {session.reminded ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {session.reminded ? "Reminded" : "Remind Me"}
          </button>
        )}
        {session.status === "recorded" && (
          <button
            onClick={onJoinLive}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-(--gray-200) text-(--gray-500) hover:border-(--primary-300) hover:text-(--primary-600) text-[13px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Play className="w-4 h-4" />
            Watch
          </button>
        )}
      </div>

      {/* Title */}
      <div>
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-(--text-title) leading-snug mb-3 line-clamp-2">
          {session.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-(--gray-100)">
            <Image
              src={session.instructorImg}
              alt={session.instructor}
              width={28}
              height={28}
              className="object-cover"
            />
          </div>
          <span className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) font-normal">
            {session.instructor}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-(--gray-100)" />

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-1.5 text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
          <Calendar className="w-4 h-4 shrink-0 text-(--gray-400)" />
          {session.date}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
          <Clock className="w-4 h-4 shrink-0 text-(--gray-400)" />
          {session.time} · {session.duration}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
          <Users className="w-4 h-4 shrink-0 text-(--gray-400)" />
          {session.attendees.toLocaleString()}
          {session.status === "upcoming" && session.maxAttendees
            ? ` / ${session.maxAttendees}`
            : ""}
          {session.status === "live"
            ? " watching"
            : session.status === "recorded"
              ? " attended"
              : " registered"}
        </span>

        {spotsLeft !== null && spotsLeft <= 20 && (
          <span className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-rose-500 ml-auto">
            {spotsLeft} spots left
          </span>
        )}
      </div>

      {/* Capacity bar for upcoming */}
      {fillPct !== null && session.status === "upcoming" && (
        <div className="h-1.5 rounded-full bg-(--gray-100) overflow-hidden">
          <div
            className="h-full rounded-full bg-(--primary-600) transition-all"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function LiveSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState(SESSIONS);
  const [activeTab, setActiveTab] = useState<SessionStatus | "all">("all");
  const [search, setSearch] = useState("");

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = sessions.filter((s) => {
    const matchTab = activeTab === "all" || s.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      s.title.toLowerCase().includes(q) ||
      s.instructor.toLowerCase().includes(q) ||
      s.topic.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const handleToggleRemind = (id: number) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, reminded: !s.reminded } : s)),
    );
  };

  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4 },
    ).fromTo(
      statsRef.current ? Array.from(statsRef.current.children) : [],
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 },
      "-=0.2",
    );
  }, []);

  // Animate cards on filter change
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll(".session-card"));
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power3.out" },
    );
  }, [activeTab, search]);

  const liveCount = sessions.filter((s) => s.status === "live").length;
  const upcomingCount = sessions.filter((s) => s.status === "upcoming").length;
  const recordedCount = sessions.filter((s) => s.status === "recorded").length;

  const stats = [
    {
      label: "Live Now",
      value: liveCount,
      icon: Radio,
      bg: "bg-rose-50",
      color: "text-rose-500",
      iconBg: "bg-rose-100",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      icon: Calendar,
      bg: "bg-amber-50",
      color: "text-amber-500",
      iconBg: "bg-amber-100",
    },
    {
      label: "Recorded",
      value: recordedCount,
      icon: Video,
      bg: "bg-(--primary-50)",
      color: "text-(--primary-600)",
      iconBg: "bg-(--primary-100)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
          Live Sessions
        </h1>
        <p className="text-[12px] md:text-[14px] lg:text-[14px]  text-(--gray-500) mt-1">
          Join live classes, attend upcoming sessions, or catch up with
          recordings.
        </p>
      </div>

      {/* Stats row */}
      <div ref={statsRef} className="grid grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="opacity-0 bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                    {s.label}
                  </p>
                  <p className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                    {s.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-[6px_4px_6px_6px] ${s.iconBg} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
              <div className="border border-dashed border-(--gray-200)" />
              <p className="text-[12px] md:text-[14px] lg:text-[14px] font-medium text-(--gray-400)">
                sessions
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 h-11 rounded-md text-[14px]  transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
                activeTab === tab.key
                  ? "bg-(--primary-600) text-white border-(--primary-600) font-medium"
                  : "bg-white text-(--gray-500) border-(--gray-200) hover:border-(--primary-300) font-normal"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span
                  className={`ml-1.5 text-[12px] font-semibold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-(--gray-100) text-(--gray-500)"
                  }`}
                >
                  {tab.key === "live"
                    ? liveCount
                    : tab.key === "upcoming"
                      ? upcomingCount
                      : recordedCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {filtered.length}
        </span>{" "}
        session{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {filtered.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onToggleRemind={handleToggleRemind}
            onJoinLive={() => router.push("/dashboard/learner/live-room")}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-(--gray-400)">
            <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-[16px] font-medium text-(--text-title)">
              No sessions found
            </p>
            <p className="text-[14px] mt-1">Try a different keyword or tab</p>
          </div>
        )}
      </div>

      {/* Upcoming CTA */}
      {activeTab !== "recorded" && (
        <div className="flex items-center justify-between p-5 bg-(--primary-50) border border-(--primary-100) rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-(--primary-600) flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-(--text-title)">
                View full schedule
              </p>
              <p className="text-[14px] text-(--gray-500)">
                See all sessions planned for the next 30 days.
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-[14px] font-semibold text-(--primary-600) hover:text-(--primary-700) transition-colors cursor-pointer shrink-0">
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
