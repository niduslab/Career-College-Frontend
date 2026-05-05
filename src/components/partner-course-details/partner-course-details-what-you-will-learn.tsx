import { Check } from "lucide-react";

const LEFT = [
  "The job-ready skills needed to get your first cybersecurity role, plus prep for the ISC2 Certified in Cybersecurity (CC) exam employers look for.",
  "The most up-to-date practical skills and knowledge cybersecurity specialists use in their daily roles, supported by hands-on practical experience.",
];

const RIGHT = [
  "A solid grasp of IT essentials, including infrastructure, operating systems, network applications, data, hardware, and software.",
  "Working knowledge of different security threats, breaches, malware, social engineering, and other attack, and tools for preventing these threats.",
];

export default function PartnerCourseDetailsWhatYouWillLearn() {
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
                className="flex items-start gap-2 sg-p-small font-normal --text-paragraph"
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
                className="flex items-start gap-2 sg-p-small font-normal --text-paragraph"
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
