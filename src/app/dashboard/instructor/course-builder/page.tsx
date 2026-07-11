"use client";

import { useState } from "react";
import { ChevronRight, Eye } from "lucide-react";
import type { Step } from "@/components/dashboard/instructor/course-builder/types";
import { steps } from "@/components/dashboard/instructor/course-builder/constants";
import SetupTab, {
  type SetupForm,
} from "@/components/dashboard/instructor/course-builder/setup-tab";
import CurriculumTab from "@/components/dashboard/instructor/course-builder/curriculum-tab";
import ReviewTab from "@/components/dashboard/instructor/course-builder/review-tab";
import PreviewDrawer from "@/components/dashboard/instructor/course-builder/preview-drawer";
import { SEED_MODULES } from "@/components/dashboard/instructor/course-builder/constants";
import { createCourse, updateCourse } from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const INITIAL_FORM: SetupForm = {
  title: "",
  categoryId: null,
  category: "",
  level: "Intermediate",
  language: "English",
  description: "",
  price: "",
  learningObjectives: "",
  prerequisites: "",
  audiences: "",
  thumbnailFile: null,
  thumbnailUrl: null,
};

export default function CourseBuilderPage() {
  const [activeStep, setActiveStep] = useState<Step>("Setup");
  const [form, setForm] = useState<SetupForm>(INITIAL_FORM);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [savingCourse, setSavingCourse] = useState(false);

  const handleSetupContinue = async () => {
    if (!form.categoryId) {
      notify.error("Please select a category.");
      return;
    }
    setSavingCourse(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.categoryId,
        language: form.language,
        level: form.level.toLowerCase() as "beginner" | "intermediate" | "advanced",
        price: form.price || "0",
        learning_objectives: form.learningObjectives,
        prerequisites: form.prerequisites,
        audiences: form.audiences,
        thumbnail: form.thumbnailFile,
      };
      if (courseId === null) {
        const { data: course, message } = await createCourse(payload);
        setCourseId(course.id);
        notify.success(message ?? "Course created.");
      } else {
        const { message } = await updateCourse(courseId, payload);
        notify.success(message ?? "Course updated.");
      }
      setActiveStep("Curriculum");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save course.",
      );
    } finally {
      setSavingCourse(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
            Course Builder
          </h1>
          <p className="text-[14px] font-normal text-[#4a5565] mt-1">
            Advanced - Working Draft
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
          onContinue={handleSetupContinue}
          saving={savingCourse}
        />
      )}

      {activeStep === "Curriculum" &&
        (courseId !== null ? (
          <CurriculumTab
            courseId={courseId}
            onContinue={() => setActiveStep("Review")}
          />
        ) : (
          <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
            Please complete Course Setup first to unlock the curriculum builder.
          </div>
        ))}

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
            description: form.description,
            modules: SEED_MODULES.map((m) => ({
              title: m.title,
              lessons: m.lessons.length,
              videos: m.lessons.filter((l) => l.type === "Lecture").length,
            })),
            totalLessons: SEED_MODULES.reduce(
              (s, m) => s + m.lessons.length,
              0,
            ),
            totalVideos: SEED_MODULES.reduce(
              (s, m) => s + m.lessons.filter((l) => l.type === "Lecture").length,
              0,
            ),
            price: form.price,
          }}
          onBack={() => setActiveStep("Curriculum")}
        />
      )}
    </div>
  );
}
