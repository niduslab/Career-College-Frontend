"use client";

import { useState } from "react";
import { ChevronRight, Eye } from "lucide-react";
import type { Step } from "@/components/dashboard/instructor/course-builder/types";
import { steps } from "@/components/dashboard/instructor/course-builder/constants";
import SetupTab from "@/components/dashboard/instructor/course-builder/setup-tab";
import CurriculumTab from "@/components/dashboard/instructor/course-builder/curriculum-tab";

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
        <button className="flex items-center gap-2 bg-(--primary-700) hover:bg-(--primary-900) text-white text-[13px] font-semibold px-4 h-12 rounded-md transition-colors">
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

      {activeStep === "Curriculum" && <CurriculumTab />}

      {activeStep !== "Setup" && activeStep !== "Curriculum" && (
        <div className="bg-white border border-(--gray-200) rounded-xl p-10 flex items-center justify-center">
          <p className="text-[14px] text-(--gray-400)">
            {activeStep} section — coming soon
          </p>
        </div>
      )}
    </div>
  );
}
