const REQUIREMENTS = [
  "A copy of Figma is free & available on the Figma website.",
  "Basic knowledge of Figma is required. I recommend watching my Figma Essentials course prior to embarking on the epic adventure.",
];

export default function Requirements() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Course Requirements</h2>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <ul className="space-y-3">
          {REQUIREMENTS.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
