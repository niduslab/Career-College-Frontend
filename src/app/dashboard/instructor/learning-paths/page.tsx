"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Target, BookOpen } from "lucide-react";
import gsap from "gsap";
import PageHeader from "@/components/dashboard/common/page-header";
import { Pagination } from "@/components/common/pagination";
import {
  listOwnedLearningPaths,
  createLearningPath,
  type LearningPathManage,
  type LearningPathAuthoringStatus,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const STATUS_LABEL: Record<LearningPathAuthoringStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const STATUS_STYLE: Record<LearningPathAuthoringStatus, string> = {
  draft: "bg-[#E5E7EB] text-[#6A7282]",
  published: "bg-[#D0FAE5] text-[#007A55]",
  archived: "bg-[#E5E7EB] text-[#6A7282]",
};

const PAGE_SIZE = 12;

/** Description is stored as HTML — strip tags for the plain-text card preview. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function InstructorLearningPathsPage() {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPathManage[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    listOwnedLearningPaths({ page, page_size: PAGE_SIZE })
      .then((res) => {
        setPaths(res.results);
        setCount(res.count);
      })
      .catch((err) => {
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load learning paths.",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleCreate = () => {
    setCreating(true);
    createLearningPath({ title: "Untitled Learning Path" })
      .then((res) => {
        notify.success(res.message || "Learning path created.");
        router.push(`/dashboard/instructor/learning-paths/${res.data.id}`);
      })
      .catch((err) => {
        notify.error(
          err instanceof ApiError ? err.message : "Failed to create learning path.",
        );
      })
      .finally(() => setCreating(false));
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".learning-path-card");
    if (cards.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.killTweensOf(cards);
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power3.out" },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [paths]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Learning Paths"
        subtitle="Curated, ordered course roadmaps toward a career goal."
        action={
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 cursor-pointer bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Path
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl border border-(--gray-200) bg-(--gray-50) animate-pulse"
            />
          ))}
        </div>
      ) : paths.length === 0 ? (
        <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
          You haven&apos;t created any learning paths yet.
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {paths.map((path) => (
            <button
              key={path.id}
              onClick={() =>
                router.push(`/dashboard/instructor/learning-paths/${path.id}`)
              }
              className="learning-path-card opacity-0 text-left bg-white rounded-2xl border border-(--gray-200) p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-(--primary-300) transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 w-fit text-[11px] font-semibold text-(--primary-700) bg-linear-to-br from-(--primary-50) to-(--primary-100) px-2 py-0.5 rounded-full">
                  <Target className="w-3.5 h-3.5" />
                  Career Goal
                </span>
                <span
                  className={`shrink-0 text-[12px] font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[path.status]}`}
                >
                  {STATUS_LABEL[path.status]}
                </span>
              </div>

              <h3 className="text-[16px] font-bold text-(--text-title) mt-3 line-clamp-2">
                {path.career_goal || path.title}
              </h3>

              {path.description && (
                <p className="text-[13px] text-(--gray-500) mt-1.5 line-clamp-2">
                  {stripHtml(path.description)}
                </p>
              )}

              <p className="text-[12px] text-(--gray-400) mt-3 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {path.milestones.length} milestone
                {path.milestones.length === 1 ? "" : "s"}
              </p>

              {path.skill_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {path.skill_tags.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] text-(--gray-500) font-normal border border-(--gray-200) px-2 py-0.5 rounded-full bg-(--gray-50)"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
