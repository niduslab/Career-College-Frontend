"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown, MonitorPlay, Lock } from "lucide-react";

interface Lesson {
  title: string;
  duration: string;
  preview?: boolean;
}

interface Section {
  title: string;
  lessons: Lesson[];
}

const SECTIONS: Section[] = [
  {
    title: "Introduction to Cybersecurity Careers",
    lessons: [
      {
        title:
          "Compare the roles and responsibilities of various careers within the cybersecurity field",
        duration: "2.34 min",
        preview: true,
      },
      {
        title:
          "Map IT fundamental skills, technical skills, and soft skills to the different job roles at various levels in cybersecurity.",
        duration: "2.39 min",
        preview: true,
      },
      {
        title:
          "Identify the required certifications, such as Security+, A+, CISSP, and CEH, for different job roles and the contents of each certification.",
        duration: "5.39 min",
      },
      {
        title:
          "Discover the right role for you in cybersecurity and learn how to prepare for your chosen career path.",
        duration: "2.33 min",
      },
    ],
  },
  {
    title: "Introduction to Hardware and Operating Systems",
    lessons: [
      {
        title: "Introduction to Figma Essentials training course",
        duration: "2.34 min",
        preview: true,
      },
    ],
  },
  { title: "ntroduction to Software, Programming, and Databases", lessons: [] },
  { title: "Introduction to Networking and Storage", lessons: [] },
  { title: "Introduction to Cloud Computing", lessons: [] },
  { title: "Introduction to Cybersecurity Essentials", lessons: [] },
];

const INITIAL_SHOW = 5;

export default function PartnerCourseDetailsContent() {
  // first section open by default
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [showAll, setShowAll] = useState(false);

  const visibleSections = showAll ? SECTIONS : SECTIONS.slice(0, INITIAL_SHOW);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? -1 : i);

  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="sg-h5 font-semibold --title-text mb-4">Course Content</h2>

      <div className="space-y-4 mt-4 border rounded-2xl border-gray-200 bg-white shadow-sm p-6">
        {visibleSections.map((section, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={section.title}
              className="rounded-lg border-[0.5px] border-gray-200 bg-gray-50 overflow-hidden"
            >
              {/* Section header */}
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center cursor-pointer justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium sg-p-default --text-title">
                  {section.title}
                </span>
                {isOpen ? (
                  <ChevronUp size={20} className="--text-title shrink-0" />
                ) : (
                  <ChevronDown size={20} className="--text-title shrink-0" />
                )}
              </button>

              {/* Lessons list */}
              {isOpen && section.lessons.length > 0 && (
                <ul className="border-t border-gray-200">
                  {section.lessons.map((lesson, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-3 px-5 py-3 sg-p-small font-normal --text-paragraph last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <MonitorPlay
                        size={16}
                        className="text-gray-500 shrink-0"
                      />
                      <span className="flex-1   leading-snug">
                        {lesson.title}
                      </span>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {lesson.preview && (
                          <span className="sg-p-small font-medium text-(--primary-700) cursor-pointer hover:underline">
                            Preview
                          </span>
                        )}
                        {!lesson.preview && (
                          <Lock size={16} className="text-gray-500" />
                        )}
                        <span className="sg-p-small --text-paragraph min-w-11.5 text-right">
                          {lesson.duration}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {/* Show more / less */}
        <div className="px-5 py-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm cursor-pointer  underline font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            {showAll ? "Show less" : "Show more"}
          </button>
        </div>
      </div>
    </div>
  );
}
