"use client";

import { useState, useRef, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, X } from "lucide-react";
import gsap from "gsap";

import VideoPlayer from "./VideoPlayer";
import CurriculumPanel from "./CurriculumPanel";
import QuizPanel from "./QuizPanel";
import AssignmentPanel from "./AssignmentPanel";
import CodingExercisePanel from "./CodingExercisePanel";
import ReviewsPanel from "./ReviewsPanel";
import DiscussionPanel from "./DiscussionPanel";
import CourseTabs from "@/components/course-details/course-tabs";
import CourseDescription from "@/components/course-details/course-description";
import CourseRequirements from "@/components/course-details/course-requirements";
import WhatYouWillLearn from "@/components/course-details/what-you-will-learn";
import { RichText } from "@/components/common/rich-text";
import AiCopilot from "./AiCopilot";
import { AI_INITIAL } from "./data";
import type { AiMessage } from "./types";
import { useMyCourseDetail } from "@/hooks/use-course-catalog";
import {
  useLearnerCurriculum,
  useLearnerLecture,
  useLectureStreamUrl,
  useSaveWatchProgress,
} from "@/hooks/use-learner-consumption";
import type { CurriculumItem, LearnerCurriculum } from "@/lib/course-api";

export default function CoursePlayerPage({
  courseSlug,
  topOffsetPx = 64,
}: {
  courseSlug?: string;
  /** Height of the chrome above this page (e.g. the dashboard topbar) to subtract from the viewport. 0 for standalone routes with no topbar. */
  topOffsetPx?: number;
}) {
  const router = useRouter();
  const { data: courseDetail, isLoading: courseLoading } =
    useMyCourseDetail(courseSlug);
  const isInstructorPreview = courseDetail?.is_instructor === true;
  const { data: curriculum, isLoading: curriculumLoading } =
    useLearnerCurriculum(courseSlug);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [belowPlayerTab, setBelowPlayerTab] = useState<"Reviews" | "Discussion">(
    "Reviews",
  );
  const PREVIEW_TABS = [
    "Audiences",
    "Description",
    "What You Will Learn",
    "Requirements",
  ] as const;
  const [previewTab, setPreviewTab] =
    useState<(typeof PREVIEW_TABS)[number]>("Audiences");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    { role: "ai", text: AI_INITIAL },
  ]);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [activeItem, setActiveItem] = useState<CurriculumItem | null>(null);

  const activeLectureId =
    activeItem?.item_type === "lecture" ? activeItem.object_id : undefined;
  const { data: lecture, isLoading: lectureLoading } =
    useLearnerLecture(activeLectureId);
  // Signed CloudFront URL — only fetched once we know the lecture is a video
  // with a transcoded playlist, so an article or a still-processing upload
  // doesn't fire a request that can only 422.
  const { data: streamUrl } = useLectureStreamUrl(
    lecture?.lecture_type === "video" && lecture.stream_master_playlist
      ? activeLectureId
      : undefined,
  );
  const saveProgress = useSaveWatchProgress(courseSlug);
  const lastSavedRef = useRef<number>(-1);

  // Each lecture tracks its own watch cursor — without the reset.
  useEffect(() => {
    lastSavedRef.current = -1;
  }, [activeLectureId]);

  // Client-tracked completions. The curriculum endpoint only carries.
  const storageKey = courseSlug
    ? `course-player:completed:${courseSlug}`
    : null;
  const [locallyCompleted, setLocallyCompleted] = useState<Set<number>>(
    () => new Set(),
  );
  const locallyCompletedRef = useRef<Set<number>>(locallyCompleted);
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const ids: unknown = JSON.parse(raw);
      if (!Array.isArray(ids)) return;
      const merged = new Set(locallyCompletedRef.current);
      for (const id of ids) if (typeof id === "number") merged.add(id);
      if (merged.size === locallyCompletedRef.current.size) return;
      locallyCompletedRef.current = merged;
      setLocallyCompleted(merged);
    } catch {}
  }, [storageKey]);
  const markLocallyCompleted = (contentId: number) => {
    if (locallyCompletedRef.current.has(contentId)) return;
    const next = new Set(locallyCompletedRef.current);
    next.add(contentId);
    locallyCompletedRef.current = next;
    setLocallyCompleted(next);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
    }
  };

  const handleVideoProgress = (
    watchedSeconds: number,
    durationSeconds: number,
  ) => {
    // Instructor preview — progress saving is learner-only.
    if (!activeLectureId || isInstructorPreview) return;
    const rounded = Math.floor(watchedSeconds);
    const completed = rounded >= Math.floor(durationSeconds);
    // Only save on real forward progress, at most once per ~5s tick.
    if (rounded <= lastSavedRef.current) {
      if (completed && activeItem) markLocallyCompleted(activeItem.content_id);
      return;
    }
    lastSavedRef.current = rounded;
    // mutateAsync (not mutate) so VideoPlayer.
    const contentId = activeItem?.content_id;
    return saveProgress
      .mutateAsync({
        lectureId: activeLectureId,
        input: {
          watched_seconds: rounded,
          is_completed: completed,
        },
      })
      .then((res) => {
        if (completed && contentId !== undefined)
          markLocallyCompleted(contentId);
        return res;
      });
  };
  const [seededFor, setSeededFor] = useState<LearnerCurriculum | null>(null);
  if (
    curriculum &&
    curriculum !== seededFor &&
    curriculum.sections.length > 0
  ) {
    setSeededFor(curriculum);
    const flat = curriculum.sections.flatMap((s) =>
      s.items.map((item) => ({ item, sectionId: s.id })),
    );
    const isLearnerView = flat.some((f) => f.item.is_completed !== undefined);
    const resume = isLearnerView
      ? (flat.find(
          (f) =>
            !f.item.is_completed && !locallyCompleted.has(f.item.content_id),
        ) ?? flat[0])
      : flat[0];
    if (resume) {
      setExpandedSections((prev) =>
        prev.length === 0 ? [resume.sectionId] : prev,
      );
      setActiveItem((prev) => prev ?? resume.item);
    }
  }

  const playerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  // Open panels on xl+ after hydration
  useEffect(() => {
    if (window.innerWidth >= 1280) {
      startTransition(() => {
        setSidebarOpen(true);
        setAiOpen(true);
      });
    }
  }, []);

  // Entrance animation
  useEffect(() => {
    const els = [playerRef.current, centerRef.current].filter(Boolean);
    gsap.fromTo(
      els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" },
    );
  }, []);

  const toggleSection = (id: number) =>
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // Flattened items in curriculum order (section order, then item position)
  const flatItems = (curriculum?.sections ?? []).flatMap((s) =>
    s.items.map((item) => ({ item, sectionId: s.id })),
  );
  const activeFlatIndex = activeItem
    ? flatItems.findIndex((f) => f.item.content_id === activeItem.content_id)
    : -1;
  const hasPrevItem = activeFlatIndex > 0;
  const hasNextItem =
    activeFlatIndex >= 0 && activeFlatIndex < flatItems.length - 1;

  // An item is reachable only once everything before it is completed.
  const isSequential = flatItems.some((f) => f.item.is_completed !== undefined);
  const isItemDone = (item: CurriculumItem) =>
    !!item.is_completed || locallyCompleted.has(item.content_id);
  const frontierIndex = isSequential
    ? flatItems.findIndex((f) => !isItemDone(f.item))
    : -1;
  const lockedContentIds = new Set(
    frontierIndex === -1
      ? []
      : flatItems.slice(frontierIndex + 1).map((f) => f.item.content_id),
  );
  const nextItemLocked =
    hasNextItem &&
    lockedContentIds.has(flatItems[activeFlatIndex + 1].item.content_id);

  const selectItem = (item: CurriculumItem, sectionId: number) => {
    setActiveItem(item);
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev : [...prev, sectionId],
    );
  };

  const goToPrevItem = () => {
    if (!hasPrevItem) return;
    const prev = flatItems[activeFlatIndex - 1];
    selectItem(prev.item, prev.sectionId);
  };

  const goToNextItem = () => {
    if (!hasNextItem) return;

    if (
      isSequential &&
      flatItems
        .slice(0, activeFlatIndex + 1)
        .some(
          (f) =>
            !f.item.is_completed &&
            !locallyCompletedRef.current.has(f.item.content_id),
        )
    )
      return;
    const next = flatItems[activeFlatIndex + 1];
    selectItem(next.item, next.sectionId);
  };

  const sendAiMessage = () => {
    const trimmed = aiInput.trim();
    if (!trimmed) return;
    setAiMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      {
        role: "ai",
        text: "Great question! Let me break that down for you based on this lesson...",
      },
    ]);
    setAiInput("");
    setTimeout(
      () => aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const curriculumProps = {
    curriculum,
    isLoading: curriculumLoading,
    activeContentId: activeItem?.content_id ?? null,
    onSelectItem: setActiveItem,
    expandedSections,
    toggleSection,
    lockedContentIds,
    completedContentIds: locallyCompleted,
  };
  const aiProps = {
    aiMessages,
    aiInput,
    setAiInput,
    sendAiMessage,
    aiMessagesEndRef,
    setAiMessages,
  };

  return (
    <div
      className="flex overflow-hidden -m-4 lg:-m-6"
      style={{ height: `calc(100svh - ${topOffsetPx}px)` }}
    >
      {/* Left overlay (mobile/tablet) */}
      {sidebarOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`xl:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-(--gray-200) flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--gray-200) shrink-0">
          <span className="text-[14px] font-semibold text-(--text-title)">
            Course Content
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100)"
          >
            <X className="w-4 h-4 text-(--gray-500)" />
          </button>
        </div>
        <CurriculumPanel {...curriculumProps} />
      </aside>

      {/* ── Left inline panel (xl+) ── */}
      <aside
        className={`hidden xl:flex flex-col bg-white border-r border-(--gray-200) transition-all duration-300 overflow-hidden shrink-0 ${sidebarOpen ? "w-72 2xl:w-80" : "w-0"}`}
      >
        <div
          className={`flex flex-col h-full ${sidebarOpen ? "min-w-[288px] 2xl:min-w-[320px]" : ""}`}
        >
          <CurriculumPanel {...curriculumProps} />
        </div>
      </aside>

      {/* ── Center ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-(--gray-50)">
        {/* Course header */}
        {courseSlug && (
          <div className="px-3 sm:px-4 py-3 bg-white border-b border-(--gray-200) shrink-0">
            {courseLoading ? (
              <div className="flex items-center gap-2 text-(--gray-400) text-[14px]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading course...
              </div>
            ) : courseDetail ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-[15px] sm:text-[16px] font-semibold text-(--text-title) truncate">
                    {courseDetail.course.title}
                  </h1>
                  <p className="text-[12px] text-(--gray-500) truncate">
                    {courseDetail.course.instructors
                      .map((i) => i.full_name)
                      .join(", ") || "Career College"}
                  </p>
                </div>
                {isInstructorPreview ? (
                  <button
                    onClick={() => router.back()}
                    className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Instructor Preview — Back to Course Builder
                  </button>
                ) : (
                  courseDetail.enrollment && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-32 h-2 rounded-full bg-(--gray-100)">
                        <div
                          className="h-2 rounded-full bg-(--primary-600) transition-all duration-700"
                          style={{
                            width: `${courseDetail.enrollment.progress_percent}%`,
                          }}
                        />
                      </div>
                      <span className="text-[12px] font-semibold text-(--primary-700) whitespace-nowrap">
                        {courseDetail.enrollment.progress_percent}%
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-[14px] text-rose-500">Course not found.</p>
            )}
          </div>
        )}

        {/* Topbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-white border-b border-(--gray-200) shrink-0 gap-2">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[14px] cursor-pointer font-medium text-(--gray-500) hover:text-(--text-title) transition-colors shrink-0"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {sidebarOpen ? "Hide" : "Show"}
            </span>
          </button>

          {!isInstructorPreview && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => router.push("/dashboard/learner/ai-assistant")}
                className="flex cursor-pointer items-center gap-1.5 text-[14px] h-10 font-medium text-white bg-(--primary-600) hover:bg-(--primary-700) px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
            </div>
          )}
        </div>

        {/* Lecture content */}
        <div ref={playerRef} className="opacity-0 shrink-0 w-full">
          {activeItem?.item_type === "lecture" ? (
            lectureLoading ? (
              <div className="w-full aspect-video bg-black flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
              </div>
            ) : lecture?.lecture_type === "article" ? (
              <div className="bg-white p-4 sm:p-6 lg:p-8 max-h-[60vh] overflow-y-auto">
                <div
                  className="prose prose-sm max-w-none text-(--text-title)"
                  dangerouslySetInnerHTML={{ __html: lecture.article_content }}
                />
                <div className="mt-6 pt-4 border-t border-(--gray-100)">
                  {isInstructorPreview ? (
                    <p className="text-[13px] text-(--gray-400) italic">
                      Preview only — progress tracking is available to enrolled
                      learners.
                    </p>
                  ) : lecture.progress?.is_completed ? (
                    <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-emerald-600">
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        activeLectureId &&
                        saveProgress.mutate({
                          lectureId: activeLectureId,
                          input: { watched_seconds: 0, is_completed: true },
                        })
                      }
                      disabled={saveProgress.isPending}
                      className="px-4 py-2 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saveProgress.isPending
                        ? "Saving..."
                        : "Mark as complete"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <VideoPlayer
                moduleLabel={activeItem.title}
                src={streamUrl}
                startAtSeconds={lecture?.progress?.watched_seconds ?? 0}
                onProgress={handleVideoProgress}
                onPrevLesson={hasPrevItem ? goToPrevItem : undefined}
                onNextLesson={hasNextItem ? goToNextItem : undefined}
                nextLocked={nextItemLocked}
              />
            )
          ) : activeItem?.item_type === "quiz" ? (
            <QuizPanel
              quizId={activeItem.object_id}
              courseSlug={courseSlug}
              onCompleted={() => markLocallyCompleted(activeItem.content_id)}
              onNextLesson={hasNextItem ? goToNextItem : undefined}
              isInstructorPreview={isInstructorPreview}
            />
          ) : activeItem?.item_type === "assignment" ? (
            <AssignmentPanel
              assignmentId={activeItem.object_id}
              courseSlug={courseSlug}
              onCompleted={() => markLocallyCompleted(activeItem.content_id)}
              onNextLesson={hasNextItem ? goToNextItem : undefined}
              isInstructorPreview={isInstructorPreview}
            />
          ) : activeItem?.item_type === "coding" ? (
            <CodingExercisePanel
              exerciseId={activeItem.object_id}
              courseSlug={courseSlug}
              onCompleted={() => markLocallyCompleted(activeItem.content_id)}
              onNextLesson={hasNextItem ? goToNextItem : undefined}
              isInstructorPreview={isInstructorPreview}
            />
          ) : (
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <p className="text-white/40 text-[14px]">
                Select an item from the curriculum to begin.
              </p>
            </div>
          )}
        </div>

        {/* Lecture overview — video lectures only; quiz/assignment/coding
            panels already show their own title + description inline. */}
        {activeItem?.item_type === "lecture" &&
          lecture?.lecture_type !== "article" && (
            <div
              ref={centerRef}
              className="opacity-0 shrink-0 bg-white p-4 sm:p-6 lg:p-8"
            >
              <div className="max-w-3xl">
                <h2 className="text-[18px] sm:text-[20px] font-bold text-(--text-title) mb-2">
                  {activeItem.title}
                </h2>
              </div>
            </div>
          )}

        {/* Reviews / Discussion — tied to the course, not the active
            curriculum item. Tabbed (same CourseTabs used on the public
            course-details page) instead of always stacked, since each
            section can run long on its own. */}
        <div className="flex-1 bg-white px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-3xl">
            {courseLoading ? null : isInstructorPreview ? (
              courseDetail?.course && (
                <>
                  <CourseTabs
                    tabs={PREVIEW_TABS.map((label) => ({ label }))}
                    activeTab={previewTab}
                    setActiveTab={(label) =>
                      setPreviewTab(label as (typeof PREVIEW_TABS)[number])
                    }
                  />
                  {previewTab === "Audiences" &&
                    (courseDetail.course.audiences?.trim() ? (
                      <div className="mt-6 lg:mt-8">
                        <div className="rounded-xl border border-gray-200 shadow-sm p-6">
                          <RichText
                            html={courseDetail.course.audiences}
                            className="sg-p-small --text-paragraph leading-relaxed [&_p]:mb-3 last:[&_p]:mb-0"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-6 text-[13px] text-(--gray-400)">
                        No audiences added yet.
                      </p>
                    ))}
                  {previewTab === "Description" && (
                    <CourseDescription description={courseDetail.course.description} />
                  )}
                  {previewTab === "What You Will Learn" && (
                    <WhatYouWillLearn
                      learningObjectives={courseDetail.course.learning_objectives}
                    />
                  )}
                  {previewTab === "Requirements" && (
                    <CourseRequirements
                      prerequisites={courseDetail.course.prerequisites}
                    />
                  )}
                </>
              )
            ) : (
              <>
                <CourseTabs
                  tabs={[{ label: "Reviews" }, { label: "Discussion" }]}
                  activeTab={belowPlayerTab}
                  setActiveTab={(label) =>
                    setBelowPlayerTab(label as "Reviews" | "Discussion")
                  }
                />
                {belowPlayerTab === "Reviews" ? (
                  <ReviewsPanel courseSlug={courseSlug} />
                ) : (
                  <DiscussionPanel
                    courseSlug={courseSlug}
                    isInstructorPreview={isInstructorPreview}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Right overlay (mobile/tablet) ── */}
      {aiOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setAiOpen(false)}
        />
      )}
      <aside
        className={`xl:hidden fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white border-l border-(--gray-200) flex flex-col transition-transform duration-300 ${aiOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-end px-4 py-2 border-b border-(--gray-200) shrink-0">
          <button
            onClick={() => setAiOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100)"
          >
            <X className="w-4 h-4 text-(--gray-500)" />
          </button>
        </div>
        <AiCopilot {...aiProps} />
      </aside>

      {/* ── Right inline panel (xl+) ── */}
      <aside
        className={`hidden xl:flex flex-col bg-white border-l border-(--gray-200) transition-all duration-300 overflow-hidden shrink-0 ${aiOpen ? "w-72 2xl:w-80" : "w-0"}`}
      >
        <div
          className={`flex flex-col h-full ${aiOpen ? "min-w-[288px] 2xl:min-w-[320px]" : ""}`}
        >
          <AiCopilot {...aiProps} />
        </div>
      </aside>
    </div>
  );
}
