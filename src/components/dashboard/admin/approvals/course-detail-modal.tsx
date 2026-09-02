"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  X,
  Loader2,
  AlertTriangle,
  ImageOff,
  Building2,
  User,
  Tag,
  Layers,
  CalendarClock,
  FileText,
} from "lucide-react";
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

const STATUS_TONE: Record<AdminCourseDetail["status"], string> = {
  draft: "bg-(--gray-100) text-(--gray-600)",
  institution_review: "bg-blue-50 text-blue-600",
  under_review: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  archived: "bg-(--gray-100) text-(--gray-500)",
};

const TABS = ["Overview", "Content", "Curriculum", "Schedules"] as const;
type Tab = (typeof TABS)[number];

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
        {label}
      </p>
      <p className="text-[13px] text-(--text-title) mt-0.5 font-medium">
        {value?.trim() || "—"}
      </p>
    </div>
  );
}

function ownerLabel(course: AdminCourseDetail): string {
  if (course.partner_institution) return course.partner_institution.institution_name;
  return course.created_by?.full_name ?? "—";
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function InfoCard({
  icon: Icon,
  title,
  children,
  innerRef,
}: {
  icon: typeof Layers;
  title: string;
  children: React.ReactNode;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={innerRef}
      className="rounded-2xl border border-(--gray-200) bg-white p-4 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[6px_4px_6px_6px] flex items-center justify-center shrink-0 bg-(--primary-50) text-(--primary-600)">
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-[13px] font-semibold text-(--text-title)">{title}</p>
      </div>
      <div className="border border-dashed border-gray-200" />
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function ContentCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Layers;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-(--gray-200) bg-white p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[6px_4px_6px_6px] flex items-center justify-center shrink-0 bg-(--primary-50) text-(--primary-600)">
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-[13px] font-semibold text-(--text-title)">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function CourseDetailModal({ id, onClose }: CourseDetailModalProps) {
  useLockBodyScroll();
  const { data, isLoading, isError } = useCourseReviewDetail(id);
  const [tab, setTab] = useState<Tab>("Overview");
  const [thumbFailed, setThumbFailed] = useState(false);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const hasSchedules = (data?.schedules.length ?? 0) > 0;
  const visibleTabs = TABS.filter((t) => t !== "Schedules" || hasSchedules);

  useEffect(() => {
    if (tab !== "Overview") return;
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 16, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          delay: i * 0.06,
          ease: "back.out(1.4)",
        },
      );
    });
  }, [tab, data]);

  const thumb = mediaUrl(data?.thumbnail ?? null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100) shrink-0">
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
          <>
            <div className="px-6 pt-5 pb-4 border-b border-(--gray-200) bg-(--gray-50) shrink-0">
              <div className="flex items-start gap-4">
                {thumb && !thumbFailed ? (
                  <div className="w-24 h-24 rounded-xl ring-1 ring-(--gray-200) bg-white overflow-hidden shrink-0">
                    <Image
                      src={thumb}
                      alt={`${data.title} thumbnail`}
                      width={96}
                      height={96}
                      unoptimized
                      onError={() => setThumbFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl ring-1 ring-(--gray-200) bg-(--gray-100) flex items-center justify-center shrink-0 text-(--gray-400)">
                    <ImageOff className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold text-(--text-title) leading-snug line-clamp-2">
                    {data.title}
                  </p>
                  <p className="flex items-center gap-1.5 text-[12px] text-(--gray-500) mt-1">
                    {data.partner_institution ? (
                      <Building2 className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                    {ownerLabel(data)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_TONE[data.status]}`}
                    >
                      {STATUS_LABEL[data.status]}
                    </span>
                    {data.category && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-(--gray-100) text-(--gray-600)">
                        <Tag className="w-3 h-3" />
                        {data.category.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-(--gray-100) text-(--gray-600)">
                      BDT {data.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 inline-flex p-1 rounded-full bg-white border border-(--gray-200)">
                {visibleTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                      tab === t
                        ? "bg-(--primary-600) text-white shadow-sm"
                        : "text-(--gray-500) hover:bg-(--gray-100)"
                    }`}
                  >
                    {t}
                    {t === "Curriculum" && data.outline_stats.empty_section_titles.length > 0 && (
                      <AlertTriangle
                        className={`inline-block w-3 h-3 ml-1 -mt-0.5 ${
                          tab === t ? "text-amber-200" : "text-amber-500"
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-5 overflow-y-auto flex-1">
              {tab === "Overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                      icon={Layers}
                      title="Course Details"
                      innerRef={(el) => {
                        cardsRef.current[0] = el;
                      }}
                    >
                      <InfoField label="Category" value={data.category?.name} />
                      <InfoField
                        label="Delivery Mode"
                        value={DELIVERY_MODE_LABEL[data.delivery_mode]}
                      />
                      <InfoField label="Language" value={data.language} />
                      <InfoField label="Level" value={data.level} />
                    </InfoCard>

                    <InfoCard
                      icon={CalendarClock}
                      title="Pricing & Timeline"
                      innerRef={(el) => {
                        cardsRef.current[1] = el;
                      }}
                    >
                      <InfoField label="Price" value={data.price} />
                      <InfoField
                        label="Duration"
                        value={data.duration_minutes ? `${data.duration_minutes} min` : null}
                      />
                      <InfoField label="Submitted" value={data.created_at?.slice(0, 10)} />
                    </InfoCard>
                  </div>

                  {data.rejection_reason && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-red-700 mb-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Last Rejection Reason
                      </p>
                      <RichHtml html={data.rejection_reason} />
                    </div>
                  )}
                </div>
              )}

              {tab === "Content" && (
                <div className="space-y-4">
                  <ContentCard icon={FileText} title="Description">
                    <RichHtml html={data.description} />
                  </ContentCard>
                  <ContentCard icon={Layers} title="Learning Objectives">
                    <RichHtml html={data.learning_objectives} />
                  </ContentCard>
                  <ContentCard icon={Tag} title="Prerequisites">
                    <RichHtml html={data.prerequisites} />
                  </ContentCard>
                  <ContentCard icon={User} title="Audiences">
                    <RichHtml html={data.audiences} />
                  </ContentCard>

                  {data.delivery_mode === "scheduled" && data.course_outline && (
                    <ContentCard icon={CalendarClock} title="Course Outline">
                      <p className="text-[13px] text-(--gray-600) whitespace-pre-wrap">
                        {data.course_outline}
                      </p>
                    </ContentCard>
                  )}
                </div>
              )}

              {tab === "Curriculum" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 rounded-lg border border-(--gray-200) p-3">
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
                    <p className="text-[12px] text-amber-600 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      Empty sections: {data.outline_stats.empty_section_titles.join(", ")}
                    </p>
                  )}
                  <div className="border border-(--gray-200) rounded-lg px-3">
                    <CurriculumPreview courseId={data.id} />
                  </div>
                </div>
              )}

              {tab === "Schedules" && hasSchedules && (
                <div className="space-y-2">
                  {data.schedules.map((s) => (
                    <div
                      key={s.id}
                      className="border border-(--gray-200) rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3"
                    >
                      <InfoField label="Cohort" value={s.cohort_label} />
                      <InfoField label="Status" value={s.status} />
                      <InfoField label="Start" value={`${formatDateTime(s.start_date)} (${s.timezone})`} />
                      <InfoField
                        label="Seats"
                        value={s.max_seats !== null ? String(s.max_seats) : "Unlimited"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
