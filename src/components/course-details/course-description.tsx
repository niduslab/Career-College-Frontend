"use client";
import { useState } from "react";

const FULL_TEXT = [
  "Hi there, aspiring Figma enthusiast! Are you ready to embark on an exhilarating journey with me, Dan Scott, as we unlock the full potential of our Figma skills in the dazzling realm of UI/UX Design using Figma Advanced?",
  "We're not just learning basics around here – you're actually going to build something. In this course, you'll get your own project brief and personas, and by the end, you'll have a complete app ready to show straight into your portfolio. We've started moving beyond basics – you're actually going to build something. In this course, you'll get your own complete app ready to deep straight into your portfolio. We'll kick things off using #1 tools.",
  "Course length: 10+ hours.",
];

export default function CourseDescription() {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? FULL_TEXT : FULL_TEXT.slice(0, 1);

  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="sg-h5 font-semibold --title-text mb-4">
        Course Description
      </h2>

      <div className=" rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="space-y-4">
          {visible.map((para, i) => (
            <p key={i} className="sg-p-small --text-paragraph leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 sg-p-small underline font-semibold text-(--primary-700)   transition-colors"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    </div>
  );
}
