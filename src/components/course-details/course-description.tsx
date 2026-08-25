"use client";
import { useState } from "react";
import { RichText } from "@/components/common/rich-text";

interface CourseDescriptionProps {
  description: string;
}

export default function CourseDescription({
  description,
}: CourseDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!description.trim()) return null;

  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="sg-h5 font-semibold --title-text mb-4">
        Course Description
      </h2>

      <div className=" rounded-xl border border-gray-200 shadow-sm p-6">
        <RichText
          html={description}
          className={`sg-p-small --text-paragraph leading-relaxed [&_p]:mb-3 last:[&_p]:mb-0 ${
            expanded ? "" : "line-clamp-4"
          }`}
        />

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 sg-p-small underline font-semibold text-(--primary-700) cursor-pointer transition-colors"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    </div>
  );
}
