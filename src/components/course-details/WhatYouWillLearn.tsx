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
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        What You Will Learn
      </h2>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
          {/* Left column */}
          <ul className="space-y-3">
            {LEFT.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-gray-600"
              >
                <span className="mt-0.5 text-gray-400 font-bold leading-none">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Right column */}
          <ul className="space-y-3 mt-3 md:mt-0">
            {RIGHT.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-gray-600"
              >
                <span className="mt-0.5 text-gray-400 font-bold leading-none">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Show more */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
            Show more
          </button>
        </div>
      </div>
    </div>
  );
}
