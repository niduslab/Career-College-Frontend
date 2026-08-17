"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, KeyRound } from "lucide-react";
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

export default function InstructorLearningPathsPage() {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPathManage[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);

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
        <div className="flex items-center justify-center py-20 text-(--gray-500)">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading learning paths…
        </div>
      ) : paths.length === 0 ? (
        <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
          You haven&apos;t created any learning paths yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((path) => (
            <button
              key={path.id}
              onClick={() =>
                router.push(`/dashboard/instructor/learning-paths/${path.id}`)
              }
              className="text-left bg-white rounded-2xl border border-(--gray-200) p-5 hover:shadow-md hover:border-(--primary-300) transition-all cursor-pointer"
            >
              <span
                className={`self-start text-[12px] font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[path.status]}`}
              >
                {STATUS_LABEL[path.status]}
              </span>
              <h3 className="text-[16px] font-semibold text-(--text-title) mt-3 line-clamp-2">
                {path.title}
              </h3>
              {path.career_goal && (
                <p className="text-[12px] text-(--gray-500) mt-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  {path.career_goal}
                </p>
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
