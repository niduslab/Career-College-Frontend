"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Eye, Loader2 } from "lucide-react";
import type { Step } from "@/components/dashboard/instructor/course-builder/types";
import {
  SELF_PACED_STEPS,
  SCHEDULED_STEPS,
} from "@/components/dashboard/instructor/course-builder/constants";
import SetupTab, {
  type SetupForm,
} from "@/components/dashboard/instructor/course-builder/setup-tab";
import ScheduleTab from "@/components/dashboard/instructor/course-builder/schedule-tab";
import TeamTab from "@/components/dashboard/instructor/course-builder/team-tab";
import CurriculumTab from "@/components/dashboard/instructor/course-builder/curriculum-tab";
import ReviewTab from "@/components/dashboard/instructor/course-builder/review-tab";
import {
  createCourse,
  updateCourse,
  getCourse,
  type CourseLevel,
} from "@/lib/course-api";
import { fetchMe } from "@/lib/auth-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const INITIAL_FORM: SetupForm = {
  title: "",
  categoryId: null,
  category: "",
  level: "Beginner",
  language: "English",
  description: "",
  price: "",
  durationMinutes: "",
  learningObjectives: "",
  prerequisites: "",
  audiences: "",
  thumbnailFile: null,
  thumbnailUrl: null,
  deliveryMode: "self_paced",
  courseOutline: "",
};

const STEP_TO_PARAM: Record<Step, string> = {
  Setup: "setup",
  Team: "team",
  Schedule: "schedule",
  Curriculum: "curriculum",
  Review: "review",
};
const PARAM_TO_STEP: Record<string, Step> = {
  setup: "Setup",
  team: "Team",
  schedule: "Schedule",
  curriculum: "Curriculum",
  review: "Review",
};

export default function CourseBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCourseId = searchParams.get("courseId");
  const urlStep = searchParams.get("step");
  const urlDeliveryMode = searchParams.get("deliveryMode");

  const [activeStep, setActiveStepState] = useState<Step>(
    (urlStep && PARAM_TO_STEP[urlStep]) || "Setup",
  );
  const [form, setForm] = useState<SetupForm>(() =>
    !urlCourseId && urlDeliveryMode === "scheduled"
      ? { ...INITIAL_FORM, deliveryMode: "scheduled" }
      : INITIAL_FORM,
  );
  const [courseId, setCourseIdState] = useState<number | null>(
    urlCourseId ? Number(urlCourseId) : null,
  );
  const [courseSlug, setCourseSlug] = useState<string | null>(null);
  const [savingCourse, setSavingCourse] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(!!urlCourseId);
  const [isInstitution, setIsInstitution] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [courseOwnerId, setCourseOwnerId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchMe().then((user) => {
      if (active && user) {
        setIsInstitution(user.user_type === "partner_institution");
        setMyUserId(user.user_id);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Partner institutions own the course and assign an expert to build it —
  // they never author curriculum content themselves, so Setup is their only step.
  // Individual instructors get a "Team" step to invite co-instructors.
  const activeSteps = isInstitution
    ? SELF_PACED_STEPS.filter((s) => s.key === "Setup")
    : (form.deliveryMode === "scheduled" ? SCHEDULED_STEPS : SELF_PACED_STEPS);

  const isOwner = myUserId !== null && myUserId === courseOwnerId;

  const updateUrl = (nextCourseId: number | null, nextStep: Step) => {
    const params = new URLSearchParams();
    if (nextCourseId !== null) params.set("courseId", String(nextCourseId));
    params.set("step", STEP_TO_PARAM[nextStep]);
    router.replace(`?${params.toString()}`);
  };

  const setActiveStep = (step: Step) => {
    setActiveStepState(step);
    updateUrl(courseId, step);
  };

  const nextStepAfterSetup: Step = "Team";
  const nextStepAfterTeam: Step =
    form.deliveryMode === "scheduled" ? "Schedule" : "Curriculum";

  const goToNextStepFor = (id: number, ownerId: number | null) => {
    setCourseIdState(id);
    setCourseOwnerId(ownerId);
    // (Assign Expert) section can render now that the course exists.
    const nextStep = isInstitution ? "Setup" : nextStepAfterSetup;
    setActiveStepState(nextStep);
    updateUrl(id, nextStep);
  };

  // Resume an existing course (e.g. after a reload, or arriving from "Edit" in My Courses).
  useEffect(() => {
    if (!urlCourseId) return;
    let active = true;
    getCourse(Number(urlCourseId))
      .then((course) => {
        if (!active) return;
        setCourseSlug(course.slug);
        setCourseOwnerId(course.created_by?.id ?? null);
        setForm({
          title: course.title,
          categoryId: course.category?.id ?? null,
          category: course.category?.name ?? "",
          level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
          language: course.language,
          description: course.description,
          price: course.price,
          durationMinutes:
            course.duration_minutes != null
              ? String(course.duration_minutes)
              : "",
          learningObjectives: course.learning_objectives,
          prerequisites: course.prerequisites,
          audiences: course.audiences,
          thumbnailFile: null,
          thumbnailUrl: course.thumbnail,
          deliveryMode: course.delivery_mode,
          courseOutline: course.course_outline,
        });
      })
      .catch((err) => {
        if (!active) return;
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load course.",
        );
      })
      .finally(() => {
        if (active) setLoadingCourse(false);
      });
    return () => {
      active = false;
    };
  }, [urlCourseId]);

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center py-20 text-(--gray-500)">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading course…
      </div>
    );
  }

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
        level: form.level.toLowerCase() as
          | "beginner"
          | "intermediate"
          | "advanced",

        price: form.price,
        duration_minutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : undefined,

        learning_objectives: form.learningObjectives,
        prerequisites: form.prerequisites,
        audiences: form.audiences,
        thumbnail: form.thumbnailFile,
        course_outline: form.courseOutline,
      };
      if (courseId === null) {
        const { data: course, message } = await createCourse({
          ...payload,
          delivery_mode: form.deliveryMode,
        });
        notify.success(message ?? "Course created.");
        setCourseSlug(course.slug);
        goToNextStepFor(course.id, course.created_by?.id ?? null);
      } else {
        const { data: course, message } = await updateCourse(
          courseId,
          payload,
        );
        notify.success(message ?? "Course updated.");
        setCourseOwnerId(course.created_by?.id ?? null);
        setActiveStep(isInstitution ? "Setup" : nextStepAfterSetup);
      }
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
          onClick={() => {
            if (!courseSlug) {
              notify.info("Save the course in Setup before previewing it.");
              return;
            }
            window.open(`/course-player/${courseSlug}`, "_blank");
          }}
          disabled={!courseSlug}
          className="flex items-center cursor-pointer gap-2 bg-(--primary-700) hover:bg-(--primary-900) text-white text-[13px] font-semibold px-4 h-12 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Step Tabs */}
      <div className="bg-white border border-(--gray-200) rounded-xl px-5 py-3 flex items-center gap-2 flex-wrap">
        {activeSteps.map(({ key, icon: Icon }, i) => {
          const isActive = activeStep === key;
          const isPast = activeSteps.findIndex((s) => s.key === activeStep) > i;
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
              {i < activeSteps.length - 1 && (
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
          courseId={courseId}
          isInstitution={isInstitution}
        />
      )}

      {activeStep === "Team" &&
        (courseId !== null ? (
          <TeamTab
            courseId={courseId}
            isOwner={isOwner}
            onContinue={() => setActiveStep(nextStepAfterTeam)}
          />
        ) : (
          <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
            Please complete Course Setup first to unlock team management.
          </div>
        ))}

      {activeStep === "Schedule" &&
        (courseId !== null ? (
          <ScheduleTab
            courseId={courseId}
            onContinue={() => setActiveStep("Curriculum")}
          />
        ) : (
          <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
            Please complete Course Setup first to unlock scheduling.
          </div>
        ))}

      {activeStep === "Curriculum" &&
        (courseId !== null ? (
          <CurriculumTab
            courseId={courseId}
            meta={{
              title: form.title,
              description: form.description,
              audience: form.audiences,
              prerequisites: form.prerequisites,
              level: form.level.toLowerCase() as CourseLevel,
              language: form.language,
              duration_minutes: form.durationMinutes
                ? Number(form.durationMinutes)
                : null,
              category: form.category,
            }}
            onContinue={() => setActiveStep("Review")}
          />
        ) : (
          <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
            Please complete Course Setup first to unlock the curriculum builder.
          </div>
        ))}

      {activeStep === "Review" &&
        (courseId !== null ? (
          <ReviewTab
            courseId={courseId}
            data={{
              category: form.category,
              level: form.level,
              language: form.language,
              title: form.title,
              description: form.description,
              price: form.price,
            }}
            onBack={() => setActiveStep("Curriculum")}
          />
        ) : (
          <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
            Please complete Course Setup first to unlock the review step.
          </div>
        ))}
    </div>
  );
}
