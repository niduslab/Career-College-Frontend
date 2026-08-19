"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  Plus,
  Trash2,
  GripVertical,
  X,
} from "lucide-react";
import PageHeader from "@/components/dashboard/common/page-header";
import ConfirmModal from "@/components/common/confirm-modal";
import {
  getLearningPathManageDetail,
  updateLearningPath,
  deleteLearningPath,
  addLearningPathMilestone,
  removeLearningPathMilestone,
  reorderLearningPathMilestones,
  listCourses,
  type LearningPathManage,
  type LearningPathAuthoringStatus,
  type Course,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const STATUS_OPTIONS: { value: LearningPathAuthoringStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function CoursePickerModal({
  excludeCourseIds,
  onPick,
  onClose,
}: {
  excludeCourseIds: number[];
  onPick: (course: Course) => void;
  onClose: () => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listCourses(1, 100)
      .then((res) => setCourses(res.results))
      .catch(() => notify.error("Failed to load your courses."))
      .finally(() => setLoading(false));
  }, []);

  const available = courses.filter(
    (c) =>
      c.status === "published" &&
      !excludeCourseIds.includes(c.id) &&
      c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-(--gray-200)">
          <h3 className="text-[16px] font-semibold text-(--text-title)">
            Add a milestone
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) cursor-pointer"
          >
            <X className="w-4 h-4 text-(--gray-500)" />
          </button>
        </div>
        <div className="p-4 border-b border-(--gray-100)">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your published courses..."
            className="w-full h-10 px-3 rounded-md border border-(--gray-200) text-[14px] outline-none focus:border-(--primary-600)"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center gap-2 text-(--gray-400) text-[13px] p-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : available.length === 0 ? (
            <p className="text-[13px] text-(--gray-400) p-4 text-center">
              No available published courses to add.
            </p>
          ) : (
            available.map((c) => (
              <button
                key={c.id}
                onClick={() => onPick(c)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-(--gray-50) transition-colors cursor-pointer text-[14px] text-(--text-title)"
              >
                {c.title}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditLearningPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const pathId = Number(id);
  const router = useRouter();

  const [path, setPath] = useState<LearningPathManage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<LearningPathAuthoringStatus>("draft");

  const load = () => {
    setLoading(true);
    getLearningPathManageDetail(pathId)
      .then((data) => {
        setPath(data);
        setTitle(data.title);
        setCareerGoal(data.career_goal);
        setDescription(data.description);
        setStatus(data.status);
      })
      .catch((err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load learning path.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathId]);

  const handleSave = () => {
    setSaving(true);
    updateLearningPath(pathId, {
      title,
      career_goal: careerGoal,
      description,
      status,
    })
      .then((res) => {
        notify.success(res.message || "Learning path saved.");
        setPath(res.data);
      })
      .catch((err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to save learning path.",
        ),
      )
      .finally(() => setSaving(false));
  };

  const handleDelete = () => {
    setDeleting(true);
    deleteLearningPath(pathId)
      .then(() => {
        notify.success("Learning path deleted.");
        router.push("/dashboard/instructor/learning-paths");
      })
      .catch((err) => {
        notify.error(
          err instanceof ApiError ? err.message : "Failed to delete learning path.",
        );
        setDeleting(false);
      });
  };

  const handleAddMilestone = (course: Course) => {
    setPickerOpen(false);
    addLearningPathMilestone(pathId, { course_id: course.id })
      .then((res) => {
        notify.success(res.message || "Milestone added.");
        setPath(res.data);
      })
      .catch((err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to add milestone.",
        ),
      );
  };

  const handleRemoveMilestone = (milestoneId: number) => {
    removeLearningPathMilestone(pathId, milestoneId)
      .then(() => {
        notify.success("Milestone removed.");
        load();
      })
      .catch((err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to remove milestone.",
        ),
      );
  };

  const moveMilestone = (index: number, direction: -1 | 1) => {
    if (!path) return;
    const ordered = [...path.milestones];
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];

    reorderLearningPathMilestones(
      pathId,
      ordered.map((m) => m.id),
    )
      .then((res) => setPath(res.data))
      .catch((err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to reorder milestones.",
        ),
      );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading learning path…
      </div>
    );
  }

  if (!path) {
    return (
      <p className="text-[14px] text-rose-500 py-12 text-center">
        Learning path not found.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => router.push("/dashboard/instructor/learning-paths")}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-(--gray-500) hover:text-(--text-title) cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Learning Paths
      </button>

      <PageHeader title="Edit Learning Path" subtitle={`/learning-paths/${path.slug}`} />

      <div className="bg-white border border-(--gray-200) rounded-2xl p-5 lg:p-6 space-y-4">
        <div>
          <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AI/ML Engineer Path"
            className="w-full h-10 px-3 rounded-md border border-(--gray-200) text-[14px] outline-none focus:border-(--primary-600)"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">
            Career Goal
          </label>
          <input
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. AI/ML Engineer"
            className="w-full h-10 px-3 rounded-md border border-(--gray-200) text-[14px] outline-none focus:border-(--primary-600)"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short overview of what this path covers and who it's for..."
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-(--gray-200) text-[14px] outline-none focus:border-(--primary-600) resize-none"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">
            Status
          </label>
          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer border ${
                  status === opt.value
                    ? "bg-(--primary-600) text-white border-(--primary-600)"
                    : "bg-white text-(--gray-500) border-(--gray-200) hover:border-(--primary-300)"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="px-4 py-2 rounded-md text-rose-600 hover:bg-rose-50 text-[14px] font-medium transition-colors cursor-pointer"
          >
            Delete path
          </button>
        </div>
      </div>

      <div className="bg-white border border-(--gray-200) rounded-2xl p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold text-(--text-title)">
            Milestones
          </h3>
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-(--primary-600) hover:underline cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add milestone
          </button>
        </div>

        {path.milestones.length === 0 ? (
          <p className="text-[13px] text-(--gray-400) py-6 text-center">
            No milestones yet. Add a published course to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {path.milestones.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-(--gray-200)"
              >
                <GripVertical className="w-4 h-4 text-(--gray-300) shrink-0" />
                <span className="w-6 h-6 shrink-0 rounded-full bg-(--primary-50) text-(--primary-600) text-[12px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-(--text-title) truncate">
                    {m.title || m.course.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveMilestone(i, -1)}
                    disabled={i === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-(--gray-100) cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-(--gray-500)"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveMilestone(i, 1)}
                    disabled={i === path.milestones.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-(--gray-100) cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-(--gray-500)"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-(--gray-100) cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pickerOpen && (
        <CoursePickerModal
          excludeCourseIds={path.milestones.map((m) => m.course.id)}
          onPick={handleAddMilestone}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {deleteOpen && (
        <ConfirmModal
          title="Delete Learning Path"
          message={
            <>
              Delete <span className="font-semibold text-(--text-title)">&quot;{path.title}&quot;</span>?
              This cannot be undone.
            </>
          }
          confirmLabel="Delete path"
          confirmingLabel="Deleting…"
          submitting={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </div>
  );
}
