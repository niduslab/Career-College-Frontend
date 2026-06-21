const activities = [
  {
    color: "bg-[var(--success-500)]",
    text: ["TechCorp signed a ", "new partnership agreement"],
  },
  {
    color: "bg-[var(--warning-500)]",
    text: ["Commission of ", "$3,200 processed"],
  },
  {
    color: "bg-[var(--primary-600)]",
    text: ["Greenfield University ", "onboarded successfully"],
  },
  {
    color: "bg-[var(--gray-300)]",
    text: ["Proposal sent to ", "Apex Solutions"],
  },
  {
    color: "bg-[var(--success-500)]",
    text: ["5-star review from ", "NovaTech Partners"],
  },
];

export default function PartnershipActivityPanel() {
  return (
    <div className="w-full xl:w-110 lg:w-75 shrink-0 flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-(--gray-200) p-6 flex-1">
        <h3 className="text-[16px] font-semibold text-(--text-title) mb-4">
          Recent Activity
        </h3>
        <ul className="space-y-3">
          {activities.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.color}`}
              />
              <span className="text-[12px] md:text-[14px] lg:text-[14px] leading-snug text-(--text-paragraph)">
                {a.text[0]}
                <span className="text-[#100D14] font-medium">{a.text[1]}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
