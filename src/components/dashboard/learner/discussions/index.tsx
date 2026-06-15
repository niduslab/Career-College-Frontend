"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Reply,
  Search,
  Plus,
  ChevronDown,
  Flame,
  Clock,
} from "lucide-react";
import gsap from "gsap";

import instructor6 from "@/assets/images/instructors/instructor6.webp";

import type { ThreadCategory, SortOption, Thread } from "./types";
import { THREADS, CATEGORIES, SORT_OPTIONS } from "./data";
import { Pagination } from "@/components/common/pagination";
import { NewThreadModal } from "./new-thread-modal";
import { ThreadCard } from "./thread-card";
import { ThreadDrawer } from "./thread-drawer";

// Main page
export default function DiscussionsPage() {
  const [threads, setThreads] = useState(THREADS);
  const [activeCategory, setActiveCategory] = useState<ThreadCategory>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Most Recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openThreadId, setOpenThreadId] = useState<number | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 4;

  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filtering + sorting
  const filtered = threads
    .filter((t) => {
      const matchCat =
        activeCategory === "All" || t.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        t.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortBy === "Most Popular") return b.likes - a.likes;
      if (sortBy === "Most Replies") return b.replies.length - a.replies.length;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const openThread =
    openThreadId !== null
      ? (threads.find((t) => t.id === openThreadId) ?? null)
      : null;

  // Handlers
  const handleLikeThread = (id: number) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              liked: !t.liked,
              likes: t.liked ? t.likes - 1 : t.likes + 1,
            }
          : t,
      ),
    );
  };

  const handleLikeReply = (threadId: number, replyId: number) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              replies: t.replies.map((r) =>
                r.id === replyId
                  ? {
                      ...r,
                      liked: !r.liked,
                      likes: r.liked ? r.likes - 1 : r.likes + 1,
                    }
                  : r,
              ),
            }
          : t,
      ),
    );
  };

  const handleAddReply = (threadId: number, body: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              replies: [
                ...t.replies,
                {
                  id: Date.now(),
                  author: "You",
                  avatar: instructor6,
                  body,
                  likes: 0,
                  liked: false,
                  time: "Just now",
                },
              ],
            }
          : t,
      ),
    );
  };

  const handleNewThread = (
    title: string,
    body: string,
    category: ThreadCategory,
  ) => {
    const newThread: Thread = {
      id: Date.now(),
      title,
      body,
      author: "You",
      avatar: instructor6,
      category,
      tags: [],
      likes: 0,
      liked: false,
      replies: [],
      time: "Just now",
      course: "General",
    };
    setThreads((prev) => [newThread, ...prev]);
  };

  // Animations
  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const cards = Array.from(
      listRef.current.querySelectorAll(".discussion-card"),
    );
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power3.out" },
    );
  }, [activeCategory, search, sortBy, currentPage]);

  const totalReplies = threads.reduce((s, t) => s + t.replies.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerRef}
        className="opacity-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
            Discussions
          </h1>
          <p className="text-[14px] text-(--gray-500) mt-1">
            Ask questions, share insights, and connect with fellow learners.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-2 h-12 px-5 w-full sm:w-auto rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Discussion
        </button>
      </div>

      {/* Stats row */}
      {/* <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Threads",
            value: threads.length,
            icon: MessageSquare,
            iconBg: "bg-(--primary-100)",
            color: "text-(--primary-600)",
            badge: "active discussions",
          },
          {
            label: "Trending",
            value: threads.filter((t) => t.likes >= 20).length,
            icon: Flame,
            iconBg: "bg-rose-100",
            color: "text-rose-500",
            badge: "hot this week",
          },
          {
            label: "Replies",
            value: totalReplies,
            icon: Reply,
            iconBg: "bg-emerald-100",
            color: "text-emerald-600",
            badge: "total responses",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                    {s.label}
                  </p>
                  <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
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
              <p className="text-[12px] font-medium text-(--gray-400)">
                {s.badge}
              </p>
            </div>
          );
        })}
      </div> */}

      {/* Filter row */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 h-11 rounded-md  text-[14px]  transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${activeCategory === cat ? "bg-(--primary-600) text-white border-(--primary-600) font-medium" : "bg-white text-(--gray-500) border-(--gray-200) hover:border-(--primary-300) font-normal"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 xl:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search discussions..."
              className="w-full sm:w-56 xl:w-56 pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
            />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 h-11 px-3.5 rounded-md border border-(--gray-200) bg-white  text-[14px] text-(--gray-500) hover:border-(--primary-300) transition-colors cursor-pointer whitespace-nowrap"
            >
              {sortBy === "Most Recent" ? (
                <Clock className="w-4 h-4" />
              ) : sortBy === "Most Popular" ? (
                <Flame className="w-4 h-4" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              {sortBy}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-12 z-20 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1.5 w-44">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortBy(opt);
                      setSortOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-[14px] hover:bg-(--gray-50) transition-colors cursor-pointer ${sortBy === opt ? "font-semibold text-(--primary-600)" : "text-(--text-title)"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {filtered.length}
        </span>{" "}
        thread{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "All" && (
          <>
            {" "}
            in{" "}
            <span className="font-semibold text-(--primary-600)">
              {activeCategory}
            </span>
          </>
        )}
      </p>

      {/* Thread list */}
      <div ref={listRef} className="space-y-4">
        {paginated.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            onLike={handleLikeThread}
            onOpen={(id) => setOpenThreadId(id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-(--gray-400)">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-[16px] font-medium text-(--text-title)">
              No discussions found
            </p>
            <p className="text-[14px] mt-1">
              Try a different keyword or category
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Thread drawer */}
      {openThread && (
        <ThreadDrawer
          thread={openThread}
          onClose={() => setOpenThreadId(null)}
          onLikeThread={handleLikeThread}
          onLikeReply={handleLikeReply}
          onAddReply={handleAddReply}
        />
      )}

      {/* New thread modal */}
      {showNewModal && (
        <NewThreadModal
          onClose={() => setShowNewModal(false)}
          onSubmit={handleNewThread}
        />
      )}
    </div>
  );
}
