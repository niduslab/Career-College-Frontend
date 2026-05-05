const REQUIREMENTS = [
  "No prior cybersecurity experience needed – the course starts from fundamentals",
  "No formal degree required – open to all learners",
  "Beginner-level program suitable for anyone interested in cybersecurity",
];

export default function PartnerCourseDetailsRequirements() {
  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="sg-h5 font-semibold --title-text mb-4">
        Course Requirements
      </h2>

      <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
        <ul className="space-y-4">
          {REQUIREMENTS.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 sg-p-small --text-paragraph"
            >
              <span className="mt-1.5 w-1.5 h-1.5 bg-(--text-title) rounded-full  shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
