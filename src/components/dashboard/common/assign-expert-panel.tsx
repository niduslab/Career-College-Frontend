"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, UserPlus, X, Users } from "lucide-react";
import type { Course } from "@/lib/course-api";
import {
  getExperts,
  assignCourseInstructor,
  removeCourseInstructor,
  type Expert,
} from "@/lib/partner-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

interface AssignExpertPanelProps {
  course: Course;
  onChanged: () => void;
}

export default function AssignExpertPanel({
  course,
  onChanged,
}: AssignExpertPanelProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getExperts()
      .then((res) => {
        if (active) setExperts(res.results);
      })
      .catch(() => {
        /* silently ignore — roster still shows current instructors */
      })
      .finally(() => {
        if (active) setLoadingExperts(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const rosterUserIds = new Set(course.instructors.map((i) => i.id));
  const availableExperts = experts.filter(
    (e) => e.affiliation_status === "active" && !rosterUserIds.has(e.user_id),
  );

  // Mirrors the backend's is_editable() gate on add_course_instructor():
  // the roster stays open while the course is draft or rejected.
  const locked = course.status !== "draft" && course.status !== "rejected";

  const handleAssign = async (expert: Expert) => {
    setAssigningId(expert.user_id);
    setPickerOpen(false);
    try {
      await assignCourseInstructor(course.id, expert.user_id);
      notify.success("Expert assigned to course.");
      onChanged();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to assign expert.",
      );
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemove = async (userId: number) => {
    setRemovingId(userId);
    try {
      await removeCourseInstructor(course.id, userId);
      notify.success("Expert removed from course.");
      onChanged();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to remove expert.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold text-(--text-title)">
          Instructor Roster
        </p>
        {!locked && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              disabled={loadingExperts}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              Assign Expert
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
            </button>
            {pickerOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 max-h-64 overflow-y-auto">
                {availableExperts.length === 0 ? (
                  <p className="px-4 py-3 text-[13px] text-(--gray-400)">
                    No available active experts. Onboard one from the
                    Instructors page first.
                  </p>
                ) : (
                  availableExperts.map((expert) => (
                    <button
                      key={expert.id}
                      type="button"
                      onClick={() => handleAssign(expert)}
                      disabled={assigningId === expert.user_id}
                      className="w-full text-left px-4 py-2 text-[13px] text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{expert.full_name}</span>
                      {assigningId === expert.user_id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {locked && (
        <p className="text-[12px] text-(--gray-400)">
          This course is no longer a draft — the roster is locked.
        </p>
      )}

      {course.instructors.length === 0 ? (
        <div className="py-6 text-center">
          <Users className="w-7 h-7 text-(--gray-300) mx-auto mb-2" />
          <p className="text-[13px] text-(--gray-500)">
            No experts assigned to this course yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-(--gray-100)">
          {course.instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-(--primary-50) flex items-center justify-center shrink-0 text-[12px] font-semibold text-(--primary-600)">
                  {instructor.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-(--text-title) truncate">
                    {instructor.full_name}
                  </p>
                  <p className="text-[12px] text-(--gray-500) truncate">
                    {instructor.email}
                  </p>
                </div>
              </div>
              {!locked && (
                <button
                  type="button"
                  onClick={() => handleRemove(instructor.id)}
                  disabled={removingId === instructor.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-(--gray-400) hover:text-red-500 cursor-pointer transition-colors disabled:opacity-60 shrink-0"
                  title="Remove from course"
                >
                  {removingId === instructor.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
