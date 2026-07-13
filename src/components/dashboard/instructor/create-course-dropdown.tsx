"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, BookOpen, CalendarClock } from "lucide-react";

const OPTIONS = [
  {
    deliveryMode: "self_paced" as const,
    label: "Self-Paced Course",
    sub: "Evergreen — students learn anytime, at their own pace.",
    icon: BookOpen,
  },
  {
    deliveryMode: "scheduled" as const,
    label: "Scheduled Course (Cohort)",
    sub: "Runs on a fixed start/end date with an enrollment window.",
    icon: CalendarClock,
  },
];

export default function CreateCourseDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (deliveryMode: "self_paced" | "scheduled") => {
    setOpen(false);
    router.push(
      `/dashboard/instructor/course-builder?deliveryMode=${deliveryMode}`,
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-12 flex items-center gap-2 bg-(--primary-700) hover:bg-(--primary-600) text-white text-[14px] lg:text-[16px] font-semibold px-4 py-2.5 rounded-md transition-colors whitespace-nowrap cursor-pointer"
      >
        <Plus size={16} color="white" />
        Create New Course
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-(--gray-200) rounded-xl shadow-lg z-50 py-2">
          {OPTIONS.map(({ deliveryMode, label, sub, icon: Icon }) => (
            <button
              key={deliveryMode}
              onClick={() => handleSelect(deliveryMode)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              <Icon className="w-5 h-5 text-(--primary-600) shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold text-(--text-title)">
                  {label}
                </p>
                <p className="text-[12px] text-(--gray-500) mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
