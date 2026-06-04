"use client";

import { useState } from "react";
import { ChevronRight, Eye } from "lucide-react";
import type { Step } from "@/components/dashboard/instructor/course-builder/types";
import { steps } from "@/components/dashboard/instructor/course-builder/constants";
import SetupTab from "@/components/dashboard/instructor/course-builder/setup-tab";
import CurriculumTab from "@/components/dashboard/instructor/course-builder/curriculum-tab";
import PricingTab from "@/components/dashboard/instructor/course-builder/pricing-tab";
import ReviewTab from "@/components/dashboard/instructor/course-builder/review-tab";
import PreviewDrawer from "@/components/dashboard/instructor/course-builder/preview-drawer";
import { SEED_MODULES } from "@/components/dashboard/instructor/course-builder/constants";

const INITIAL_FORM = {
  title: "Advanced UI/UX Course",
  category: "Design",
  level: "Intermediate",
  language: "English",
  tagline: "Working Draft",
  description:
    "A studio course on shaping narrative through architectural form, light, and material.",
};

export default function CourseBuilderPage() {
  const [activeStep, setActiveStep] = useState<Step>("Setup");
  const [form, setForm] = useState(INITIAL_FORM);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            Course Builder
          </h1>
          <p className="text-[14px] font-normal text-[#4a5565] mt-1">
            Advanced — Working Draft
          </p>
        </div>
        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center cursor-pointer gap-2 bg-(--primary-700) hover:bg-(--primary-900) text-white text-[13px] font-semibold px-4 h-12 rounded-md transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Step Tabs */}
      <div className="bg-white border border-(--gray-200) rounded-xl px-5 py-3 flex items-center gap-2 flex-wrap">
        {steps.map(({ key, icon: Icon }, i) => {
          const isActive = activeStep === key;
          const isPast = steps.findIndex((s) => s.key === activeStep) > i;
          return (
            <div key={key} className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(key)}
                className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-(--primary-600) text-white"
                    : isPast
                      ? "text-(--primary-600) hover:bg-(--primary-50)"
                      : "text-(--gray-400) hover:bg-(--gray-50)"
                }`}
              >
                <Icon className="w-4 h-4" />
                {key}
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-(--gray-300)" />
              )}
            </div>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeStep === "Setup" && (
        <SetupTab
          form={form}
          setForm={setForm}
          onContinue={() => setActiveStep("Curriculum")}
        />
      )}

      {activeStep === "Curriculum" && (
        <CurriculumTab onContinue={() => setActiveStep("Pricing")} />
      )}

      {activeStep === "Pricing" && (
        <PricingTab
          onBack={() => setActiveStep("Curriculum")}
          onContinue={() => setActiveStep("Review")}
        />
      )}

      <PreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        form={form}
        modules={SEED_MODULES}
      />

      {activeStep === "Review" && (
        <ReviewTab
          data={{
            category: form.category,
            level: form.level,
            language: form.language,
            title: form.title,
            tagline: form.tagline,
            description: form.description,
            modules: SEED_MODULES.map((m) => ({
              title: m.title,
              lessons: m.lessons.length,
              videos: m.lessons.filter((l) => l.type === "Video").length,
            })),
            totalLessons: SEED_MODULES.reduce(
              (s, m) => s + m.lessons.length,
              0,
            ),
            totalVideos: SEED_MODULES.reduce(
              (s, m) => s + m.lessons.filter((l) => l.type === "Video").length,
              0,
            ),
            price: "149",
          }}
          onBack={() => setActiveStep("Pricing")}
        />
      )}
    </div>
  );
}
