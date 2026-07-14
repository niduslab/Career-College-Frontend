"use client";

import { useState, useRef, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import gsap from "gsap";

import VideoPlayer from "./VideoPlayer";
import CurriculumPanel from "./CurriculumPanel";
import AiCopilot from "./AiCopilot";
import TabContent from "./TabContent";
import { ACTIVE_LESSON, AI_INITIAL, TABS, modules } from "./data";
import type { AiMessage, TabKey } from "./types";
import { useMyCourseDetail } from "@/hooks/use-course-catalog";

export default function CoursePlayerPage({
  courseSlug,
}: {
  courseSlug?: string;
}) {
  const router = useRouter();
  const { data: courseDetail, isLoading: courseLoading } =
    useMyCourseDetail(courseSlug);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    { role: "ai", text: AI_INITIAL },
  ]);
  const [expandedModules, setExpandedModules] = useState<number[]>([4, 5, 6]);

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

  const toggleModule = (id: number) =>
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

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

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const doneLessons = modules.reduce(
    (s, m) => s + m.lessons.filter((l) => l.status === "completed").length,
    0,
  );

  const curriculumProps = {
    doneLessons,
    totalLessons,
    expandedModules,
    toggleModule,
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
    <div className="flex h-[calc(100svh-64px)] overflow-hidden -m-4 lg:-m-6">
      {/* ── Left overlay (mobile/tablet) ── */}
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
                {courseDetail.enrollment && (
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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push("/dashboard/learner/quiz-assessment")}
              className="flex items-center cursor-pointer gap-1.5 text-[14px] h-10 font-medium text-(--gray-500) border border-(--gray-200) px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-(--gray-50) transition-colors whitespace-nowrap"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Take Quiz</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/learner/ai-assistant")}
              className="flex cursor-pointer items-center gap-1.5 text-[14px] h-10 font-medium text-white bg-(--primary-600) hover:bg-(--primary-700) px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Video */}
        <div ref={playerRef} className="opacity-0 shrink-0 w-full">
          <VideoPlayer moduleLabel={ACTIVE_LESSON.moduleLabel} />
        </div>

        {/* Tabs */}
        <div ref={centerRef} className="opacity-0 flex-1 bg-white">
          <div className="flex items-center overflow-x-auto border-b border-(--gray-200) scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`text-[14px] cursor-pointer font-medium px-3 sm:px-4 py-3 sm:py-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === t.key
                    ? "border-(--primary-600) text-(--primary-600)"
                    : "border-transparent text-(--gray-500) hover:text-(--text-title)"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <TabContent activeTab={activeTab} />
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
