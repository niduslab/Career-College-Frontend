"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Search,
  Plus,
  ChevronDown,
  Flame,
  Clock,
  BookOpen,
} from "lucide-react";
import gsap from "gsap";

import { Pagination } from "@/components/common/pagination";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/common/query-states";
import {
  useMyCourses,
  ALL_ENROLLMENTS_PAGE_SIZE,
} from "@/hooks/use-course-catalog";
import {
  useCourseQuestions,
  useCreateQuestion,
  useCreateReply,
  useDeleteQuestion,
  useDeleteReply,
  useQuestionDetail,
  useUpvoteQuestion,
  useUpvoteReply,
} from "@/hooks/use-course-qa";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

import type { SortOption } from "./types";
import { SORT_OPTIONS, SORT_TO_ORDERING } from "./data";
import { NewThreadModal } from "./new-thread-modal";
import { ThreadCard } from "./thread-card";
import { ThreadDrawer } from "./thread-drawer";

const PAGE_SIZE = 4;

/**
 * Course Q&A.
 *
 * The backend board is strictly per-course, so this page shows one enrolled
 * course at a time rather than a global feed — the alternative would be one
 * request per enrollment. The selection lives in the URL (`?course=<slug>`)
 * so refresh and deep links work.
 */
export default function DiscussionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course");

  const [sortBy, setSortBy] = useState<SortOption>("Most Recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openThreadId, setOpenThreadId] = useState<number | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // Upvotes have no per-viewer vote row server-side, so the only guard
  // against double-counting is remembering what this session clicked.
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set());

  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // The course selector must list every enrollment, not the first page.
  const { data: myCourses, isLoading: coursesLoading } = useMyCourses({
    page_size: ALL_ENROLLMENTS_PAGE_SIZE,
  });
  const courses = useMemo(
    () => (myCourses?.results ?? []).map((enrollment) => enrollment.course),
    [myCourses],
  );

  const selectedCourse = useMemo(() => {
    if (courses.length === 0) return null;
    return courses.find((course) => course.slug === courseParam) ?? courses[0];
  }, [courses, courseParam]);

  const selectCourse = (slug: string) => {
    setCurrentPage(1);
    setOpenThreadId(null);
    router.replace(`?course=${slug}`, { scroll: false });
  };

  const {
    data: questionPage,
    isLoading,
    isError,
    refetch,
  } = useCourseQuestions(selectedCourse?.slug, {
    page: currentPage,
    page_size: PAGE_SIZE,
    ordering: SORT_TO_ORDERING[sortBy],
  });

  const { data: openThread, isLoading: threadLoading } = useQuestionDetail(
    openThreadId ?? undefined,
  );

  const createQuestion = useCreateQuestion(selectedCourse?.slug);
  const deleteQuestion = useDeleteQuestion(selectedCourse?.slug);
  const createReply = useCreateReply(selectedCourse?.slug);
  const deleteReply = useDeleteReply(selectedCourse?.slug);
  const upvoteQuestion = useUpvoteQuestion(selectedCourse?.slug);
  const upvoteReply = useUpvoteReply(selectedCourse?.slug);

  const threads = useMemo(() => questionPage?.results ?? [], [questionPage]);
  const total = questionPage?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // The Q&A list endpoint has no search param, so this filters the page in
  // hand. Ordering and pagination stay server-side.
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter(
      (thread) =>
        thread.title.toLowerCase().includes(query) ||
        thread.body.toLowerCase().includes(query) ||
        thread.author_name.toLowerCase().includes(query),
    );
  }, [threads, search]);

  const handleUpvoteQuestion = (id: number) => {
    if (upvoted.has(id)) return;
    setUpvoted((prev) => new Set(prev).add(id));
    upvoteQuestion.mutate(id, {
      onError: (err) => {
        setUpvoted((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        notify.error(
          err instanceof ApiError
            ? err.message
            : "Couldn't register the upvote.",
        );
      },
    });
  };

  const handleNewQuestion = (title: string, body: string) => {
    createQuestion.mutate(
      { title, body },
      {
        onSuccess: () => {
          notify.success("Question posted.");
          setShowNewModal(false);
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError
              ? err.message
              : "Couldn't post the question.",
          ),
      },
    );
  };

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
  }, [selectedCourse?.slug, search, sortBy, currentPage, filtered.length]);

  if (!coursesLoading && courses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
            Course Q&amp;A
          </h1>
          <p className="text-[14px] text-(--gray-500) mt-1">
            Ask questions and get answers from your course instructors.
          </p>
        </div>
        <EmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title="Enroll in a course to join its Q&amp;A"
          description="Each course has its own question board, visible to enrolled learners and the instructors."
          action={
            <Link
              href="/dashboard/learner/course-catalog"
              className="inline-flex items-center gap-2 rounded-lg bg-(--primary-600) px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-(--primary-700)"
            >
              <BookOpen className="w-4 h-4" />
              Browse courses
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        ref={headerRef}
        className="opacity-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
            Course Q&amp;A
          </h1>
          <p className="text-[14px] text-(--gray-500) mt-1">
            Ask questions and get answers from your course instructors.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          disabled={!selectedCourse}
          className="flex items-center justify-center gap-2 h-12 px-5 w-full sm:w-auto rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Ask a Question
        </button>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Course selector replaces the old category chips — the course is
            the scope. */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {courses.map((course) => (
            <button
              key={course.slug}
              onClick={() => selectCourse(course.slug)}
              className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] transition-colors cursor-pointer border whitespace-nowrap shrink-0 max-w-56 truncate ${selectedCourse?.slug === course.slug ? "bg-(--primary-600) text-white border-(--primary-600) font-medium" : "bg-white text-(--gray-500) border-(--gray-200) hover:border-(--primary-300) font-normal"}`}
            >
              {course.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 xl:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search this page..."
              className="w-full sm:w-56 xl:w-56 pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
            />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 h-11 px-3.5 rounded-md border border-(--gray-200) bg-white text-[14px] text-(--gray-500) hover:border-(--primary-300) transition-colors cursor-pointer whitespace-nowrap"
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

      <p className="text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {isLoading ? "—" : total}
        </span>{" "}
        question{total !== 1 ? "s" : ""}
        {selectedCourse && (
          <>
            {" "}
            in{" "}
            <span className="font-semibold text-(--primary-600)">
              {selectedCourse.title}
            </span>
          </>
        )}
      </p>

      {isLoading || coursesLoading ? (
        <ListSkeleton count={3} />
      ) : isError ? (
        <ErrorState title="Couldn't load questions" onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-6 h-6" />}
          title={total === 0 ? "No questions yet" : "No questions found"}
          description={
            total === 0
              ? "Be the first to ask something about this course."
              : "Try a different keyword, or clear the search box."
          }
        />
      ) : (
        <>
          <div ref={listRef} className="space-y-4">
            {filtered.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                hasUpvoted={upvoted.has(thread.id)}
                onUpvote={handleUpvoteQuestion}
                onOpen={setOpenThreadId}
                onDelete={(id) => deleteQuestion.mutate(id)}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {openThreadId !== null && (
        <ThreadDrawer
          thread={openThread ?? null}
          isLoading={threadLoading}
          submitting={createReply.isPending}
          onClose={() => setOpenThreadId(null)}
          onUpvoteQuestion={handleUpvoteQuestion}
          onUpvoteReply={(id) => upvoteReply.mutate(id)}
          onAddReply={(questionId, body) =>
            createReply.mutate(
              { questionId, body },
              {
                onError: (err) =>
                  notify.error(
                    err instanceof ApiError
                      ? err.message
                      : "Couldn't post the reply.",
                  ),
              },
            )
          }
          onDeleteReply={(id) => deleteReply.mutate(id)}
        />
      )}

      {showNewModal && selectedCourse && (
        <NewThreadModal
          courseTitle={selectedCourse.title}
          submitting={createQuestion.isPending}
          onClose={() => setShowNewModal(false)}
          onSubmit={handleNewQuestion}
        />
      )}
    </div>
  );
}
