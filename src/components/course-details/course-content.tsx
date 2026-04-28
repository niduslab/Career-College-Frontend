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
    title: "Getting Started",
    lessons: [
      {
        title: "Introduction to Figma Essentials training course",
        duration: "2.34 min",
        preview: true,
      },
      {
        title: "Getting started with Figma training",
        duration: "2.39 min",
        preview: true,
      },
      {
        title: "What is Figma for & does it do the coding?",
        duration: "5.39 min",
      },
      {
        title: "Whats the difference between UI and UX in Figma",
        duration: "2.33 min",
      },
      {
        title: "What we are making in this Figma course",
        duration: "4.16 min",
      },
      {
        title: "Class project 01- Create your own brief",
        duration: "2.01 min",
      },
    ],
  },
  {
    title: "Wire framing – Low Fidelity",
    lessons: [
      {
        title: "Introduction to Figma Essentials training course",
        duration: "2.34 min",
        preview: true,
      },
    ],
  },
  { title: "Prototyping Level - 1", lessons: [] },
  { title: "Auto-layout and Constraints", lessons: [] },
  { title: "Prototyping Level - 2", lessons: [] },
  { title: "Components, Styles, Variants", lessons: [] },
];

const INITIAL_SHOW = 5;

export default function CourseContent() {
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
            className="text-sm cursor-pointer underline font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            {showAll ? "Show less" : "Show more"}
          </button>
        </div>
      </div>
    </div>
  );
}
