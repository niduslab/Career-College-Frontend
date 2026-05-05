"use client";
import { useState } from "react";

const FULL_TEXT = [
  "This professional certificate program provides a comprehensive introduction to cybersecurity, combining foundational IT knowledge with practical security skills. It is structured as a multi-course series that can typically be completed in about 3–4 months with flexible, self-paced learning. The course begins by covering essential IT concepts such as computer hardware, operating systems, networking, databases, and cloud computing.",
  "It then progresses into core cybersecurity topics, including threat detection, malware, phishing, social engineering, and risk management. Learners also explore key areas like network security, access control, incident response, and disaster recovery...",
];

export default function PartnerCourseDetailsDescription() {
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
          className="mt-4 sg-p-small underline cursor-pointer font-semibold text-(--primary-700)   transition-colors"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    </div>
  );
}
