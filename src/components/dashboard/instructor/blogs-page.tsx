"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  FileText,
  Eye,
  TrendingUp,
  BookMarked,
  Search,
  Plus,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  Copy,
  Sparkles,
  Clock,
  Tag,
} from "lucide-react";

// Types
type PostStatus = "Published" | "Draft" | "Scheduled";

interface BlogsPost {
  id: string;
  title: string;
  category: string;
  status: PostStatus;
  views: number;
  date: string;
  readTime: string;
  tags: string[];
}

// Seed Data

const SEED_POSTS: BlogsPost[] = [
  {
    id: "p1",
    title: "Top 10 In-Demand Skills You Should Learn in 2026",
    category: "Career Tips",
    status: "Published",
    views: 4820,
    date: "Mar 22, 2026",
    readTime: "6 min",
    tags: ["Skills", "2026", "Career"],
  },
  {
    id: "p2",
    title: "How to Build a Job-Winning Portfolio in 30 Days",
    category: "Guides",
    status: "Published",
    views: 3150,
    date: "Mar 18, 2026",
    readTime: "8 min",
    tags: ["Portfolio", "Job Hunt"],
  },
  {
    id: "p3",
    title: "A Complete Guide to Starting Your Career in AI",
    category: "Career Tips",
    status: "Draft",
    views: 0,
    date: "Mar 15, 2026",
    readTime: "10 min",
    tags: ["AI", "Career"],
  },
  {
    id: "p4",
    title: "Why UI/UX Design is the Best Skill for Freelancers",
    category: "Design",
    status: "Published",
    views: 2940,
    date: "Mar 10, 2026",
    readTime: "5 min",
    tags: ["UX", "Freelance"],
  },
  {
    id: "p5",
    title: "React vs Vue: Which Framework Should You Learn First?",
    category: "Development",
    status: "Scheduled",
    views: 0,
    date: "Mar 30, 2026",
    readTime: "7 min",
    tags: ["React", "Vue", "Dev"],
  },
  {
    id: "p6",
    title: "5 Mistakes New Instructors Make (And How to Avoid Them)",
    category: "Instructor Tips",
    status: "Published",
    views: 1870,
    date: "Mar 5, 2026",
    readTime: "4 min",
    tags: ["Teaching", "Tips"],
  },
  {
    id: "p7",
    title: "Mastering Figma Components in 2026",
    category: "Design",
    status: "Draft",
    views: 0,
    date: "Feb 28, 2026",
    readTime: "9 min",
    tags: ["Figma", "Design"],
  },
  {
    id: "p8",
    title: "How to Price Your Online Course the Right Way",
    category: "Instructor Tips",
    status: "Published",
    views: 2210,
    date: "Feb 20, 2026",
    readTime: "6 min",
    tags: ["Pricing", "Course"],
  },
];

const STATS = [
  {
    label: "Total Posts",
    value: "24",
    change: "+3 this month",
    icon: FileText,
  },
  {
    label: "Published",
    value: "18",
    change: "75% of all posts",
    icon: Globe,
  },
  {
    label: "Total Views",
    value: "14.9k",
    change: "+8.3% vs last month",
    icon: Eye,
  },
  {
    label: "Avg. Read Time",
    value: "6.8 min",
    change: "Across all posts",
    icon: TrendingUp,
  },
];

const CATEGORIES = [
  "All Categories",
  ...Array.from(new Set(SEED_POSTS.map((p) => p.category))),
];
const STATUSES: ("All" | PostStatus)[] = [
  "All",
  "Published",
  "Draft",
  "Scheduled",
];

const TOP_POSTS = SEED_POSTS.filter((p) => p.views > 0)
  .sort((a, b) => b.views - a.views)
  .slice(0, 5);

const maxViews = Math.max(...TOP_POSTS.map((p) => p.views));

const WRITING_TIPS = [
  {
    color: "text-blue-500",
    text: "Posts with 1,500–2,500 words rank best on search engines.",
  },
  {
    color: "text-green-500",
    text: "Add a call-to-action at the end to drive course enrollments.",
  },
  {
    color: "text-orange-500",
    text: "Use numbered lists and headers for 40% better readability.",
  },
];

// Sub-components

function StatusBadge({ status }: { status: PostStatus }) {
  const map: Record<PostStatus, string> = {
    Published: "text-green-600 bg-green-50 border-green-200",
    Draft: "text-orange-500 bg-orange-50 border-orange-200",
    Scheduled: "text-blue-600 bg-blue-50 border-blue-200",
  };
  return (
    <span
      className={`text-[12px] font-semibold w-20 px-2.5 py-1 rounded-full border ${map[status]}`}
    >
      {status}
    </span>
  );
}

function RowMenu({
  open,
  onToggle,
  setRef,
}: {
  open: boolean;
  onToggle: () => void;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open]);

  const items: { icon: React.ElementType; label: string; danger?: boolean }[] =
    [
      { icon: Pencil, label: "Edit Post" },
      { icon: Globe, label: "Publish" },
      { icon: EyeOff, label: "Unpublish" },
      { icon: Copy, label: "Duplicate" },
      { icon: Trash2, label: "Delete", danger: true },
    ];

  return (
    <div ref={setRef} className="relative">
      <button
        ref={btnRef}
        onClick={onToggle}
        className="p-1.5 rounded-lg hover:bg-(--primary-50) text-(--gray-500) hover:text-(--primary-600) cursor-pointer transition-colors"
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top,
              right: coords.right,
              zIndex: 9999,
            }}
            className="bg-white border border-(--gray-200) rounded-xl shadow-lg py-1 min-w-44"
          >
            {items.map(({ icon: Icon, label, danger }) => (
              <button
                key={label}
                type="button"
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-[14px] cursor-pointer transition-colors ${
                  danger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-(--gray-600) hover:bg-(--gray-50)"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

// Main Page

export default function BlogsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState<"All" | PostStatus>("All");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const topBarRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // GSAP entrance
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
    topBarRef.current.forEach((el, i) => {
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
  }, []);

  // GSAP rows on filter change
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
  }, [search, categoryFilter, statusFilter]);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenuId === null) return;
      const el = menuRefs.current.get(openMenuId);
      if (el && !el.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const filtered = SEED_POSTS.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "All Categories" || p.category === categoryFilter;
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
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
                className="opacity-0 bg-white border border-(--gray-200) rounded-2xl p-6 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-(--gray-500) font-medium mb-2">
                      {s.label}
                    </p>
                    <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                      {s.value}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-(--primary-600)" />
                  </div>
                </div>
                <div className="border border-dashed border-gray-200" />
                <p className="text-[12px] font-medium text-(--gray-500)">
                  {s.change}
                </p>
              </div>
            );
          })}
        </div>

        {/* Posts table card */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
                All Posts
                <span className="ml-2 text-[12px] font-normal text-(--gray-500)">
                  ({filtered.length})
                </span>
              </p>
              <button
                type="button"
                className="flex items-center gap-1.5 h-10 px-4 rounded-md bg-(--primary-700) text-white text-[14px] font-medium cursor-pointer hover:bg-(--primary-600) transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
            </div>

            {/* Search + Filters inline on md+ */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search */}
              <div className="relative md:flex-1 lg:flex-none lg:w-100">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:ml-auto">
                {/* Category filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryOpen((v) => !v);
                      setStatusOpen(false);
                    }}
                    className="flex items-center gap-2 w-full h-11 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
                  >
                    <BookMarked className="w-3.5 h-3.5 text-(--gray-500) shrink-0" />
                    <span className="flex-1 text-left truncate">
                      {categoryFilter}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${categoryOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {categoryOpen && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-52">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(c);
                            setCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors truncate ${
                            c === categoryFilter
                              ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                              : "text-(--gray-600) hover:bg-(--gray-50)"
                          }`}
                        >
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
                    onClick={() => {
                      setStatusOpen((v) => !v);
                      setCategoryOpen(false);
                    }}
                    className="flex items-center gap-2 w-full h-11 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
                  >
                    <span className="flex-1 text-left">{statusFilter}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {statusOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-36">
                      {STATUSES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setStatusFilter(st);
                            setStatusOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                            st === statusFilter
                              ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                              : "text-(--gray-600) hover:bg-(--gray-50)"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table — horizontal scroll on mobile */}
          <div className="overflow-x-auto -mx-5 px-5">
            <div className="min-w-160">
              {/* Header row */}
              <div className="grid grid-cols-[2fr_1fr_1fr_80px_80px_40px] gap-3 px-3 pb-2 border-b border-(--gray-100)">
                {["Title", "Category", "Status", "Views", "Date", ""].map(
                  (h) => (
                    <p
                      key={h}
                      className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase"
                    >
                      {h}
                    </p>
                  ),
                )}
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
                  <p className="text-[14px] text-(--gray-500)">
                    No posts match your filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  {filtered.map((post, i) => (
                    <div
                      key={post.id}
                      ref={(el) => {
                        rowsRef.current[i] = el;
                      }}
                      className="opacity-0 grid grid-cols-[2fr_1fr_1fr_80px_80px_40px] gap-3 items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors"
                    >
                      {/* Title */}
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-(--text-title) truncate leading-snug">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-(--gray-400)" />
                          <span className="text-[12px] text-(--gray-400)">
                            {post.readTime} read
                          </span>
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-(--primary-50) text-(--primary-700)"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Tag className="w-3 h-3 text-(--gray-400) shrink-0" />
                        <p className="text-[12px] text-(--gray-600) truncate">
                          {post.category}
                        </p>
                      </div>

                      {/* Status */}
                      <StatusBadge status={post.status} />

                      {/* Views */}
                      <p className="text-[14px] font-semibold text-(--text-title)">
                        {post.views > 0 ? post.views.toLocaleString() : "—"}
                      </p>

                      {/* Date */}
                      <p className="text-[12px] text-(--gray-500)">
                        {post.date}
                      </p>

                      {/* Actions */}
                      <div className="flex justify-end">
                        <RowMenu
                          open={openMenuId === post.id}
                          onToggle={() =>
                            setOpenMenuId(
                              openMenuId === post.id ? null : post.id,
                            )
                          }
                          setRef={(el) => menuRefs.current.set(post.id, el)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="w-full xl:w-72 shrink-0 space-y-4">
        {/* Top Posts by Views */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Top Posts by Views
          </p>
          <div className="space-y-3">
            {TOP_POSTS.map((post, i) => (
              <div key={post.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-(--primary-700) text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[12px] font-medium text-(--text-title) truncate leading-snug">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-(--gray-100) rounded-full overflow-hidden">
                      <div
                        ref={(el) => {
                          topBarRef.current[i] = el;
                        }}
                        data-progress={Math.round(
                          (post.views / maxViews) * 100,
                        )}
                        className="h-full rounded-full bg-(--primary-600)"
                        style={{ width: "0%" }}
                      />
                    </div>
                    <span className="text-[12px] text-(--gray-500) shrink-0">
                      {post.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
            Status Breakdown
          </p>
          <div className="space-y-2">
            {(["Published", "Draft", "Scheduled"] as PostStatus[]).map((st) => {
              const count = SEED_POSTS.filter((p) => p.status === st).length;
              const pct = Math.round((count / SEED_POSTS.length) * 100);
              const color =
                st === "Published"
                  ? "bg-green-500"
                  : st === "Draft"
                    ? "bg-orange-400"
                    : "bg-blue-500";
              const text =
                st === "Published"
                  ? "text-green-600"
                  : st === "Draft"
                    ? "text-orange-500"
                    : "text-blue-600";
              return (
                <div key={st} className="flex items-center gap-3">
                  <span className="text-[12px] text-(--gray-600) w-20 shrink-0">
                    {st}
                  </span>
                  <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[12px] font-semibold ${text} w-8 text-right shrink-0`}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Writing Tips */}
        <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-600)" />
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Writing Tips
            </p>
          </div>
          <div className="space-y-2.5">
            {WRITING_TIPS.map(({ color, text }) => (
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
      </div>
    </div>
  );
}
