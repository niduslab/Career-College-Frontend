"use client";

import { X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCourseReviewDetail } from "@/hooks/use-admin-courses";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { mediaUrl } from "../../settings-shared/helpers";
import { RichHtml } from "../../settings-shared/ui";
import CurriculumPreview from "./curriculum-preview";
import type { AdminCourseDetail } from "@/lib/admin-courses-api";

interface CourseDetailModalProps {
  id: number;
  onClose: () => void;
}

const DELIVERY_MODE_LABEL: Record<AdminCourseDetail["delivery_mode"], string> = {
  self_paced: "Self-paced",
  scheduled: "Scheduled",
};

const STATUS_LABEL: Record<AdminCourseDetail["status"], string> = {
  draft: "Draft",
  institution_review: "Institution Review",
  under_review: "Under Review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
        {label}
      </p>
      <p className="text-[13px] text-(--text-title) mt-0.5">{value?.trim() || "—"}</p>
    </div>
  );
}

function RichTextField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-(--text-title) mb-1.5">{label}</p>
      <RichHtml html={value} />
    </div>
  );
}

function ownerLabel(course: AdminCourseDetail): string {
  if (course.partner_institution) return course.partner_institution.institution_name;
  return course.created_by?.full_name ?? "—";
}

export default function CourseDetailModal({ id, onClose }: CourseDetailModalProps) {
  useLockBodyScroll();
  const { data, isLoading, isError } = useCourseReviewDetail(id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100) sticky top-0 bg-white">
          <h3 className="text-[16px] font-semibold text-(--text-title)">Course Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-[13px] text-(--gray-400)">
            <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
            Loading course details…
          </div>
        ) : isError || !data ? (
          <div className="py-16 text-center text-[13px] text-red-500">
            Failed to load course details.
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-start gap-4">
              {mediaUrl(data.thumbnail) && (
                <div className="w-28 h-20 rounded-lg border border-(--gray-200) bg-(--gray-50) overflow-hidden shrink-0">
                  <Image
                    src={mediaUrl(data.thumbnail) as string}
                    alt={`${data.title} thumbnail`}
                    width={112}
                    height={80}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-(--text-title)">{data.title}</p>
                <p className="text-[12px] text-(--gray-500) mt-0.5">{ownerLabel(data)}</p>
                <span className="inline-block mt-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-(--gray-100) text-(--gray-600)">
                  {STATUS_LABEL[data.status]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoField label="Category" value={data.category?.name} />
              <InfoField label="Delivery Mode" value={DELIVERY_MODE_LABEL[data.delivery_mode]} />
              <InfoField label="Language" value={data.language} />
              <InfoField label="Level" value={data.level} />
              <InfoField label="Price" value={data.price} />
              <InfoField
                label="Duration"
                value={data.duration_minutes ? `${data.duration_minutes} min` : null}
              />
              <InfoField label="Submitted" value={data.created_at?.slice(0, 10)} />
            </div>

            <RichTextField label="Description" value={data.description} />
            <RichTextField label="Learning Objectives" value={data.learning_objectives} />
            <RichTextField label="Prerequisites" value={data.prerequisites} />
            <RichTextField label="Audiences" value={data.audiences} />

            {data.delivery_mode === "scheduled" && data.course_outline && (
              <div>
                <p className="text-[13px] font-semibold text-(--text-title) mb-1.5">
                  Course Outline
                </p>
                <p className="text-[13px] text-(--gray-600) whitespace-pre-wrap">
                  {data.course_outline}
                </p>
              </div>
            )}

            <div>
              <p className="text-[13px] font-semibold text-(--text-title) mb-1.5">
                Curriculum Snapshot
              </p>
              <div className="grid grid-cols-2 gap-4">
                <InfoField
                  label="Total Sections"
                  value={String(data.outline_stats.total_sections)}
                />
                <InfoField
                  label="Sections With Content"
                  value={String(data.outline_stats.sections_with_content)}
                />
              </div>
              {data.outline_stats.empty_section_titles.length > 0 && (
                <p className="text-[12px] text-amber-600 mt-2">
                  Empty sections: {data.outline_stats.empty_section_titles.join(", ")}
                </p>
              )}
            </div>

            <div>
              <p className="text-[13px] font-semibold text-(--text-title) mb-2">
                Curriculum
              </p>
              <div className="border border-(--gray-200) rounded-lg px-3">
                <CurriculumPreview courseId={data.id} />
              </div>
            </div>

            {data.schedules.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-(--text-title) mb-2">
                  Cohort Schedules
                </p>
                <div className="space-y-2">
                  {data.schedules.map((s) => (
                    <div
                      key={s.id}
                      className="border border-(--gray-200) rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3"
                    >
                      <InfoField label="Cohort" value={s.cohort_label} />
                      <InfoField label="Status" value={s.status} />
                      <InfoField label="Start" value={s.start_date} />
                      <InfoField
                        label="Seats"
                        value={s.max_seats !== null ? String(s.max_seats) : "Unlimited"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.rejection_reason && (
              <RichTextField label="Last Rejection Reason" value={data.rejection_reason} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
