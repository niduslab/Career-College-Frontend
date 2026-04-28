import { Check } from "lucide-react";

const LEFT = [
  "How to begin working as a UX Designer using Figma.",
  "How to make fully interactive prototypes.",
  "You will be able to add UX designer to your CV.",
  "What the client expects of you as a UX designer.",
  "How to implement colours & images properly in your designs.",
  "How to create your own icons, buttons & other UI components.",
];

const RIGHT = [
  "How to use Figma for Essential UX Design & UI Design",
  "How to make fully interactive prototypes.",
  "Build a UX project from beginning to end.",
  "How to create simple wireframes.",
  "The dos & don'ts around choosing fonts for web & mobile apps.",
  "Terms such as Components, Constraints & Multi Dimensional Variants.",
];

export default function WhatYouWillLearn() {
  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="sg-h5 font-semibold --title-text mb-4">
        What You Will Learn
      </h2>

      <div className=" rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
          {/* Left column */}
          <ul className="space-y-3">
            {LEFT.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 sg-caption font-normal --text-paragraph"
              >
                <span className="mt-0.5 text-gray-500 font-bold leading-none">
                  <Check size={16} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Right column */}
          <ul className="space-y-4 mt-3 md:mt-0">
            {RIGHT.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 sg-caption font-normal --text-paragraph"
              >
                <span className="mt-0.5 text-gray-400 font-bold leading-none">
                  <Check size={16} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Show more */}
        <div className="mt-4">
          <button className="cursor-pointer sg-p-small underline font-semibold text-(--primary-700)   transition-colors">
            Show more
          </button>
        </div>
      </div>
    </div>
  );
}
