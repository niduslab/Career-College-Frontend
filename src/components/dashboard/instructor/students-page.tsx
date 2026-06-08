"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Users,
  Activity,
  TrendingUp,
  UserPlus,
  Search,
  ChevronDown,
  MessageSquare,
  Eye,
  BookOpen,
  Sparkles,
} from "lucide-react";

// Types

type StudentStatus = "Active" | "Inactive" | "Completed";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  course: string;
  progress: number;
  lastActive: string;
  enrolled: string;
  status: StudentStatus;
}

// Seed Data

const SEED_STUDENTS: Student[] = [
  {
    id: "s1",
    name: "Amelia Watson",
    email: "amelia@mail.com",
    avatar: "",
    course: "UI/UX Design Mastery",
    progress: 92,
    lastActive: "Today",
    enrolled: "2026-01-10",
    status: "Active",
  },
  {
    id: "s2",
    name: "James Carter",
    email: "james@mail.com",
    avatar: "",
    course: "React & Next.js Bootcamp",
    progress: 45,
    lastActive: "Yesterday",
    enrolled: "2026-02-14",
    status: "Active",
  },
  {
    id: "s3",
    name: "Sophia Lee",
    email: "sophia@mail.com",
    avatar: "",
    course: "Figma for Beginners",
    progress: 100,
    lastActive: "3 days ago",
    enrolled: "2025-12-01",
    status: "Completed",
  },
  {
    id: "s4",
    name: "Marcus Brown",
    email: "marcus@mail.com",
    avatar: "",
    course: "Advanced CSS Techniques",
    progress: 20,
    lastActive: "2 weeks ago",
    enrolled: "2026-03-05",
    status: "Inactive",
  },
  {
    id: "s5",
    name: "Lily Zhang",
    email: "lily@mail.com",
    avatar: "",
    course: "UI/UX Design Mastery",
    progress: 67,
    lastActive: "Today",
    enrolled: "2026-02-20",
    status: "Active",
  },
  {
    id: "s6",
    name: "Noah Williams",
    email: "noah@mail.com",
    avatar: "",
    course: "React & Next.js Bootcamp",
    progress: 88,
    lastActive: "Today",
    enrolled: "2026-01-30",
    status: "Active",
  },
  {
    id: "s7",
    name: "Emma Johnson",
    email: "emma@mail.com",
    avatar: "",
    course: "Product Design Principles",
    progress: 55,
    lastActive: "4 days ago",
    enrolled: "2026-03-12",
    status: "Active",
  },
  {
    id: "s8",
    name: "Liam Davis",
    email: "liam@mail.com",
    avatar: "",
    course: "Figma for Beginners",
    progress: 30,
    lastActive: "1 week ago",
    enrolled: "2026-04-01",
    status: "Inactive",
  },
  {
    id: "s9",
    name: "Olivia Martinez",
    email: "olivia@mail.com",
    avatar: "",
    course: "Advanced CSS Techniques",
    progress: 100,
    lastActive: "2 days ago",
    enrolled: "2025-11-15",
    status: "Completed",
  },
  {
    id: "s10",
    name: "Ethan Taylor",
    email: "ethan@mail.com",
    avatar: "",
    course: "UI/UX Design Mastery",
    progress: 72,
    lastActive: "Yesterday",
    enrolled: "2026-02-08",
    status: "Active",
  },
];

const STATS = [
  {
    label: "Total Students",
    value: "1,420",
    change: "+4.2% new enrollments vs last month",
    icon: Users,
  },
  {
    label: "Active This Week",
    value: "892",
    change: "+6.1% vs last week",
    icon: Activity,
  },
  {
    label: "Avg. Progress",
    value: "67%",
    change: "+2.4% vs last month",
    icon: TrendingUp,
  },
  {
    label: "New This Month",
    value: "124",
    change: "+18 vs last month",
    icon: UserPlus,
  },
];

const COURSES = [
  "All Courses",
  ...Array.from(new Set(SEED_STUDENTS.map((s) => s.course))),
];
const STATUSES: ("All" | StudentStatus)[] = [
  "All",
  "Active",
  "Inactive",
  "Completed",
];

const TOP_COURSES = [
  { name: "UI/UX Design Mastery", count: 420 },
  { name: "React & Next.js Bootcamp", count: 380 },
  { name: "Figma for Beginners", count: 310 },
  { name: "Advanced CSS Techniques", count: 190 },
  { name: "Product Design Principles", count: 120 },
];
const maxCount = Math.max(...TOP_COURSES.map((c) => c.count));

const TIPS = [
  {
    color: "text-blue-500",
    text: "Message inactive students after 7 days to re-engage.",
  },
  {
    color: "text-green-500",
    text: "Students who finish Module 1 are 3× more likely to complete.",
  },
  {
    color: "text-orange-500",
    text: "Offer a certificate to boost completion rates.",
  },
];

// Avatar

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-orange-400",
    "bg-pink-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`w-9 h-9 rounded-full ${color} text-white text-[13px] font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}

//  Status Badge

function StatusBadge({ status }: { status: StudentStatus }) {
  const map = {
    Active: "text-green-600 bg-green-50 border-green-200",
    Inactive: "text-orange-500 bg-orange-50 border-orange-200",
    Completed: "text-blue-600 bg-blue-50 border-blue-200",
  };
  return (
    <span
      className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border ${map[status]}`}
    >
      {status}
    </span>
  );
}

// Main Page
export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState<"All" | StudentStatus>(
    "All",
  );
  const [courseOpen, setCourseOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<(HTMLDivElement | null)[]>([]);
  const courseBarRef = useRef<(HTMLDivElement | null)[]>([]);
  const breakdownBarRef = useRef<(HTMLDivElement | null)[]>([]);

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
    courseBarRef.current.forEach((el, i) => {
      if (!el) return;
      const target = el.dataset.progress ?? "0";
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${target}%`,
          duration: 0.8,
          delay: 0.3 + i * 0.1,
          ease: "power3.out",
        },
      );
    });
    breakdownBarRef.current.forEach((el, i) => {
      if (!el) return;
      const target = el.dataset.progress ?? "0";
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${target}%`,
          duration: 0.8,
          delay: 0.5 + i * 0.12,
          ease: "power3.out",
        },
      );
    });
  }, []);

  useEffect(() => {
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          delay: i * 0.05,
          ease: "power2.out",
        },
      );
    });
    progressRef.current.forEach((el, i) => {
      if (!el) return;
      const target = el.dataset.progress ?? "0";
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${target}%`,
          duration: 0.8,
          delay: 0.2 + i * 0.05,
          ease: "power3.out",
        },
      );
    });
  }, [search, courseFilter, statusFilter]);

  const filtered = SEED_STUDENTS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchCourse =
      courseFilter === "All Courses" || s.course === courseFilter;
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchCourse && matchStatus;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* ── Left ── */}
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
                className="opacity-0 bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                      {s.label}
                    </p>
                    <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                      {s.value}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-(--primary-600)" />
                  </div>
                </div>
                <div className="border border-dashed border-gray-200 mt-1 mb-1" />
                <p className="text-[12px] font-medium text-(--success-500) flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  {s.change}
                </p>
              </div>
            );
          })}
        </div>

        {/* Table card */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
          {/* Header + filters */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
                All Students
                <span className="ml-2 text-[12px] font-normal text-(--gray-500)">({filtered.length})</span>
              </p>
            </div>

            {/* Search — full width */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full h-12 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
            </div>

            {/* Course + Status filters — 2 cols on mobile, inline on sm+ */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">

              {/* Course filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setCourseOpen((v) => !v); setStatusOpen(false); }}
                  className="flex items-center gap-2 w-full h-11 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-(--gray-500) shrink-0" />
                  <span className="flex-1 text-left truncate">{courseFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${courseOpen ? "rotate-180" : ""}`} />
                </button>
                {courseOpen && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-52">
                    {COURSES.map((c) => (
                      <button key={c} type="button"
                        onClick={() => { setCourseFilter(c); setCourseOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors truncate ${c === courseFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setStatusOpen((v) => !v); setCourseOpen(false); }}
                  className="flex items-center gap-2 w-full h-11 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
                >
                  <span className="flex-1 text-left">{statusFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`} />
                </button>
                {statusOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-32">
                    {STATUSES.map((st) => (
                      <button key={st} type="button"
                        onClick={() => { setStatusFilter(st); setStatusOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${st === statusFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}>
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>{/* end grid filters */}
          </div>{/* end flex flex-col gap-3 */}

          {/* Table — horizontal scroll on mobile */}
          <div className="overflow-x-auto -mx-5 px-5">
            <div className="min-w-160">

              {/* Table header */}
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 px-3 pb-2 border-b border-(--gray-100)">
                {["Student", "Course", "Progress", "Last Active", "Status", ""].map((h) => (
                  <p key={h} className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">{h}</p>
                ))}
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
                  <p className="text-[14px] text-(--gray-500)">No students match your filters.</p>
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  {filtered.map((s, i) => (
                    <div
                      key={s.id}
                      ref={(el) => { rowsRef.current[i] = el; }}
                      className="opacity-0 grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors"
                    >
                  {/* Student */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={s.name} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-(--text-title) truncate">
                        {s.name}
                      </p>
                      <p className="text-[12px] text-(--gray-500) truncate">
                        {s.email}
                      </p>
                    </div>
                  </div>

                  {/* Course */}
                  <p className="text-[12px] text-(--gray-600) truncate">
                    {s.course}
                  </p>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                      <div
                        ref={(el) => {
                          progressRef.current[i] = el;
                        }}
                        data-progress={s.progress}
                        className={`h-full rounded-full ${s.progress === 100 ? "bg-green-500" : s.progress >= 60 ? "bg-(--primary-600)" : "bg-orange-400"}`}
                        style={{ width: "0%" }}
                      />
                    </div>
                    <span className="text-[12px] font-semibold text-(--text-title) shrink-0 w-8 text-right">
                      {s.progress}%
                    </span>
                  </div>

                  {/* Last active */}
                  <p className="text-[12px] text-(--gray-500)">
                    {s.lastActive}
                  </p>

                  {/* Status */}
                  <StatusBadge status={s.status} />

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      className="p-1.5 rounded-lg hover:bg-(--primary-50) text-(--gray-500) hover:text-(--primary-600) cursor-pointer transition-colors"
                      title="Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-(--primary-50) text-(--gray-500) hover:text-(--primary-600) cursor-pointer transition-colors"
                      title="View profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
                </div>
              )}
            </div>{/* end min-w-160 */}
          </div>{/* end overflow-x-auto */}
        </div>{/* end table card */}
      </div>{/* end left */}

      {/* ── Right sidebar ── */}
      <div className="w-full xl:w-72 shrink-0 space-y-4">
        {/* Top enrolled courses */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Top Enrolled Courses
          </p>
          <div className="space-y-3">
            {TOP_COURSES.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-(--primary-700) text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[12px] font-medium text-(--text-title) truncate">
                    {c.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                      <div
                        ref={(el) => {
                          courseBarRef.current[i] = el;
                        }}
                        data-progress={Math.round((c.count / maxCount) * 100)}
                        className="h-full rounded-full bg-(--primary-600)"
                        style={{ width: "0%" }}
                      />
                    </div>
                    <span className="text-[12px] text-(--gray-500) shrink-0">
                      {c.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Tips */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-600)" />
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Engagement Tips
            </p>
          </div>
          <div className="space-y-2.5">
            {TIPS.map(({ color, text }) => (
              <div key={text} className="flex items-start gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color.replace("text-", "bg-")}`}
                />
                <p className="text-[12px] text-(--gray-500) leading-snug">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Completion Breakdown
          </p>
          <div className="space-y-2">
            {(["Completed", "Active", "Inactive"] as StudentStatus[]).map(
              (st) => {
                const count = SEED_STUDENTS.filter(
                  (s) => s.status === st,
                ).length;
                const pct = Math.round((count / SEED_STUDENTS.length) * 100);
                const color =
                  st === "Completed"
                    ? "bg-blue-500"
                    : st === "Active"
                      ? "bg-green-500"
                      : "bg-orange-400";
                const text =
                  st === "Completed"
                    ? "text-blue-600"
                    : st === "Active"
                      ? "text-green-600"
                      : "text-orange-500";
                return (
                  <div key={st} className="flex items-center gap-3">
                    <span className="text-[12px] text-(--gray-600) w-20 shrink-0">
                      {st}
                    </span>
                    <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                      <div
                        ref={(el) => {
                          breakdownBarRef.current[
                            ["Completed", "Active", "Inactive"].indexOf(st)
                          ] = el;
                        }}
                        data-progress={pct}
                        className={`h-full rounded-full ${color}`}
                        style={{ width: "0%" }}
                      />
                    </div>
                    <span
                      className={`text-[12px] font-semibold ${text} w-8 text-right shrink-0`}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
